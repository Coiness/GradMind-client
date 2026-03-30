import { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { Card, Badge, Typography } from "antd";
import {
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { getAlgorithmByKey } from "@/config/algorithms";
import styles from "./AlgorithmNode.module.css";

const { Text } = Typography;

/**
 * Custom Algorithm Node Component for ReactFlow
 */
export const AlgorithmNode = memo(({ data, selected }: NodeProps) => {
  const algorithm = getAlgorithmByKey(data.algorithmKey);

  if (!algorithm) {
    return (
      <Card size="small" className={styles.errorNode}>
        <Text type="danger">Algorithm not found</Text>
      </Card>
    );
  }

  const getStatusIcon = () => {
    switch (data.status) {
      case "running":
        return <LoadingOutlined spin style={{ color: "#1890ff" }} />;
      case "success":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "error":
        return <CloseCircleOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case "running":
        return "#1890ff";
      case "success":
        return "#52c41a";
      case "error":
        return "#ff4d4f";
      default:
        return "#d9d9d9";
    }
  };

  return (
    <div
      className={`${styles.algorithmNode} ${selected ? styles.selected : ""}`}
    >
      {/* Input Handles */}
      {algorithm.inputs.map((input, index) => (
        <Handle
          key={input.id}
          type="target"
          position={Position.Left}
          id={input.id}
          style={{
            top: `${((index + 1) * 100) / (algorithm.inputs.length + 1)}%`,
            background: "#1890ff",
          }}
          className={styles.handle}
        />
      ))}

      <Card
        size="small"
        className={styles.card}
        style={{ borderColor: getStatusColor() }}
      >
        <div className={styles.header}>
          {algorithm.icon && (
            <span className={styles.icon}>{algorithm.icon}</span>
          )}
          <Text strong className={styles.name}>
            {data.label || algorithm.name}
          </Text>
          {getStatusIcon()}
        </div>

        {data.status === "error" && data.error && (
          <div className={styles.error}>
            <Text type="danger" style={{ fontSize: 11 }}>
              {data.error}
            </Text>
          </div>
        )}

        <div className={styles.footer}>
          <Badge
            count={algorithm.inputs.length}
            style={{ backgroundColor: "#1890ff" }}
            size="small"
          />
          <Text type="secondary" style={{ fontSize: 11 }}>
            →
          </Text>
          <Badge
            count={algorithm.outputs.length}
            style={{ backgroundColor: "#52c41a" }}
            size="small"
          />
        </div>
      </Card>

      {/* Output Handles */}
      {algorithm.outputs.map((output, index) => (
        <Handle
          key={output.id}
          type="source"
          position={Position.Right}
          id={output.id}
          style={{
            top: `${((index + 1) * 100) / (algorithm.outputs.length + 1)}%`,
            background: "#52c41a",
          }}
          className={styles.handle}
        />
      ))}
    </div>
  );
});

AlgorithmNode.displayName = "AlgorithmNode";
