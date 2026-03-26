import { memo, useRef, useEffect } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { Card, Typography } from "antd";
import {
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import ReactECharts from "echarts-for-react";
import { useAppSelector } from "@/store/hooks";
import styles from "./OscilloscopeNode.module.css";

const { Text } = Typography;

/**
 * 递归展开数据，直到得到可渲染的原始值
 * 处理链：oscilloscope result → { data: dataset_result } → { data: [[...]] } → [[...]]
 */
function unwrapData(value: unknown, depth = 0): unknown {
  if (depth > 5) return value; // 防止无限递归
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    // 如果有 visualization 字段，优先返回整个对象供 buildChartOption 处理
    if (obj.visualization) return obj;
    // 如果有 data 字段，继续展开
    if ("data" in obj) return unwrapData(obj.data, depth + 1);
  }
  return value;
}

/**
 * 从示波器接收到的数据中，自动推断图表类型并生成 ECharts option
 */
function buildChartOption(vizData: Record<string, unknown> | null): object | null {
  if (!vizData) return null;

  // 如果上游节点已经给出了 visualization 结构，直接用
  const viz = vizData.visualization as { type: string; data: Record<string, unknown> } | undefined;
  if (viz) {
    return buildFromVisualization(viz.type, viz.data);
  }

  // 否则，递归展开数据后推断
  const raw = unwrapData(vizData.data ?? vizData);
  // 展开后可能又是带 visualization 的对象
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    const rawObj = raw as Record<string, unknown>;
    const innerViz = rawObj.visualization as { type: string; data: Record<string, unknown> } | undefined;
    if (innerViz) return buildFromVisualization(innerViz.type, innerViz.data);
  }
  return buildFromRaw(raw);
}

