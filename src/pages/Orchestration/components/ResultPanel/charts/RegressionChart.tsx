import React from "react";
import ReactECharts from "echarts-for-react";
import { Statistic } from "antd";

interface RegressionChartProps {
  data: {
    xData: number[][];
    yData: number[];
    predictions: number[];
    coefficients: number[];
    residuals?: number[];
    rSquared?: number;
  };
}

/**
 * 最小二乘回归图
 * 展示原始散点 + 拟合直线，旁边显示系数、R²、MSE
 */
const RegressionChart: React.FC<RegressionChartProps> = ({ data }) => {
  const {
    xData = [],
    yData = [],
    predictions = [],
    coefficients = [],
    rSquared = 0,
  } = data;

  // 取第一列作为 x 轴（简单线性回归）
  const xValues = xData.map((row) => (Array.isArray(row) ? row[0] : row));

  // 按 x 排序，用于绘制拟合线
  const sortedIndices = xValues
    .map((x, i) => ({ x, i }))
    .sort((a, b) => a.x - b.x)
    .map((item) => item.i);

  const scatterData = xValues.map((x, i) => [x, yData[i]]);
  const lineData = sortedIndices.map((i) => [xValues[i], predictions[i]]);

  // 系数：coefficients[0] 是截距，coefficients[1] 是斜率
  const intercept = coefficients[0] ?? 0;
  const slope = coefficients[1] ?? 0;

  // MSE
  const residuals = yData.map((y, i) => y - (predictions[i] ?? 0));
  const mse = residuals.reduce((s, r) => s + r * r, 0) / (residuals.length || 1);

  const option = {
    title: {
      text: `最小二乘回归（R² = ${rSquared.toFixed(4)}）`,
      textStyle: { fontSize: 13, fontWeight: "bold" },
      left: "center",
      top: 4,
    },
    tooltip: { trigger: "axis" },
    legend: {
      data: ["原始数据", "拟合直线"],
      top: 28,
      right: 10,
      textStyle: { fontSize: 11 },
    },
    grid: { left: 50, right: 20, top: 56, bottom: 36 },
    xAxis: {
      name: "x",
      nameLocation: "middle",
      nameGap: 22,
      type: "value",
      splitLine: { lineStyle: { type: "dashed" } },
    },
    yAxis: {
      name: "y",
      nameLocation: "middle",
      nameGap: 36,
      type: "value",
      splitLine: { lineStyle: { type: "dashed" } },
    },
    series: [
      {
        name: "原始数据",
        type: "scatter",
        data: scatterData,
        symbolSize: 8,
        itemStyle: { color: "#5470c6", opacity: 0.75 },
      },
      {
        name: "拟合直线",
        type: "line",
        data: lineData,
        smooth: false,
        lineStyle: { color: "#ee6666", width: 2 },
        itemStyle: { color: "#ee6666" },
        showSymbol: false,
      },
    ],
  };

  return (
    <div style={{ display: "flex", height: "100%", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
      <div style={{ width: 150, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 2 }}>拟合方程</div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            y = {slope.toFixed(4)}x + {intercept.toFixed(4)}
          </div>
        </div>
        <Statistic
          title="R²（决定系数）"
          value={rSquared.toFixed(4)}
          valueStyle={{ fontSize: 16, color: rSquared > 0.9 ? "#52c41a" : "#faad14" }}
        />
        <Statistic
          title="MSE"
          value={mse.toFixed(4)}
          valueStyle={{ fontSize: 16 }}
        />
        <Statistic
          title="样本数"
          value={yData.length}
          valueStyle={{ fontSize: 16 }}
        />
      </div>
    </div>
  );
};

export default RegressionChart;
