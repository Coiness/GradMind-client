import React, { useEffect, useState } from "react";
import { Typography, Input, Space, Card } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loadAlgorithmLibrary } from "@/store/features/orchestrationSlice";
import { categories } from "@/config/algorithms";
import type { AlgorithmNode } from "@/types/algorithmNode";
import { CategorySection } from "./CategorySection";
import styles from "./index.module.css";

const { Title, Text } = Typography;

export const AlgorithmLibrary: React.FC = () => {
  const dispatch = useAppDispatch();
  const { algorithmLibrary, status } = useAppSelector(
    (state) => state.orchestration,
  );

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "idle") {
      dispatch(loadAlgorithmLibrary());
    }
  }, [dispatch, status]);

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

  const handleDragStart = () => {};

  // 示波器拖拽
  const handleOscilloscopeDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("nodeType", "oscilloscope");
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

      {/* 工具区：示波器 */}
      {!searchTerm && (
        <div className={styles.toolsSection}>
          <div className={styles.toolsSectionTitle}>可视化工具</div>
          <Card
            size="small"
            className={styles.oscilloscopeCard}
            draggable
            onDragStart={handleOscilloscopeDragStart}
          >
            <div className={styles.cardContent}>
              <div className={styles.cardHeader}>
                <span className={styles.icon}>📡</span>
                <Text strong className={styles.algorithmName}>示波器</Text>
              </div>
              <Text type="secondary" className={styles.description}>
                接收任意数据，自动渲染散点图、折线图等可视化图表
              </Text>
              <div className={styles.cardFooter}>
                <Text type="secondary" className={styles.ioInfo}>
                  1 个输入 • 图表输出
                </Text>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