function buildFromVisualization(type: string, data: Record<string, unknown>): object | null {
  switch (type) {
    case "image": {
      const matrix = data.matrix as number[][];
      const width = data.width as number;
      const height = data.height as number;
      return {
        _customRender: 'image',
        matrix,
        width,
        height
      } as any;
    }
    case "scatter": {
      const points = (data.points as number[][] | undefined) ?? [];
      const ev = data.explainedVariance as number[] | undefined;
      const title = ev
        ? `PC1: ${(ev[0] * 100).toFixed(1)}%  PC2: ${(ev[1] * 100).toFixed(1)}%`
        : "散点图";
      return {
        title: { text: title, textStyle: { fontSize: 11 }, left: "center", top: 2 },
        grid: { left: 36, right: 8, top: 28, bottom: 28 },
        xAxis: { type: "value", name: "PC1", nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", name: "PC2", nameTextStyle: { fontSize: 10 }, axisLabel: { fontSize: 9 } },
        series: [{ type: "scatter", data: points.map((p) => [p[0], p[1]]), symbolSize: 5, itemStyle: { color: "#722ed1", opacity: 0.75 } }],
      };
    }
    case "convergence": {
      const history = (data.history as number[] | undefined) ?? [];
      const converged = data.converged as boolean | undefined;
      return {
        title: { text: converged ? "已收敛 ✓" : "收敛曲线", textStyle: { fontSize: 11 }, left: "center", top: 2 },
        grid: { left: 40, right: 8, top: 28, bottom: 28 },
        xAxis: { type: "category", data: history.map((_, i) => i + 1), axisLabel: { fontSize: 9, interval: Math.floor(history.length / 4) } },
        yAxis: { type: "log", logBase: 10, axisLabel: { fontSize: 9 } },
        series: [{ type: "line", data: history, smooth: true, lineStyle: { color: "#722ed1", width: 2 }, showSymbol: false }],
      };
    }
    case "regression": {
      const xData = (data.xData as number[][] | undefined) ?? [];
      const yData = (data.yData as number[] | undefined) ?? [];
      const predictions = (data.predictions as number[] | undefined) ?? [];
      const xVals = xData.map((r) => (Array.isArray(r) ? r[0] : r));
      const sorted = xVals.map((x, i) => ({ x, i })).sort((a, b) => a.x - b.x);
      return {
        title: { text: `R²=${(data.rSquared as number ?? 0).toFixed(3)}`, textStyle: { fontSize: 11 }, left: "center", top: 2 },
        grid: { left: 36, right: 8, top: 28, bottom: 28 },
        xAxis: { type: "value", axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", axisLabel: { fontSize: 9 } },
        series: [
          { type: "scatter", data: xVals.map((x, i) => [x, yData[i]]), symbolSize: 5, itemStyle: { color: "#5470c6", opacity: 0.7 } },
          { type: "line", data: sorted.map(({ x, i }) => [x, predictions[i]]), showSymbol: false, lineStyle: { color: "#722ed1", width: 2 } },
        ],
      };
    }
    case "matrix": {
      const sigma = (data.sigma as number[] | undefined) ?? [];
      return {
        title: { text: `奇异值 (rank=${data.rank ?? "?"})`, textStyle: { fontSize: 11 }, left: "center", top: 2 },
        grid: { left: 36, right: 8, top: 28, bottom: 28 },
        xAxis: { type: "category", data: sigma.map((_, i) => `σ${i + 1}`), axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", axisLabel: { fontSize: 9 } },
        series: [{ type: "bar", data: sigma, itemStyle: { color: "#722ed1" } }],
      };
    }
    default:
      return null;
  }
}

function buildFromRaw(raw: unknown): object | null {
  // 尝试识别为二维点数组 [[x,y], ...]
  if (Array.isArray(raw) && raw.length > 0) {
    const first = raw[0];
    if (Array.isArray(first) && first.length >= 2 && typeof first[0] === "number") {
      // 二维矩阵 → 散点图（取前两列）
      const points = (raw as number[][]).slice(0, 200);
      return {
        title: { text: "数据散点图", textStyle: { fontSize: 11 }, left: "center", top: 2 },
        grid: { left: 36, right: 8, top: 28, bottom: 28 },
        xAxis: { type: "value", axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", axisLabel: { fontSize: 9 } },
        series: [{ type: "scatter", data: points.map((p) => [p[0], p[1]]), symbolSize: 5, itemStyle: { color: "#722ed1", opacity: 0.75 } }],
      };
    }
    if (typeof first === "number") {
      // 一维数组 → 折线图
      return {
        title: { text: "数据折线图", textStyle: { fontSize: 11 }, left: "center", top: 2 },
        grid: { left: 36, right: 8, top: 28, bottom: 28 },
        xAxis: { type: "category", data: (raw as number[]).map((_, i) => i), axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", axisLabel: { fontSize: 9 } },
        series: [{ type: "line", data: raw as number[], showSymbol: false, lineStyle: { color: "#722ed1", width: 2 } }],
      };
    }
  }
  return null;
}

/**
 * 示波器节点
 * - 只有一个 input（接收任意数据）
 * - 执行后在节点内嵌渲染图表
 */
export const OscilloscopeNode = memo(({ id, data, selected }: NodeProps) => {
  const { executionResults } = useAppSelector((state) => state.orchestration);
  const result = executionResults[id] as Record<string, unknown> | undefined;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const status = data.status as string | undefined;
  const hasResult = result !== undefined;

  const chartOption = hasResult ? buildChartOption(result) : null;

  useEffect(() => {
    if (chartOption && (chartOption as any)._customRender === 'image' && canvasRef.current) {
      const { matrix, width, height } = chartOption as any;
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      const imageData = ctx.createImageData(width, height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const gray = matrix[y][x];
          imageData.data[i] = gray;
          imageData.data[i + 1] = gray;
          imageData.data[i + 2] = gray;
          imageData.data[i + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }, [chartOption]);

  const getStatusIcon = () => {
    switch (status) {
      case "running":
        return <LoadingOutlined spin style={{ color: "#722ed1" }} />;
      case "success":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "error":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return null;
    }
  };

  return (
    <div className={`${styles.oscilloscopeNode} ${selected ? styles.selected : ""}`}>
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{ top: "50%", background: "#722ed1" }}
        className={styles.handle}
      />

      <Card size="small" className={styles.card}>
        <div className={styles.header}>
          <span className={styles.icon}>📡</span>
          <Text strong className={styles.name}>
            {data.label || "示波器"}
          </Text>
          <span className={styles.statusIcon}>{getStatusIcon()}</span>
        </div>

        {/* 图表区域 */}
        <div className={styles.chartArea}>
          {chartOption && (chartOption as any)._customRender === 'image' ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'block',
                }}
              />
            </div>
          ) : chartOption ? (
            <ReactECharts
              option={chartOption}
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "canvas" }}
            />
          ) : (
            <div className={styles.idle}>
              <span>📡</span>
              <span>{status === "running" ? "执行中..." : "等待数据"}</span>
            </div>
          )}
        </div>

        {status === "error" && data.error && (
          <div className={styles.error}>{data.error as string}</div>
        )}
      </Card>
    </div>
  );
});

OscilloscopeNode.displayName = "OscilloscopeNode";
