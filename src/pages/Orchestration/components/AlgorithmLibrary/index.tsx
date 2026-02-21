import React, { useEffect, useState } from "react";
import { Typography, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loadAlgorithmLibrary } from "@/store/features/orchestrationSlice";
import { categories } from "@/config/algorithms";
import type { AlgorithmNode } from "@/types/algorithmNode";
import { CategorySection } from "./CategorySection";
import styles from "./index.module.css";

const { Title } = Typography;

/**
 * Algorithm Library Panel (Left Panel)
 * Displays all available algorithms organized by category
 */
export const AlgorithmLibrary: React.FC = () => {
  const dispatch = useAppDispatch();
  const { algorithmLibrary, status } = useAppSelector(
    (state) => state.orchestration,
  );

  const [searchTerm, setSearchTerm] = useState("");

  // Load algorithm library on mount
  useEffect(() => {
    if (status === "idle") {
      dispatch(loadAlgorithmLibrary());
    }
  }, [dispatch, status]);

  // Filter algorithms based on search term
  const filterAlgorithms = (algorithms: AlgorithmNode[]) => {
    if (!searchTerm) return algorithms;

    const term = searchTerm.toLowerCase();
    return algorithms.filter(
      (algo) =>
        algo.name.toLowerCase().includes(term) ||
        algo.description.toLowerCase().includes(term) ||
        algo.key.toLowerCase().includes(term),
    );
  };

  const handleDragStart = () => {
    // Can be used for future drag state tracking
  };

  const visibleAlgorithmCount = categories.reduce((count, category) => {
    const categoryAlgorithms = algorithmLibrary.filter(
      (algorithm) => algorithm.category === category.key,
    );
    return count + filterAlgorithms(categoryAlgorithms).length;
  }, 0);

  return (
    <div className={styles.algorithmLibrary}>
      <div className={styles.header}>
        <Title level={4} className={styles.title}>
          算法库
        </Title>
        <Input
          placeholder="搜索算法..."
          prefix={<SearchOutlined />}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.searchInput}
          allowClear
        />
      </div>

      <div className={styles.content}>
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {categories.map((category) => {
            const categoryAlgorithms = algorithmLibrary.filter(
              (algorithm) => algorithm.category === category.key,
            );
            const filteredAlgorithms = filterAlgorithms(categoryAlgorithms);

            // Hide category if no algorithms match search
            if (filteredAlgorithms.length === 0) return null;

            return (
              <CategorySection
                key={category.key}
                category={category}
                algorithms={filteredAlgorithms}
                onDragStart={handleDragStart}
              />
            );
          })}
        </Space>
      </div>

      {searchTerm && visibleAlgorithmCount === 0 && (
        <div className={styles.noResults}>
          <Typography.Text type="secondary">
            未找到匹配 "{searchTerm}" 的算法
          </Typography.Text>
        </div>
      )}
    </div>
  );
};
