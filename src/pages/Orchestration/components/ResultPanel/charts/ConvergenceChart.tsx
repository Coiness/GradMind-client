import React from "react";
import ReactECharts from "echarts-for-react";
import { Statistic, Tag } from "antd";

interface ConvergenceChartProps {
  data: {
    history: number[];
    points?: number[][];
    gradientNorms?: number[];
    solution?: number[];
    iterations?: number;
    converged?: boolean;
  };
}

/**
 * 梯度下降收敛曲线
 * 展示目标函数值随迭代次数的变化（对数坐标）
 */
const ConvergenceChart: React.FC<ConvergenceChartProps> = ({ data }) => {
  const {
    history = [],
    solution = [],
    iterations = 0,
    converged = false,
  } = data;

  const finalValue = history[history.length - 1] ?? 0;
  const xAxisData = history.map((_, i) => i + 1);

  // 判断是否适合使用对数坐标（所有值 > 0）
  const useLog = history.length > 0 && history.every((v) => v > 0);

  const option = {
    title: {
      text: `收敛过程（${iterations} 次迭代，${converged ? "已收敛 ✓" : "未收敛"}）`,
      textStyle: { fontSize: 13, fontWeight: "bold" },
      left: "center",
      top: 4,
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: Array<{ dataIndex: number; data: number }>) => {
        const p = params[0];
        return `迭代 ${p.dataIndex + 1}<br/>目标值: ${p.data.toExponential(4)}`;
      },
    },
    grid: { left: 60, right: 20, top: 40, bottom: 36 },
    xAxis: {
      name: "迭代次数",
      nameLocation: "middle",
      nameGap: 22,
      type: "category",
      data: xAxisData,
      axisLabel: { interval: Math.floor(history.length / 5) },
    },
    yAxis: {
      name: "目标函数值",
      nameLocation: "middle",
      nameGap: 48,
      type: useLog ? "log" : "value",
      logBase: 10,
    },
    series: [
      {
        type: "line",
        data: history,
        smooth: true,
        lineStyle: { color: "#ee6666", width: 2 },
        itemStyle: { color: "#ee6666" },
        showSymbol: history.length <= 20,
        symbolSize: 5,
        areaStyle: { color: "rgba(238,102,102,0.08)" },
      },
    ],
  };

  const solutionStr =
    solution.length > 0
      ? `[${solution.map((v) => v.toFixed(4)).join(", ")}]`
      : "—";

  return (
    <div style={{ display: "flex", height: "100%", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
      <div
        style={{
          width: 150,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>
            收敛状态
          </div>
          <Tag color={converged ? "success" : "warning"}>
            {converged ? "已收敛" : "未收敛"}
          </Tag>
        </div>
        <Statistic
          title="迭代次数"
          value={iterations}
          valueStyle={{ fontSize: 16 }}
        />
        <Statistic
          title="最终目标值"
          value={finalValue.toExponential(4)}
          valueStyle={{ fontSize: 14 }}
        />
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>
            最优点
          </div>
          <div style={{ fontSize: 12, wordBreak: "break-all" }}>
            {solutionStr}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConvergenceChart;
