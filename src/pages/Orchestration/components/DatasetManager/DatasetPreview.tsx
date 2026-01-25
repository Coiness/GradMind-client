import React from "react";
import { Table, Typography, Divider } from "antd";
import type { DatasetData } from "@/types/workflow";
import styles from "./DatasetPreview.module.css";

const { Title, Text } = Typography;

interface DatasetPreviewProps {
  data: DatasetData;
}

/**
 * DatasetPreview Component
 * Preview dataset in a table
 */
export const DatasetPreview: React.FC<DatasetPreviewProps> = ({ data }) => {
  // Prepare table columns
  const columns = data.headers
    ? data.headers.map((header, index) => ({
        title: header,
        dataIndex: index,
        key: index,
        width: 120,
      }))
    : data.data[0]?.map((_, index) => ({
        title: `Column ${index + 1}`,
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
      <Title level={5}>Preview</Title>

      {/* Metadata */}
      <div className={styles.metadata}>
        <Text type="secondary">
          {data.metadata?.rows || data.data.length} rows × {data.metadata?.columns || data.data[0]?.length || 0} columns
          {data.metadata?.fileName && ` • ${data.metadata.fileName}`}
        </Text>
      </div>

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
          Showing first 10 rows of {data.data.length}
        </Text>
      )}
    </div>
  );
};
