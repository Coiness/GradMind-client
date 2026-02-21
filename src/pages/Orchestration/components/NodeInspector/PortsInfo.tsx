import React from "react";
import { Typography, Tag, Space } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import type { AlgorithmNode } from "@/types/algorithmNode";
import styles from "./PortsInfo.module.css";

const { Text } = Typography;

interface PortsInfoProps {
  algorithm: AlgorithmNode;
}

/**
 * PortsInfo Component
 * Displays input and output ports with data types
 */
export const PortsInfo: React.FC<PortsInfoProps> = ({ algorithm }) => {
  // Get color for data type
  const getDataTypeColor = (dataType: string) => {
    const colorMap: Record<string, string> = {
      matrix: "blue",
      vector: "green",
      scalar: "orange",
      function: "purple",
      model: "red",
      dataset: "cyan",
    };
    return colorMap[dataType] || "default";
  };

  return (
    <div className={styles.portsInfo}>
      {/* Input Ports */}
      <div className={styles.portSection}>
        <Text strong>输入端口：</Text>
        {algorithm.inputs && algorithm.inputs.length > 0 ? (
          <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 8 }}>
            {algorithm.inputs.map((input) => (
              <div key={input.id} className={styles.portItem}>
                <div className={styles.portLabel}>
                  <ArrowRightOutlined className={styles.portIcon} />
                  <Text>{input.label}</Text>
                  {input.required && (
                    <Tag color="red" style={{ marginLeft: 8 }}>
                      必需
                    </Tag>
                  )}
                </div>
                <Tag color={getDataTypeColor(input.dataType)}>
                  {input.dataType}
                </Tag>
              </div>
            ))}
          </Space>
        ) : (
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            无输入端口
          </Text>
        )}
      </div>

      {/* Output Ports */}
      <div className={styles.portSection} style={{ marginTop: 16 }}>
        <Text strong>输出端口：</Text>
        {algorithm.outputs && algorithm.outputs.length > 0 ? (
          <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 8 }}>
            {algorithm.outputs.map((output) => (
              <div key={output.id} className={styles.portItem}>
                <div className={styles.portLabel}>
                  <ArrowRightOutlined className={styles.portIcon} />
                  <Text>{output.label}</Text>
                </div>
                <Tag color={getDataTypeColor(output.dataType)}>
                  {output.dataType}
                </Tag>
              </div>
            ))}
          </Space>
        ) : (
          <Text type="secondary" style={{ display: "block", marginTop: 8 }}>
            无输出端口
          </Text>
        )}
      </div>
    </div>
  );
};
