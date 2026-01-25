import React, { useState } from "react";
import { Form, InputNumber, Button, Input, Space, message } from "antd";
import { DatasetPreview } from "./DatasetPreview";
import type { DatasetData } from "@/types/workflow";
import styles from "./ManualDataEntry.module.css";

const { TextArea } = Input;

interface ManualDataEntryProps {
  onDataCreated: (data: DatasetData) => void;
}

/**
 * ManualDataEntry Component
 * Manually enter dataset data
 */
export const ManualDataEntry: React.FC<ManualDataEntryProps> = ({
  onDataCreated,
}) => {
  const [rows, setRows] = useState(3);
  const [columns, setColumns] = useState(3);
  const [dataText, setDataText] = useState("");
  const [previewData, setPreviewData] = useState<DatasetData | null>(null);

  const handleGenerate = () => {
    if (!dataText.trim()) {
      message.warning("Please enter data");
      return;
    }

    try {
      // Parse comma-separated values
      const lines = dataText.trim().split("\n");
      const data: any[][] = [];

      for (const line of lines) {
        const values = line.split(",").map((v) => {
          const trimmed = v.trim();
          // Try to parse as number
          const num = parseFloat(trimmed);
          return isNaN(num) ? trimmed : num;
        });
        data.push(values);
      }

      if (data.length === 0) {
        message.error("No data found");
        return;
      }

      const datasetData: DatasetData = {
        type: "manual",
        data,
        metadata: {
          rows: data.length,
          columns: data[0]?.length || 0,
        },
      };

      setPreviewData(datasetData);
      onDataCreated(datasetData);
      message.success("Dataset created successfully!");
    } catch (error: any) {
      message.error(`Failed to parse data: ${error.message}`);
      console.error("Parse error:", error);
    }
  };

  const handleGenerateTemplate = () => {
    const template: string[] = [];
    for (let i = 0; i < rows; i++) {
      const row: string[] = [];
      for (let j = 0; j < columns; j++) {
        row.push("0");
      }
      template.push(row.join(", "));
    }
    setDataText(template.join("\n"));
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Form layout="vertical">
        <Space size="middle">
          <Form.Item label="Rows">
            <InputNumber
              min={1}
              max={100}
              value={rows}
              onChange={(val) => setRows(val || 1)}
            />
          </Form.Item>
          <Form.Item label="Columns">
            <InputNumber
              min={1}
              max={20}
              value={columns}
              onChange={(val) => setColumns(val || 1)}
            />
          </Form.Item>
          <Form.Item label=" ">
            <Button onClick={handleGenerateTemplate}>Generate Template</Button>
          </Form.Item>
        </Space>

        <Form.Item
          label="Data (comma-separated values, one row per line)"
          help="Example: 1, 2, 3"
        >
          <TextArea
            rows={8}
            value={dataText}
            onChange={(e) => setDataText(e.target.value)}
            placeholder="Enter data here, e.g.:&#10;1, 2, 3&#10;4, 5, 6&#10;7, 8, 9"
            className={styles.dataInput}
          />
        </Form.Item>

        <Button type="primary" onClick={handleGenerate}>
          Create Dataset
        </Button>
      </Form>

      {previewData && <DatasetPreview data={previewData} />}
    </Space>
  );
};
