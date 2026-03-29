import { memo, useEffect } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position, useReactFlow } from "reactflow";
import { Card, Typography } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { initImageDataset, presetDatasets } from "@/config/presetDatasets";
import { useAppDispatch } from "@/store/hooks";
import { updateDatasetData } from "@/store/features/orchestrationSlice";
import styles from "./DatasetNode.module.css";

const { Text } = Typography;

/**
 * Dataset Node Component for ReactFlow
 * Represents input data sources
 */
export const DatasetNode = memo(({ id, data, selected }: NodeProps) => {
  const dispatch = useAppDispatch();
  const { setNodes } = useReactFlow();

  // Handle async image loading for example templates
  useEffect(() => {
    if (data?.datasetData?.metadata?.isAsyncExample) {
      initImageDataset().then((realDataset) => {
        // Update Redux state
        dispatch(updateDatasetData({ nodeId: id, datasetData: realDataset }));
        // Update ReactFlow local state to trigger re-render
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  datasetData: realDataset,
                  label: "示例教学图片",
                },
              };
            }
            return n;
          })
        );
      });
    }
  }, [id, data?.datasetData?.metadata?.isAsyncExample, dispatch, setNodes]);

  // Handle preset dataset hydration by datasetId
  useEffect(() => {
    if (data?.datasetId && !data?.datasetData) {
      const preset = presetDatasets.find(p => p.id === data.datasetId);
      if (preset) {
        // Update Redux state
        dispatch(updateDatasetData({ nodeId: id, datasetData: preset.datasetData }));
        // Update ReactFlow local state
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === id) {
              return {
                ...n,
                data: {
                  ...n.data,
                  datasetData: preset.datasetData,
                  label: preset.name,
                },
              };
            }
            return n;
          })
        );
      }
    }
  }, [id, data?.datasetId, data?.datasetData, dispatch, setNodes]);

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
