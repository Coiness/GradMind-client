import React, { useEffect, useMemo, useState } from "react";
import { Button, Slider, InputNumber, Select, Space } from "antd";
import type { ParameterConfig, ParameterValues } from "@/types/parameterConfig";
import styles from "./index.module.css";

interface ParameterPanelProps {
  config: ParameterConfig[];
  onApply: (values: ParameterValues) => void;
  isLoading?: boolean;
  initialValues?: ParameterValues;
  saveMode?: "manual" | "blur";
}

export const ParameterPanel: React.FC<ParameterPanelProps> = ({
  config,
  onApply,
  isLoading,
  initialValues,
  saveMode = "manual",
}) => {
  const resolvedInitialValues = useMemo(() => {
    const initialState: ParameterValues = {};
    config.forEach((p) => {
      initialState[p.key] = initialValues?.[p.key] ?? p.defaultValue;
    });
    return initialState;
  }, [config, initialValues]);

  const [draftParams, setDraftParams] = useState<ParameterValues>(resolvedInitialValues);

  useEffect(() => {
    setDraftParams(resolvedInitialValues);
  }, [resolvedInitialValues]);

  const handleParamChange = (key: string, value: number | string | boolean) => {
    setDraftParams((prev) => ({ ...prev, [key]: value }));
  };

  const applyValues = (nextValues: ParameterValues) => {
    onApply(nextValues);
  };

  const commitSingleValue = (key: string, value: number | string | boolean) => {
    const nextValues = { ...draftParams, [key]: value };
    setDraftParams(nextValues);
    applyValues(nextValues);
  };
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
            onChange={(val) => handleParamChange(key, val as number)}
            onAfterChange={(val) => {
              if (saveMode === "blur") {
                commitSingleValue(key, val as number);
              }
            }}
          />
        );
      case "number":
        return (
          <InputNumber
            style={{ width: "100%" }}
            min={options?.min}
            max={options?.max}
            step={options?.step}
            value={typeof value === "number" ? value : undefined}
            onChange={(val) => {
              if (val !== null) {
                handleParamChange(key, val as number);
              }
            }}
            onBlur={() => {
              if (saveMode === "blur" && typeof draftParams[key] !== "undefined") {
                applyValues(draftParams);
              }
            }}
          />
        );
      case "select":
        return (
          <Select
            style={{ width: "100%" }}
            options={options?.items}
            value={typeof value === "boolean" ? String(value) : value}
            onChange={(val) => {
              if (saveMode === "blur") {
                commitSingleValue(key, val);
                return;
              }
              handleParamChange(key, val);
            }}
          />
        );
      case "boolean":
        return (
          <Select
            style={{ width: "100%" }}
            options={[
              { label: "是", value: "true" },
              { label: "否", value: "false" },
            ]}
            value={String(Boolean(value))}
            onChange={(val) => {
              const booleanValue = val === "true";
              if (saveMode === "blur") {
                commitSingleValue(key, booleanValue);
                return;
              }
              handleParamChange(key, booleanValue);
            }}
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
        {saveMode === "manual" ? (
          <Button
            type="primary"
            onClick={() => applyValues(draftParams)}
            loading={isLoading}
            block
          >
            应用参数
          </Button>
        ) : null}
      </Space>
    </div>
  );
};
