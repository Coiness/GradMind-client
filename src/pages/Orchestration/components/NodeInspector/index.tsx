import React from "react";
import { Tabs, Empty, Typography, Button, Popconfirm } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeNode } from "@/store/features/orchestrationSlice";
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
  const dispatch = useAppDispatch();
  const {
    selectedNodeId,
    currentWorkflow,
    algorithmLibrary,
    validationErrors,
    executionResults,
  } = useAppSelector((state) => state.orchestration);

  console.log("🔍 [NodeInspector] Rendering with:", {
    selectedNodeId,
    executionResults,
    hasWorkflow: !!currentWorkflow,
  });

  // Find the selected node
  const selectedNode = currentWorkflow?.nodes.find(
    (node) => node.id === selectedNodeId,
  );

  // Find the algorithm definition
  const algorithm = selectedNode?.data.algorithmKey
    ? (algorithmLibrary.find(
        (alg) => alg.key === selectedNode.data.algorithmKey,
      ) ?? null)
    : null;

  // Filter validation errors for this node
  const nodeErrors = validationErrors.filter(
    (error) => error.nodeId === selectedNodeId,
  );

  // Get execution result for this node
  const nodeResult = selectedNodeId ? executionResults[selectedNodeId] : null;

  console.log("📊 [NodeInspector] Node details:", {
    selectedNode: selectedNode
      ? {
          id: selectedNode.id,
          label: selectedNode.data.label,
          status: selectedNode.data.status,
          hasResult: !!selectedNode.data.result,
        }
      : null,
    nodeResult,
    nodeErrors: nodeErrors.length,
  });

  // Empty state when no node is selected
  if (!selectedNodeId || !selectedNode) {
    return (
      <div className={styles.nodeInspector}>
        <div className={styles.header}>
          <Title level={5}>节点检查器</Title>
        </div>
        <div className={styles.emptyState}>
          <Empty
            description="选择一个节点以查看详情"
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
      label: "详情",
      children: <AlgorithmInfo node={selectedNode} algorithm={algorithm} />,
    },
    {
      key: "results",
      label: "结果",
      children: <ExecutionResults node={selectedNode} result={nodeResult} />,
    },
    {
      key: "validation",
      label: `验证 ${nodeErrors.length > 0 ? `(${nodeErrors.length})` : ""}`,
      children: <ValidationErrors errors={nodeErrors} />,
    },
  ];

  return (
    <div className={styles.nodeInspector}>
      <div className={styles.header}>
        <Title level={5}>节点检查器</Title>
        <div className={styles.nodeTitle}>{selectedNode.data.label}</div>
        <div className={styles.actions}>
          <Popconfirm
            title="删除此节点？"
            description="删除后无法恢复，连线也会一并移除。"
            onConfirm={() => {
              dispatch(removeNode(selectedNodeId));
            }}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              删除节点
            </Button>
          </Popconfirm>
        </div>
      </div>
      <Tabs
        defaultActiveKey="details"
        items={tabItems}
        className={styles.tabs}
      />
    </div>
  );
};
