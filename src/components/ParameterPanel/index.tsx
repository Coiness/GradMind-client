import React, { useState } from "react";
import { Button, Slider, InputNumber, Select, Space } from "antd";
import type { ParameterConfig, ParameterValues } from "@/types/parameterConfig";
import styles from "./index.module.css";

interface ParameterPanelProps {
  config: ParameterConfig[];
  onApply: (values: ParameterValues) => void;
  isLoading?: boolean;
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  config,
  onApply,
  isLoading,
}) => {
  // 根据 config 初始化内部的“草稿”状态
  const [draftParams, setDraftParams] = useState<ParameterValues>(() => {
    const initialState: ParameterValues = {};
    config.forEach((p) => {
      initialState[p.key] = p.defaultValue;
    });
    return initialState;
  });

  // 处理单个参数的变化，更新内部 state
  const handleParamChange = (key: string, value: number | string) => {
    setDraftParams((prev) => ({ ...prev, [key]: value }));
  };

  // 根据配置动态渲染对应的 Ant Design 控件
  const renderControl = (param: ParameterConfig) => {
    const { key, type, options } = param;
    const value = draftParams[key];

    switch (type) {
      case "slider":
        return (
          <Slider
            min={options?.min}
            max={options?.max}
            step={options?.step}
            value={value as number}
            onChange={(val) => handleParamChange(key, val)}
          />
        );
      case "number":
        return (
          <InputNumber
            style={{ width: "100%" }}
            min={options?.min}
            max={options?.max}
            step={options?.step}
            value={value}
            onChange={(val) => handleParamChange(key, val as number)}
          />
        );
      case "select":
        return (
          <Select
            style={{ width: "100%" }}
            options={options?.items}
            value={value}
            onChange={(val) => handleParamChange(key, val)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.panel}>
      <Space direction="vertical" style={{ width: "100%" }}>
        {config.map((param) => (
          <div key={param.key} className={styles.paramItem}>
            <span className={styles.paramLabel}>{param.label}</span>
            {renderControl(param)}
          </div>
        ))}
        <Button
          type="primary"
          onClick={() => onApply(draftParams)}
          loading={isLoading}
          block
        >
          应用参数
        </Button>
      </Space>
    </div>
  );
};
