import React, { useEffect, useState } from "react";
import { Typography, Input, Space, Card, Collapse, Badge } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { loadAlgorithmLibrary } from "@/store/features/orchestrationSlice";
import { categories } from "@/config/algorithms";
import { presetDatasets, initImageDataset, imageDatasetData } from "@/config/presetDatasets";
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
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (status === "idle") {
      dispatch(loadAlgorithmLibrary());
    }
  }, [dispatch, status]);

  // 初始化图片数据集
  useEffect(() => {
    if (!imageDatasetData) {
      initImageDataset().then(() => {
        forceRender(prev => prev + 1); // 触发重渲染以使用加载后的图片数据
      });
    }
  }, []);

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

  // 数据集拖拽
  const handleDatasetDragStart = (e: React.DragEvent, dataset: typeof presetDatasets[0]) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("nodeType", "dataset");
    
    // 如果是图片数据集，使用异步加载完成后的真实数据，否则使用定义的数据
    const datasetDataToUse = dataset.id === "example-image" && imageDatasetData 
      ? imageDatasetData 
      : dataset.datasetData;
      
    e.dataTransfer.setData("datasetData", JSON.stringify(datasetDataToUse));
    e.dataTransfer.setData("label", dataset.name);
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

          {searchTerm && visibleAlgorithmCount === 0 && (
            <div className={styles.noResults}>
              <Typography.Text type="secondary">
                未找到匹配 "{searchTerm}" 的算法
              </Typography.Text>
            </div>
          )}

          {/* 预设数据集区 */}
          {!searchTerm && (
            <Collapse
              defaultActiveKey={[]}
              className={styles.categoryCollapse}
              expandIconPosition="end"
            >
              <Collapse.Panel
                header={
                  <div className={styles.categoryHeader}>
                    <span className={styles.categoryIcon}>🗂️</span>
                    <div className={styles.categoryInfo}>
                      <Text strong>预设数据集</Text>
                      <Badge
                        count={presetDatasets.length}
                        style={{ backgroundColor: "#52c41a", marginLeft: 8 }}
                      />
                    </div>
                  </div>
                }
                key="preset-datasets"
              >
                <div className={styles.datasetList}>
                  {presetDatasets.map((dataset) => (
                    <Card
                      key={dataset.id}
                      size="small"
                      className={styles.datasetCard}
                      draggable
                      onDragStart={(e) => handleDatasetDragStart(e, dataset)}
                    >
                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <span className={styles.icon}>{dataset.icon}</span>
                          <Text strong className={styles.algorithmName}>{dataset.name}</Text>
                        </div>
                        <Text type="secondary" className={styles.description}>
                          {dataset.description}
                        </Text>
                        <div className={styles.cardFooter}>
                          <Text type="secondary" className={styles.ioInfo}>
                            {dataset.dimensions}
                          </Text>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </Collapse.Panel>
            </Collapse>
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

        </Space>
      </div>
    </div>
  );
};
