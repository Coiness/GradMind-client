import React from "react";
import { Table, Statistic, Row, Col, Divider } from "antd";
import ReactECharts from "echarts-for-react";
import { useTheme } from "@/contexts/ThemeContext";

interface MatrixViewProps {
  data: {
    u: number[][];
    sigma: number[];
    vt: number[][];
    rank?: number;
    conditionNumber?: number;
  };
}

/** 将矩阵转换为 Ant Design Table 的 columns + dataSource */
function matrixToTable(matrix: number[][], label: string, theme: 'light' | 'dark') {
  if (!matrix || matrix.length === 0) return { columns: [], dataSource: [] };

  const cols = matrix[0].length;
  const columns = [
    {
      title: label,
      dataIndex: "row",
      key: "row",
      width: 48,
      render: (_: unknown, __: unknown, index: number) => (
        <span style={{ color: theme === 'dark' ? '#94a3b8' : '#888', fontSize: 11 }}>r{index + 1}</span>
      ),
    },
    ...Array.from({ length: cols }, (_, j) => ({
      title: `c${j + 1}`,
      dataIndex: `c${j}`,
      key: `c${j}`,
      width: 72,
      render: (val: number) => (
        <span style={{ fontSize: 11, fontFamily: "monospace" }}>
          {val.toFixed(4)}
        </span>
      ),
    })),
  ];

  const dataSource = matrix.map((row, i) => ({
    key: i,
    ...Object.fromEntries(row.map((v, j) => [`c${j}`, v])),
  }));

  return { columns, dataSource };
}

/**
 * SVD 矩阵展示
 * - U 矩阵：表格
 * - Σ（奇异值）：小型柱状图
 * - V^T 矩阵：表格
 * - 显示矩阵秩和条件数
 */
const MatrixView: React.FC<MatrixViewProps> = ({ data }) => {
  const { u = [], sigma = [], vt = [], rank, conditionNumber } = data;
  const { theme } = useTheme();

  const uTable = matrixToTable(u, "U", theme);
  const vtTable = matrixToTable(vt, "V^T", theme);

  const sigmaOption = {
    backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
    title: {
      text: "奇异值 Σ（能量分布）",
      textStyle: { fontSize: 12, color: theme === 'dark' ? '#e2e8f0' : '#000' },
      left: "center",
      top: 2,
    },
    tooltip: {
      trigger: "axis",
      formatter: (params: Array<{ dataIndex: number; data: number }>) =>
        `σ${params[0].dataIndex + 1} = ${params[0].data.toFixed(4)}`,
    },
    grid: { left: 40, right: 10, top: 32, bottom: 28 },
    xAxis: {
      type: "category",
      data: sigma.map((_, i) => `σ${i + 1}`),
      axisLabel: { fontSize: 11, color: theme === 'dark' ? '#94a3b8' : '#666' },
      axisLine: { lineStyle: { color: theme === 'dark' ? '#64748b' : '#999' } }
    },
    yAxis: {
      type: "value",
      axisLabel: { fontSize: 10, color: theme === 'dark' ? '#94a3b8' : '#666' },
      axisLine: { lineStyle: { color: theme === 'dark' ? '#64748b' : '#999' } },
      splitLine: { lineStyle: { color: theme === 'dark' ? '#334155' : '#e5e7eb' } }
    },
    series: [
      {
        type: "bar",
        data: sigma,
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            const colors = [
              "#5470c6",
              "#91cc75",
              "#fac858",
              "#ee6666",
              "#73c0de",
            ];
            return colors[params.dataIndex % colors.length];
          },
        },
        label: {
          show: sigma.length <= 6,
          position: "top",
          fontSize: 10,
          formatter: (params: { data: number }) => params.data.toFixed(2),
        },
      },
    ],
  };

  const tableScroll = { x: true as const, y: 80 };
  const tableSize = "small" as const;

  return (
    <div
      style={{ display: "flex", height: "100%", gap: 8, overflow: "hidden" }}
    >
      {/* 左：U 矩阵 */}
      <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
            color: "#5470c6",
          }}
        >
          U 矩阵（{u.length}×{u[0]?.length ?? 0}）
        </div>
        <Table
          columns={uTable.columns}
          dataSource={uTable.dataSource}
          size={tableSize}
          pagination={false}
          scroll={tableScroll}
          style={{ fontSize: 11 }}
        />
      </div>

      {/* 中：奇异值柱状图 + 统计信息 */}
      <div
        style={{ width: 180, display: "flex", flexDirection: "column", gap: 4 }}
      >
        <div style={{ flex: 1, minHeight: 0 }}>
          <ReactECharts
            option={sigmaOption}
            style={{ height: "100%", minHeight: 120 }}
          />
        </div>
        <Divider style={{ margin: "4px 0" }} />
        <Row gutter={4}>
          <Col span={12}>
            <Statistic
              title="矩阵秩"
              value={rank ?? "—"}
              valueStyle={{ fontSize: 14 }}
            />
          </Col>
          <Col span={12}>
            <Statistic
              title="条件数"
              value={
                conditionNumber != null && isFinite(conditionNumber)
                  ? conditionNumber.toFixed(2)
                  : "∞"
              }
              valueStyle={{ fontSize: 14 }}
            />
          </Col>
        </Row>
      </div>

      {/* 右：V^T 矩阵 */}
      <div style={{ flex: 1, minWidth: 0, overflow: "auto" }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 4,
            color: "#ee6666",
          }}
        >
          V^T 矩阵（{vt.length}×{vt[0]?.length ?? 0}）
        </div>
        <Table
          columns={vtTable.columns}
          dataSource={vtTable.dataSource}
          size={tableSize}
          pagination={false}
          scroll={tableScroll}
          style={{ fontSize: 11 }}
        />
      </div>
    </div>
  );
};

export default MatrixView;
