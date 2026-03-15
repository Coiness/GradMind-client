import React from "react";
import { Typography, Tag, Divider, Space, message, Table } from "antd";
import { useAppDispatch } from "@/store/hooks";
import { updateNodeParameters } from "@/store/features/orchestrationSlice";
import { ParameterPanel } from "@/components/ParameterPanel";
import { PortsInfo } from "./PortsInfo";
import type { WorkflowNode } from "@/types/workflow";
import type { AlgorithmNode } from "@/types/algorithmNode";
import type { ParameterValues } from "@/types/parameterConfig";
import styles from "./AlgorithmInfo.module.css";

const { Title, Text, Paragraph } = Typography;

interface AlgorithmInfoProps {
  node: WorkflowNode;
  algorithm: AlgorithmNode | null;
}

/**
 * AlgorithmInfo Component
 * Displays algorithm details, ports, and parameter editor
 */
export const AlgorithmInfo: React.FC<AlgorithmInfoProps> = ({
  node,
  algorithm,
}) => {
  const dispatch = useAppDispatch();

  // Handle parameter changes
  const handleParametersApply = (parameters: ParameterValues) => {
    dispatch(updateNodeParameters({ nodeId: node.id, parameters }));
    message.success("参数更新成功");
  };

  // Handle oscilloscope nodes
  if (node.type === "oscilloscope") {
    return (
      <div className={styles.algorithmInfo}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Title level={5}>示波器</Title>
            <Tag color="purple">可视化工具</Tag>
          </div>
          <Paragraph>
            示波器节点接收上游算法或数据集的输出，自动识别数据结构并渲染图表（散点图、折线图、柱状图等）。
          </Paragraph>
          <Divider />
          <div>
            <Text strong>输入端口：</Text>
            <div style={{ marginTop: 8 }}>
              <Tag>input</Tag>
              <Text type="secondary" style={{ marginLeft: 8 }}>任意数据（自动识别类型）</Text>
            </div>
          </div>
          <Divider />
          <div>
            <Text strong>节点 ID：</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>{node.id}</Text>
          </div>
        </Space>
      </div>
    );
  }

  // Handle dataset nodes
  if (node.type === "dataset") {
    const datasetData = node.data.datasetData;

    // Prepare table columns
    const columns = datasetData?.headers
      ? datasetData.headers.map((header, index) => ({
          title: header,
          dataIndex: index,
          key: index,
          width: 100,
        }))
      : datasetData?.data[0]?.map((_, index) => ({
          title: `列 ${index + 1}`,
          dataIndex: index,
          key: index,
          width: 100,
        })) || [];

    // Prepare table data (show first 10 rows)
    const tableData = datasetData?.data.slice(0, 10).map((row, rowIndex) => {
      const rowData: any = { key: rowIndex };
      row.forEach((value, colIndex) => {
        rowData[colIndex] = value;
      });
      return rowData;
    }) || [];

    return (
      <div className={styles.algorithmInfo}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <div>
            <Title level={5}>数据集节点</Title>
            <Tag color="blue">数据集</Tag>
          </div>
          <Paragraph>
            这是一个数据集节点，为工作流提供输入数据。
          </Paragraph>

          {datasetData && (
            <>
              <Divider />
              <div>
                <Text strong>数据集信息：</Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    {datasetData.metadata?.rows || datasetData.data.length} 行 × {datasetData.metadata?.columns || datasetData.data[0]?.length || 0} 列
                  </Text>
                  {datasetData.metadata?.fileName && (
                    <>
                      <br />
                      <Text type="secondary">文件: {datasetData.metadata.fileName}</Text>
                    </>
                  )}
                  <br />
                  <Text type="secondary">类型: {datasetData.type}</Text>
                </div>
              </div>

              <Divider />
              <div>
                <Text strong>数据预览：</Text>
                <Table
                  columns={columns}
                  dataSource={tableData}
                  pagination={false}
                  scroll={{ x: "max-content", y: 200 }}
                  size="small"
                  style={{ marginTop: 8 }}
                />
                {datasetData.data.length > 10 && (
                  <Text type="secondary" style={{ display: "block", marginTop: 8, fontSize: 12 }}>
                    显示前 10 行，共 {datasetData.data.length} 行
                  </Text>
                )}
              </div>
            </>
          )}

          <Divider />
          <div>
            <Text strong>节点 ID：</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {node.id}
            </Text>
          </div>
        </Space>
      </div>
    );
  }

  // Handle algorithm nodes without algorithm definition
  if (!algorithm) {
    return (
      <div className={styles.algorithmInfo}>
        <Text type="danger">未找到算法定义</Text>
      </div>
    );
  }

  // Get category display name
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      "data-reduction": "数据降维",
      "analytical-optimization": "解析优化",
      "numerical-optimization": "数值优化",
      "parameter-estimation": "参数估计",
    };
    return categoryMap[category] || category;
  };

  return (
    <div className={styles.algorithmInfo}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Algorithm Header */}
        <div>
          <div className={styles.algorithmHeader}>
            {algorithm.icon && (
              <span className={styles.algorithmIcon}>{algorithm.icon}</span>
            )}
            <Title level={5} style={{ margin: 0 }}>
              {algorithm.name}
            </Title>
          </div>
          <Tag color="blue" style={{ marginTop: 8 }}>
            {getCategoryName(algorithm.category)}
          </Tag>
        </div>

        {/* Description */}
        <div>
          <Text strong>描述：</Text>
          <Paragraph style={{ marginTop: 8 }}>
            {algorithm.description}
          </Paragraph>
        </div>

        <Divider />

        {/* Ports Information */}
        <PortsInfo algorithm={algorithm} />

        <Divider />

        {/* Parameters */}
        {algorithm.parameters && algorithm.parameters.length > 0 ? (
          <div>
            <Title level={5}>参数</Title>
            <ParameterPanel
              config={algorithm.parameters}
              onApply={handleParametersApply}
            />
          </div>
        ) : (
          <div>
            <Title level={5}>参数</Title>
            <Text type="secondary">无可用参数</Text>
          </div>
        )}

        <Divider />

        {/* Node Info */}
        <div>
          <Text strong>节点 ID：</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {node.id}
          </Text>
        </div>
      </Space>
    </div>
  );
};
