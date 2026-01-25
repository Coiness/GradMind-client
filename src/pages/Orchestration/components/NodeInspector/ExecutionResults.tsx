import React from "react";
import { Typography, Empty, Tag } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import type { WorkflowNode } from "@/types/workflow";
import styles from "./ExecutionResults.module.css";

const { Title, Text, Paragraph } = Typography;

interface ExecutionResultsProps {
  node: WorkflowNode;
  result: any;
}

/**
 * ExecutionResults Component
 * Displays execution results for the selected node
 */
export const ExecutionResults: React.FC<ExecutionResultsProps> = ({
  node,
  result,
}) => {
  // Check if node has been executed
  const hasResult = result !== null && result !== undefined;
  const nodeStatus = node.data.status;

  // Empty state when not executed
  if (!hasResult && nodeStatus !== "success") {
    return (
      <div className={styles.executionResults}>
        <Empty
          description="Node has not been executed yet"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // Error state
  if (nodeStatus === "error") {
    return (
      <div className={styles.executionResults}>
        <Tag color="error" style={{ marginBottom: 16 }}>
          Execution Failed
        </Tag>
        <div>
          <Text strong>Error Message:</Text>
          <Paragraph style={{ marginTop: 8 }}>
            <Text type="danger">{node.data.error || "Unknown error occurred"}</Text>
          </Paragraph>
        </div>
      </div>
    );
  }

  // Success state with results
  return (
    <div className={styles.executionResults}>
      <div className={styles.successHeader}>
        <CheckCircleOutlined className={styles.successIcon} />
        <Title level={5} style={{ margin: 0 }}>
          Execution Successful
        </Title>
      </div>

      <div className={styles.resultContent}>
        <Text strong>Result:</Text>
        <div className={styles.resultData}>
          <pre className={styles.resultJson}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      </div>

      {/* Result metadata */}
      {result && typeof result === "object" && (
        <div className={styles.metadata}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Result Type: {Array.isArray(result) ? "Array" : typeof result}
          </Text>
          {Array.isArray(result) && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                Length: {result.length}
              </Text>
            </>
          )}
        </div>
      )}
    </div>
  );
};
