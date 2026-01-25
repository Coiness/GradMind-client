import { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";
import { Card, Typography } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import styles from "./DatasetNode.module.css";

const { Text } = Typography;

/**
 * Dataset Node Component for ReactFlow
 * Represents input data sources
 */
export const DatasetNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={`${styles.datasetNode} ${selected ? styles.selected : ""}`}>
      <Card size="small" className={styles.card}>
        <div className={styles.content}>
          <DatabaseOutlined className={styles.icon} />
          <Text strong className={styles.label}>
            {data.label || "Dataset"}
          </Text>
        </div>
      </Card>

      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="dataset"
        style={{ background: "#52c41a" }}
        className={styles.handle}
      />
    </div>
  );
});

DatasetNode.displayName = "DatasetNode";
