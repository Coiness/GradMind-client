import React from "react";
import { Card, Typography } from "antd";
import type { AlgorithmNode } from "@/types/algorithmNode";
import styles from "./index.module.css";

const { Text } = Typography;

interface AlgorithmCardProps {
  algorithm: AlgorithmNode;
  onDragStart: (algorithm: AlgorithmNode) => void;
}

/**
 * Draggable algorithm card component
 */
export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  algorithm,
  onDragStart,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/reactflow", algorithm.key);
    e.dataTransfer.setData("algorithmKey", algorithm.key);
    onDragStart(algorithm);
  };

  return (
    <Card
      className={styles.algorithmCard}
      size="small"
      draggable
      onDragStart={handleDragStart}
      hoverable
    >
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          {algorithm.icon && (
            <span className={styles.icon}>{algorithm.icon}</span>
          )}
          <Text strong className={styles.algorithmName}>
            {algorithm.name}
          </Text>
        </div>
        <Text type="secondary" className={styles.description}>
          {algorithm.description}
        </Text>
        <div className={styles.cardFooter}>
          <Text type="secondary" className={styles.ioInfo}>
            {algorithm.inputs.length} 个输入 • {algorithm.outputs.length}{" "}
            个输出
          </Text>
        </div>
      </div>
    </Card>
  );
};
