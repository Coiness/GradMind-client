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
    message.success("Parameters updated successfully");
  };

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
          title: `Col ${index + 1}`,
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
            <Title level={5}>Dataset Node</Title>
            <Tag color="blue">Dataset</Tag>
          </div>
          <Paragraph>
            This is a dataset node that provides input data to the workflow.
          </Paragraph>

          {datasetData && (
            <>
              <Divider />
              <div>
                <Text strong>Dataset Information:</Text>
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary">
                    {datasetData.metadata?.rows || datasetData.data.length} rows × {datasetData.metadata?.columns || datasetData.data[0]?.length || 0} columns
                  </Text>
                  {datasetData.metadata?.fileName && (
                    <>
                      <br />
                      <Text type="secondary">File: {datasetData.metadata.fileName}</Text>
                    </>
                  )}
                  <br />
                  <Text type="secondary">Type: {datasetData.type}</Text>
                </div>
              </div>

              <Divider />
              <div>
                <Text strong>Data Preview:</Text>
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
                    Showing first 10 rows of {datasetData.data.length}
                  </Text>
                )}
              </div>
            </>
          )}

          <Divider />
          <div>
            <Text strong>Node ID:</Text>
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
        <Text type="danger">Algorithm definition not found</Text>
      </div>
    );
  }

  // Get category display name
  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      "data-reduction": "Data Reduction",
      "analytical-optimization": "Analytical Optimization",
      "numerical-optimization": "Numerical Optimization",
      "parameter-estimation": "Parameter Estimation",
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
          <Text strong>Description:</Text>
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
            <Title level={5}>Parameters</Title>
            <ParameterPanel
              config={algorithm.parameters}
              onApply={handleParametersApply}
            />
          </div>
        ) : (
          <div>
            <Title level={5}>Parameters</Title>
            <Text type="secondary">No parameters available</Text>
          </div>
        )}

        <Divider />

        {/* Node Info */}
        <div>
          <Text strong>Node ID:</Text>
          <br />
          <Text type="secondary" style={{ fontSize: 12 }}>
            {node.id}
          </Text>
        </div>
      </Space>
    </div>
  );
};
