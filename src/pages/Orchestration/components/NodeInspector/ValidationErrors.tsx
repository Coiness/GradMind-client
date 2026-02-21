import React from "react";
import { Typography, Empty, Alert, Space } from "antd";
import { ExclamationCircleOutlined, WarningOutlined } from "@ant-design/icons";
import type { ValidationError } from "@/types/workflow";
import styles from "./ValidationErrors.module.css";

const { Title } = Typography;

interface ValidationErrorsProps {
  errors: ValidationError[];
}

/**
 * ValidationErrors Component
 * Displays validation errors and warnings for the selected node
 */
export const ValidationErrors: React.FC<ValidationErrorsProps> = ({
  errors,
}) => {
  // Empty state when no errors
  if (!errors || errors.length === 0) {
    return (
      <div className={styles.validationErrors}>
        <Empty
          description="无验证错误"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  // Separate errors and warnings
  const errorMessages = errors.filter((e) => e.type === "error");
  const warningMessages = errors.filter((e) => e.type === "warning");

  return (
    <div className={styles.validationErrors}>
      <Space direction="vertical" size="middle" style={{ width: "100%" }}>
        {/* Errors */}
        {errorMessages.length > 0 && (
          <div>
            <div className={styles.sectionHeader}>
              <ExclamationCircleOutlined className={styles.errorIcon} />
              <Title level={5} style={{ margin: 0 }}>
                错误 ({errorMessages.length})
              </Title>
            </div>
            <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 12 }}>
              {errorMessages.map((error, index) => (
                <Alert
                  key={index}
                  message={error.message}
                  type="error"
                  showIcon
                />
              ))}
            </Space>
          </div>
        )}

        {/* Warnings */}
        {warningMessages.length > 0 && (
          <div>
            <div className={styles.sectionHeader}>
              <WarningOutlined className={styles.warningIcon} />
              <Title level={5} style={{ margin: 0 }}>
                警告 ({warningMessages.length})
              </Title>
            </div>
            <Space direction="vertical" size="small" style={{ width: "100%", marginTop: 12 }}>
              {warningMessages.map((warning, index) => (
                <Alert
                  key={index}
                  message={warning.message}
                  type="warning"
                  showIcon
                />
              ))}
            </Space>
          </div>
        )}
      </Space>
    </div>
  );
};
