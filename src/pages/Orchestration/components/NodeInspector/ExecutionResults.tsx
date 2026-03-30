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
  console.log("🔍 [ExecutionResults] Rendering with:", {
    nodeId: node.id,
    nodeLabel: node.data.label,
    nodeStatus: node.data.status,
    hasResult: result !== null && result !== undefined,
    result: result,
    nodeDataResult: node.data.result,
  });

  // Check if node has been executed
  const hasResult = result !== null && result !== undefined;
  const nodeStatus = node.data.status;

  // Error state (check first)
  if (nodeStatus === "error") {
    console.log("❌ [ExecutionResults] Showing error state");
    return (
      <div className={styles.executionResults}>
        <Tag color="error" style={{ marginBottom: 16 }}>
          执行失败
        </Tag>
        <div>
          <Text strong>错误信息：</Text>
          <Paragraph style={{ marginTop: 8 }}>
            <Text type="danger">{node.data.error || "发生未知错误"}</Text>
          </Paragraph>
        </div>
      </div>
    );
  }

  // Success state with results
  if (hasResult || nodeStatus === "success") {
    console.log("✅ [ExecutionResults] Showing success state with result");
    return (
      <div className={styles.executionResults}>
        <div className={styles.successHeader}>
          <CheckCircleOutlined className={styles.successIcon} />
          <Title level={5} style={{ margin: 0 }}>
            执行成功
          </Title>
        </div>

        <div className={styles.resultContent}>
          <Text strong>结果：</Text>
          <div className={styles.resultData}>
            <pre className={styles.resultJson}>
              {JSON.stringify(result || node.data.result, null, 2)}
            </pre>
          </div>
        </div>

        {/* Result metadata */}
        {(result || node.data.result) &&
          typeof (result || node.data.result) === "object" && (
            <div className={styles.metadata}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                结果类型:{" "}
                {Array.isArray(result || node.data.result)
                  ? "数组"
                  : typeof (result || node.data.result)}
              </Text>
              {Array.isArray(result || node.data.result) && (
                <>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    长度: {(result || node.data.result).length}
                  </Text>
                </>
              )}
            </div>
          )}
      </div>
    );
  }

  // Empty state when not executed
  console.log("📭 [ExecutionResults] Showing empty state");
  return (
    <div className={styles.executionResults}>
      <Empty description="节点尚未执行" image={Empty.PRESENTED_IMAGE_SIMPLE} />
    </div>
  );
};
