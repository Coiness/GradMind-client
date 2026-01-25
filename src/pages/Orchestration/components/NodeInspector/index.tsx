import React from "react";
import { Tabs, Empty, Typography } from "antd";
import { useAppSelector } from "@/store/hooks";
import { AlgorithmInfo } from "./AlgorithmInfo";
import { ExecutionResults } from "./ExecutionResults";
import { ValidationErrors } from "./ValidationErrors";
import styles from "./index.module.css";

const { Title } = Typography;

/**
 * NodeInspector Component
 * Right panel that displays detailed information about the selected node
 */
export const NodeInspector: React.FC = () => {
  const { selectedNodeId, currentWorkflow, algorithmLibrary, validationErrors, executionResults } =
    useAppSelector((state) => state.orchestration);

  // Find the selected node
  const selectedNode = currentWorkflow?.nodes.find(
    (node) => node.id === selectedNodeId
  );

  // Find the algorithm definition
  const algorithm = selectedNode?.data.algorithmKey
    ? algorithmLibrary.find((alg) => alg.key === selectedNode.data.algorithmKey)
    : null;

  // Filter validation errors for this node
  const nodeErrors = validationErrors.filter(
    (error) => error.nodeId === selectedNodeId
  );

  // Get execution result for this node
  const nodeResult = selectedNodeId ? executionResults[selectedNodeId] : null;

  // Empty state when no node is selected
  if (!selectedNodeId || !selectedNode) {
    return (
      <div className={styles.nodeInspector}>
        <div className={styles.header}>
          <Title level={5}>Node Inspector</Title>
        </div>
        <div className={styles.emptyState}>
          <Empty
            description="Select a node to view details"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </div>
      </div>
    );
  }

  // Tab items
  const tabItems = [
    {
      key: "details",
      label: "Details",
      children: (
        <AlgorithmInfo
          node={selectedNode}
          algorithm={algorithm}
        />
      ),
    },
    {
      key: "results",
      label: "Results",
      children: (
        <ExecutionResults
          node={selectedNode}
          result={nodeResult}
        />
      ),
    },
    {
      key: "validation",
      label: `Validation ${nodeErrors.length > 0 ? `(${nodeErrors.length})` : ""}`,
      children: (
        <ValidationErrors
          errors={nodeErrors}
        />
      ),
    },
  ];

  return (
    <div className={styles.nodeInspector}>
      <div className={styles.header}>
        <Title level={5}>Node Inspector</Title>
        <div className={styles.nodeTitle}>{selectedNode.data.label}</div>
      </div>
      <Tabs
        defaultActiveKey="details"
        items={tabItems}
        className={styles.tabs}
      />
    </div>
  );
};

