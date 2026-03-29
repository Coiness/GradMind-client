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
    case "image-collection": {
      // 专为 K-Means 图像分割设计的多图层展示
      const mainImage = data.mainImage as number[][];
      const layers = data.layers as number[][][];
      const width = data.width as number;
      const height = data.height as number;
      return {
        _customRender: 'image-collection',
        mainImage,
        layers,
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
      
      // 判断是否需要使用对数坐标（如果值跨度大，且全为正数，则使用对数坐标更好看）
      const useLogScale = history.length > 0 && history.every(v => v > 0) && (Math.max(...history) / Math.min(...history)) > 100;
      
      return {
        title: { text: converged ? "已收敛 ✓" : "收敛曲线", textStyle: { fontSize: 11 }, left: "center", top: 2 },
        grid: { left: 40, right: 8, top: 28, bottom: 28 },
        xAxis: { type: "category", data: history.map((_, i) => i + 1), axisLabel: { fontSize: 9, interval: Math.floor(history.length / 4) } },
        yAxis: { type: useLogScale ? "log" : "value", logBase: 10, axisLabel: { fontSize: 9 } },
        series: [{ type: "line", data: history, smooth: true, lineStyle: { color: "#722ed1", width: 2 }, showSymbol: false }],
      };
    }
    case "training": {
      const loss = (data.trainingLoss as number[] | undefined) ?? [];
      const acc = (data.accuracyHistory as number[] | undefined);
      const series: any[] = [
        { name: "Loss", type: "line", data: loss, smooth: true, lineStyle: { color: "#ff4d4f", width: 2 }, showSymbol: false }
      ];
      const yAxis: any[] = [
        { type: "value", name: "Loss", axisLabel: { fontSize: 9 } }
      ];
      if (acc) {
        series.push({ name: "Accuracy", type: "line", yAxisIndex: 1, data: acc, smooth: true, lineStyle: { color: "#52c41a", width: 2 }, showSymbol: false });
        yAxis.push({ type: "value", name: "Acc", min: 0, max: 1, axisLabel: { fontSize: 9 } });
      }
      return {
        title: { text: "神经网络训练过程", textStyle: { fontSize: 11 }, left: "center", top: 2 },
        tooltip: { trigger: 'axis' },
        legend: { data: acc ? ["Loss", "Accuracy"] : ["Loss"], top: 20, itemSize: 8, textStyle: { fontSize: 9 } },
        grid: { left: 40, right: acc ? 40 : 8, top: 40, bottom: 28 },
        xAxis: { type: "category", data: loss.map((_, i) => i + 1), axisLabel: { fontSize: 9, interval: Math.floor(loss.length / 4) } },
        yAxis,
        series,
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
      const isFullMatrices = data.isFullMatrices as boolean | undefined;
      const uShape = data.uShape as [number, number] | undefined;
      const vShape = data.vShape as [number, number] | undefined;
      
      let subtitle = `rank=${data.rank ?? "?"}`;
      if (isFullMatrices && uShape && vShape) {
        subtitle += ` | 完整模式 (U:${uShape[0]}x${uShape[1]}, V:${vShape[0]}x${vShape[1]})`;
      } else if (uShape && vShape) {
        subtitle += ` | 经济模式 (U:${uShape[0]}x${uShape[1]}, V:${vShape[0]}x${vShape[1]})`;
      }

      return {
        title: { text: `奇异值分布`, subtext: subtitle, textStyle: { fontSize: 11 }, subtextStyle: { fontSize: 9 }, left: "center", top: 2 },
        grid: { left: 36, right: 8, top: 35, bottom: 28 },
        xAxis: { type: "category", data: sigma.map((_, i) => `σ${i + 1}`), axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", axisLabel: { fontSize: 9 } },
        series: [{ type: "bar", data: sigma, itemStyle: { color: "#722ed1" } }],
      };
    }
  case "scatter-clusters": {
      const points = (data.points as number[][] | undefined) ?? [];
      const centroids = (data.centroids as number[][] | undefined) ?? [];
      
      // 按 clusterId 分组
      const clusters: Record<number, number[][]> = {};
      points.forEach(p => {
        const cId = p[2] || 0;
        if (!clusters[cId]) clusters[cId] = [];
        clusters[cId].push([p[0], p[1]]);
      });

      const series = Object.entries(clusters).map(([cId, data]) => ({
        name: `Cluster ${cId}`,
        type: "scatter",
        data,
        symbolSize: 6,
        itemStyle: { opacity: 0.8 }
      }));

      // 添加质心
      if (centroids.length > 0) {
        series.push({
          name: "Centroids",
          type: "scatter",
          data: centroids,
          symbolSize: 15,
          itemStyle: { color: "#ff0000", borderColor: "#fff", borderWidth: 2 },
          zlevel: 10 // 确保质心渲染在最上层
        } as any);
      }

      return {
        title: { text: "聚类散点图", textStyle: { fontSize: 11 }, left: "center", top: 2 },
        tooltip: {
          trigger: "item",
          formatter: function (params: any) {
            return `${params.seriesName}<br/>X: ${params.data[0]}<br/>Y: ${params.data[1]}`;
          }
        },
        grid: { left: 36, right: 8, top: 28, bottom: 28 },
        xAxis: { type: "value", scale: true, axisLabel: { fontSize: 9 } },
        yAxis: { type: "value", scale: true, axisLabel: { fontSize: 9 } },
        color: ["#1890ff", "#2fc25b", "#facc14", "#8543e0", "#13c2c2", "#fa8c16"],
        series,
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
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "cross" },
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          borderColor: "#ccc",
          borderWidth: 1,
          textStyle: { color: "#333" }
        },
        grid: { left: 36, right: 8, top: 28, bottom: 28, containLabel: true },
        toolbox: {
          feature: {
            dataZoom: { yAxisIndex: 'none' },
            restore: {},
            saveAsImage: {}
          }
        },
        dataZoom: [
          { type: 'inside', start: 0, end: 100 },
          { start: 0, end: 100 }
        ],
        xAxis: { type: "value", axisLabel: { fontSize: 9 }, splitLine: { show: true, lineStyle: { type: "dashed", color: "#eee" } } },
        yAxis: { type: "value", axisLabel: { fontSize: 9 }, splitLine: { show: true, lineStyle: { type: "dashed", color: "#eee" } } },
        animation: true,
        animationDuration: 1000,
        animationEasing: 'cubicOut',
        color: [
          "#1890ff", "#2fc25b", "#facc14", "#f04864", "#8543e0", "#13c2c2", "#fa8c16", "#a0d911"
        ],
        series: [
          { 
            type: "scatter", 
            data: points.map((p) => [p[0], p[1]]), 
            symbolSize: 6, 
            itemStyle: { color: "#1890ff", opacity: 0.8 } 
          }
        ],
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
    if (!chartOption) return;

    // 单张图像渲染
    if ((chartOption as any)._customRender === 'image' && canvasRef.current) {
      const { matrix, width, height } = chartOption as any;
      const canvas = canvasRef.current;
      
      // 添加清空画布逻辑，防止多次渲染残留
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      canvas.width = width;
      canvas.height = height;
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
    
    // 多图层图像渲染 (K-Means)
    if ((chartOption as any)._customRender === 'image-collection' && canvasRef.current) {
      const { mainImage, layers, width, height } = chartOption as any;
      const canvas = canvasRef.current;
      
      // 添加清空画布逻辑，防止多次渲染残留
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // 我们在单个 canvas 上，将多张图片水平拼接展示，或者缩小展示
      const padding = 10;
      const totalLayers = layers.length + 1; // 1张合成图 + K张分层图
      const scaledWidth = Math.min(width, 150); // 每张图最大150px宽，防止撑爆
      const scale = scaledWidth / width;
      const scaledHeight = height * scale;
      
      // 计算总宽度 (所有图片排成一排，如果太宽就换行，这里简单起见排成网格)
      const cols = Math.ceil(Math.sqrt(totalLayers));
      const rows = Math.ceil(totalLayers / cols);
      
      canvas.width = cols * (scaledWidth + padding) + padding;
      canvas.height = rows * (scaledHeight + padding) + padding;
      
      ctx.fillStyle = '#f0f2f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // 辅助函数：绘制单张矩阵到指定位置
      const drawMatrix = (matrix: number[][], offsetX: number, offsetY: number, label: string) => {
        // 先画到一个离屏 canvas 上，再缩放画到主 canvas
        const offCanvas = document.createElement('canvas');
        offCanvas.width = width;
        offCanvas.height = height;
        const offCtx = offCanvas.getContext('2d')!;
        const imgData = offCtx.createImageData(width, height);
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const gray = matrix[y][x];
            imgData.data[i] = gray;
            imgData.data[i + 1] = gray;
            imgData.data[i + 2] = gray;
            imgData.data[i + 3] = 255;
          }
        }
        offCtx.putImageData(imgData, 0, 0);
        ctx.drawImage(offCanvas, offsetX, offsetY, scaledWidth, scaledHeight);
        
        // 画标签
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.fillText(label, offsetX, offsetY - 2);
      };
      
      // 画主图
      let curCol = 0;
      let curRow = 0;
      drawMatrix(mainImage, padding + curCol * (scaledWidth + padding), padding + curRow * (scaledHeight + padding), "合成效果");
      curCol++;
      
      // 画分层图
      layers.forEach((layer: number[][], idx: number) => {
        if (curCol >= cols) {
          curCol = 0;
          curRow++;
        }
        drawMatrix(layer, padding + curCol * (scaledWidth + padding), padding + curRow * (scaledHeight + padding), `图层 ${idx + 1}`);
        curCol++;
      });
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
          {chartOption && ((chartOption as any)._customRender === 'image' || (chartOption as any)._customRender === 'image-collection') ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto' }}>
              <canvas
                ref={canvasRef}
                key={`canvas-${Date.now()}`} // 强制重新挂载 canvas，防止上下文残留
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  display: 'block',
                }}
              />
            </div>
          ) : chartOption ? (
            <ReactECharts
              key={`echarts-${Date.now()}`} // 强制 ECharts 实例在数据更新时重建，防止渲染叠加或遗留
              option={chartOption}
              style={{ height: "100%", width: "100%" }}
              opts={{ renderer: "canvas" }}
              notMerge={true} // 强制 ECharts 不合并旧数据
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
