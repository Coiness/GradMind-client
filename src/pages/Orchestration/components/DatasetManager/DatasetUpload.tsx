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
      throw new Error("CSV 文件为空");
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

    throw new Error("不支持的 JSON 格式。期望对象数组或二维数组。");
  };

  // Handle file upload
  const handleFileUpload = (file: File) => {
    if (file.type.startsWith('image/')) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 512;
        let width = img.width, height = img.height;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize;
            width = maxSize;
          } else {
            width = (width / height) * maxSize;
            height = maxSize;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);

        const imageData = ctx.getImageData(0, 0, width, height);
        const grayMatrix: number[][] = [];
        for (let y = 0; y < height; y++) {
          const row: number[] = [];
          for (let x = 0; x < width; x++) {
            const i = (y * width + x) * 4;
            const gray = 0.299 * imageData.data[i] + 0.587 * imageData.data[i+1] + 0.114 * imageData.data[i+2];
            row.push(Math.round(gray));
          }
          grayMatrix.push(row);
        }

        const datasetData: DatasetData = {
          type: 'image',
          data: grayMatrix,
          headers: ['pixel'],
          metadata: {
            rows: height,
            columns: width,
            fileName: file.name,
            imageWidth: width,
            imageHeight: height,
            imageFormat: file.type
          }
        };

        setPreviewData(datasetData);
        onDataLoaded(datasetData);
        message.success(`图像 "${file.name}" 加载成功！`);
      };
      img.onerror = () => {
        message.error('图像加载失败');
      };
      img.src = URL.createObjectURL(file);
      return false;
    }

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
          message.error("不支持的文件格式。请上传 CSV、JSON 或图像文件。");
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
        message.success(`文件 "${file.name}" 加载成功！`);
      } catch (error: any) {
        message.error(`解析文件失败：${error.message}`);
        console.error("Parse error:", error);
      }
    };

    reader.readAsText(file);
    return false; // Prevent auto upload
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Dragger
        accept=".csv,.json,.png,.jpg,.jpeg"
        beforeUpload={handleFileUpload}
        showUploadList={false}
        className={styles.dragger}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此处上传</p>
        <p className="ant-upload-hint">
          支持 CSV、JSON 和图像文件（PNG、JPG）。CSV 文件应在第一行包含标题。
        </p>
      </Dragger>

      {previewData && <DatasetPreview data={previewData} />}
    </Space>
  );
};
