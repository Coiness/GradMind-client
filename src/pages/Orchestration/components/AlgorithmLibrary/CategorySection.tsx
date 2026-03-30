import React from "react";
import { Collapse, Typography, Badge } from "antd";
import type {
  AlgorithmNode,
  AlgorithmCategoryInfo,
} from "@/types/algorithmNode";
import { AlgorithmCard } from "./AlgorithmCard";
import styles from "./index.module.css";

const { Panel } = Collapse;
const { Text } = Typography;

interface CategorySectionProps {
  category: AlgorithmCategoryInfo;
  algorithms: AlgorithmNode[];
  onDragStart: (algorithm: AlgorithmNode) => void;
}

/**
 * Collapsible category section containing algorithm cards
 */
export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  algorithms,
  onDragStart,
}) => {
  return (
    <Collapse
      defaultActiveKey={[]}
      className={styles.categoryCollapse}
      expandIconPosition="end"
    >
      <Panel
        header={
          <div className={styles.categoryHeader}>
            {category.icon && (
              <span className={styles.categoryIcon}>{category.icon}</span>
            )}
            <div className={styles.categoryInfo}>
              <Text strong>{category.name}</Text>
              <Badge
                count={algorithms.length}
                style={{ backgroundColor: "#1890ff", marginLeft: 8 }}
              />
            </div>
          </div>
        }
        key={category.key}
      >
        <div className={styles.categoryDescription}>
          <Text type="secondary">{category.description}</Text>
        </div>
        <div className={styles.algorithmList}>
          {algorithms.map((algorithm) => (
            <AlgorithmCard
              key={algorithm.key}
              algorithm={algorithm}
              onDragStart={onDragStart}
            />
          ))}
        </div>
      </Panel>
    </Collapse>
  );
};
