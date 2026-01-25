import React, { useState } from "react";
import { Upload, message, Space } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { DatasetPreview } from "./DatasetPreview";
import type { DatasetData } from "@/types/workflow";
import styles from "./DatasetUpload.module.css";

const { Dragger } = Upload;

interface DatasetUploadProps {
  onDataLoaded: (data: DatasetData) => void;
}

/**
 * DatasetUpload Component
 * Upload CSV or JSON files
 */
export const DatasetUpload: React.FC<DatasetUploadProps> = ({
  onDataLoaded,
}) => {
  const [previewData, setPreviewData] = useState<DatasetData | null>(null);

  // Parse CSV data
  const parseCSV = (text: string): { data: any[][]; headers: string[] } => {
    const lines = text.trim().split("\n");
    if (lines.length === 0) {
      throw new Error("Empty CSV file");
    }

    // First line as headers
    const headers = lines[0].split(",").map((h) => h.trim());

    // Parse data rows
    const data: any[][] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => {
        const trimmed = v.trim();
        // Try to parse as number
        const num = parseFloat(trimmed);
        return isNaN(num) ? trimmed : num;
      });
      data.push(values);
    }

    return { data, headers };
  };

  // Parse JSON data
  const parseJSON = (text: string): { data: any[][]; headers?: string[] } => {
    const json = JSON.parse(text);

    // Handle array of objects
    if (Array.isArray(json) && json.length > 0 && typeof json[0] === "object") {
      const headers = Object.keys(json[0]);
      const data = json.map((obj) => headers.map((key) => obj[key]));
      return { data, headers };
    }

    // Handle 2D array
    if (Array.isArray(json) && Array.isArray(json[0])) {
      return { data: json };
    }

    throw new Error("Unsupported JSON format. Expected array of objects or 2D array.");
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let parsedData: { data: any[][]; headers?: string[] };

        if (file.name.endsWith(".csv")) {
          parsedData = parseCSV(text);
        } else if (file.name.endsWith(".json")) {
          parsedData = parseJSON(text);
        } else {
          message.error("Unsupported file format. Please upload CSV or JSON.");
          return;
        }

        const datasetData: DatasetData = {
          type: file.name.endsWith(".csv") ? "csv" : "json",
          data: parsedData.data,
          headers: parsedData.headers,
          metadata: {
            rows: parsedData.data.length,
            columns: parsedData.data[0]?.length || 0,
            fileName: file.name,
          },
        };

        setPreviewData(datasetData);
        onDataLoaded(datasetData);
        message.success(`File "${file.name}" loaded successfully!`);
      } catch (error: any) {
        message.error(`Failed to parse file: ${error.message}`);
        console.error("Parse error:", error);
      }
    };

    reader.readAsText(file);
    return false; // Prevent auto upload
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Dragger
        accept=".csv,.json"
        beforeUpload={handleFileUpload}
        showUploadList={false}
        className={styles.dragger}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to upload</p>
        <p className="ant-upload-hint">
          Support for CSV and JSON files. CSV files should have headers in the first row.
        </p>
      </Dragger>

      {previewData && <DatasetPreview data={previewData} />}
    </Space>
  );
};
