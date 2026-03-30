import React, { useState } from "react";
import { Modal, Tabs, message } from "antd";
import { DatasetUpload } from "./DatasetUpload";
import { ManualDataEntry } from "./ManualDataEntry";
import { useAppDispatch } from "@/store/hooks";
import { addDatasetNode } from "@/store/features/orchestrationSlice";
import type { DatasetData } from "@/types/workflow";

interface DatasetManagerProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * DatasetManager Component
 * Modal for uploading datasets or entering data manually
 */
export const DatasetManager: React.FC<DatasetManagerProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [datasetData, setDatasetData] = useState<DatasetData | null>(null);

  const handleAddToCanvas = () => {
    if (!datasetData) {
      message.warning("请先上传或输入数据集数据");
      return;
    }

    // Add dataset node to canvas
    dispatch(
      addDatasetNode({
        position: { x: 100, y: 100 },
        datasetData,
        label: datasetData.metadata?.fileName || "数据集",
      }),
    );

    message.success("数据集已添加到画布！");
    setDatasetData(null);
    onClose();
  };

  const tabItems = [
    {
      key: "upload",
      label: "上传文件",
      children: <DatasetUpload onDataLoaded={setDatasetData} />,
    },
    {
      key: "manual",
      label: "手动输入",
      children: <ManualDataEntry onDataCreated={setDatasetData} />,
    },
  ];

  return (
    <Modal
      title="数据集管理器"
      open={visible}
      onCancel={onClose}
      onOk={handleAddToCanvas}
      okText="添加到画布"
      width={800}
      okButtonProps={{ disabled: !datasetData }}
    >
      <Tabs items={tabItems} />
    </Modal>
  );
};
