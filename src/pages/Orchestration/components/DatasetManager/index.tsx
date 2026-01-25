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
      message.warning("Please upload or enter dataset data first");
      return;
    }

    // Add dataset node to canvas
    dispatch(
      addDatasetNode({
        position: { x: 100, y: 100 },
        datasetData,
        label: datasetData.metadata?.fileName || "Dataset",
      })
    );

    message.success("Dataset added to canvas!");
    setDatasetData(null);
    onClose();
  };

  const tabItems = [
    {
      key: "upload",
      label: "Upload File",
      children: <DatasetUpload onDataLoaded={setDatasetData} />,
    },
    {
      key: "manual",
      label: "Manual Entry",
      children: <ManualDataEntry onDataCreated={setDatasetData} />,
    },
  ];

  return (
    <Modal
      title="Dataset Manager"
      open={visible}
      onCancel={onClose}
      onOk={handleAddToCanvas}
      okText="Add to Canvas"
      width={800}
      okButtonProps={{ disabled: !datasetData }}
    >
      <Tabs items={tabItems} />
    </Modal>
  );
};
