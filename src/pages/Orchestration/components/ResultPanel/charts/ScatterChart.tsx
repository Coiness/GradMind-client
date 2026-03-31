import React from "react";
import ReactECharts from "echarts-for-react";
import { Statistic } from "antd";
import { useTheme } from "@/contexts/ThemeContext";

interface ScatterChartProps {
  data: {
    points: number[][];
    variance?: number[];
    explainedVariance?: number[];
    cumulativeVariance?: number[];
  };
}

/**
 * PCA 散点图
 * 展示降维后的点分布，以及解释方差信息
 */
const ScatterChart: React.FC<ScatterChartProps> = ({ data }) => {
  const { points = [], explainedVariance = [], cumulativeVariance = [] } = data;
  const { theme } = useTheme();

  const pc1Pct =
    explainedVariance[0] != null
      ? (explainedVariance[0] * 100).toFixed(1)
      : "—";
  const pc2Pct =
    explainedVariance[1] != null
      ? (explainedVariance[1] * 100).toFixed(1)
      : "—";
  const cumPct =
    cumulativeVariance[1] != null
      ? (cumulativeVariance[1] * 100).toFixed(1)
      : cumulativeVariance[0] != null
        ? (cumulativeVariance[0] * 100).toFixed(1)
        : "—";

  const option = {
    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
    title: {
      text: `PCA 降维结果（PC1: ${pc1Pct}%，PC2: ${pc2Pct}%）`,
      textStyle: { fontSize: 13, fontWeight: "bold", color: theme === 'dark' ? '#e2e8f0' : '#000' },
      left: "center",
      top: 4,
    },
    tooltip: {
      trigger: "item",
      formatter: (params: { data: number[] }) =>
        `PC1: ${params.data[0].toFixed(3)}<br/>PC2: ${params.data[1].toFixed(3)}`,
    },
    grid: { left: 50, right: 20, top: 40, bottom: 36 },
    xAxis: {
      name: "PC1",
      nameLocation: "middle",
      nameGap: 22,
      type: "value",
      splitLine: { lineStyle: { type: "dashed", color: theme === 'dark' ? '#334155' : '#e5e7eb' } },
      axisLine: { lineStyle: { color: theme === 'dark' ? '#64748b' : '#999' } },
      axisLabel: { color: theme === 'dark' ? '#94a3b8' : '#666' },
      nameTextStyle: { color: theme === 'dark' ? '#94a3b8' : '#666' }
    },
    yAxis: {
      name: "PC2",
      nameLocation: "middle",
      nameGap: 32,
      type: "value",
      splitLine: { lineStyle: { type: "dashed", color: theme === 'dark' ? '#334155' : '#e5e7eb' } },
      axisLine: { lineStyle: { color: theme === 'dark' ? '#64748b' : '#999' } },
      axisLabel: { color: theme === 'dark' ? '#94a3b8' : '#666' },
      nameTextStyle: { color: theme === 'dark' ? '#94a3b8' : '#666' }
    },
    series: [
      {
        type: "scatter",
        data: points.map((p) => [p[0], p[1]]),
        symbolSize: 8,
        itemStyle: { color: "#5470c6", opacity: 0.8 },
      },
    ],
  };

  return (
    <div style={{ display: "flex", height: "100%", gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ReactECharts option={option} style={{ height: "100%" }} />
      </div>
      <div
        style={{
          width: 140,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <Statistic
          title="PC1 解释方差"
          value={`${pc1Pct}%`}
          valueStyle={{ fontSize: 16 }}
        />
        <Statistic
          title="PC2 解释方差"
          value={`${pc2Pct}%`}
          valueStyle={{ fontSize: 16 }}
        />
        <Statistic
          title="累积方差"
          value={`${cumPct}%`}
          valueStyle={{ fontSize: 16, color: "#52c41a" }}
        />
        <Statistic
          title="样本数"
          value={points.length}
          valueStyle={{ fontSize: 16 }}
        />
      </div>
    </div>
  );
};

export default ScatterChart;
