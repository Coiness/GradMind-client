import React, { useEffect, useRef } from "react";
import { Table, Typography, Divider } from "antd";
import type { DatasetData } from "@/types/workflow";
import styles from "./DatasetPreview.module.css";

const { Title, Text } = Typography;

interface DatasetPreviewProps {
  data: DatasetData;
}

/**
 * DatasetPreview Component
 * Preview dataset in a table or as an image
 */
export const DatasetPreview: React.FC<DatasetPreviewProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render image to canvas if it's an image dataset
  useEffect(() => {
    if (data.type === "image" && canvasRef.current && data.data && data.data.length > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const height = data.data.length;
      const width = data.data[0].length;
      
      canvas.width = width;
      canvas.height = height;
      
      const imageData = ctx.createImageData(width, height);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const val = data.data[y][x];
          imageData.data[i] = val;
          imageData.data[i + 1] = val;
          imageData.data[i + 2] = val;
          imageData.data[i + 3] = 255;
        }
      }
      ctx.putImageData(imageData, 0, 0);
    }
  }, [data]);

  // Prepare table columns
  const columns = data.headers
    ? data.headers.map((header, index) => ({
        title: header,
        dataIndex: index,
        key: index,
        width: 120,
      }))
    : data.data[0]?.map((_, index) => ({
        title: `列 ${index + 1}`,
        dataIndex: index,
        key: index,
        width: 120,
      })) || [];

  // Prepare table data (show first 10 rows)
  const tableData = data.data.slice(0, 10).map((row, rowIndex) => {
    const rowData: any = { key: rowIndex };
    row.forEach((value, colIndex) => {
      rowData[colIndex] = value;
    });
    return rowData;
  });

  return (
    <div className={styles.datasetPreview}>
      <Divider />
      <Title level={5}>预览</Title>

      {/* Metadata */}
      <div className={styles.metadata}>
        <Text type="secondary">
          {data.metadata?.rows || data.data.length} 行 × {data.metadata?.columns || data.data[0]?.length || 0} 列
          {data.metadata?.fileName && ` • ${data.metadata.fileName}`}
          {data.type === "image" && ` • 图像数据集`}
        </Text>
      </div>

      {data.type === "image" ? (
        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <canvas 
            ref={canvasRef} 
            style={{ maxWidth: '100%', maxHeight: '300px', objectFit: 'contain', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} 
          />
        </div>
      ) : (
        <>
          {/* Table */}
          <Table
            columns={columns}
            dataSource={tableData}
            pagination={false}
            scroll={{ x: "max-content", y: 300 }}
            size="small"
            className={styles.table}
          />

          {data.data.length > 10 && (
            <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
              显示前 10 行，共 {data.data.length} 行
            </Text>
          )}
        </>
      )}
    </div>
  );
};
