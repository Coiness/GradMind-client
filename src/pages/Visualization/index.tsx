import React, { memo, useMemo } from "react";
import type { FC } from "react";
import { Select, Space } from "antd";
import type { ParameterValues } from "@/types/parameterConfig";
import { ParameterPanel } from "@/components/ParameterPanel";
import { InfoPanel } from "@/components/InfoPanel";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedScenario,
  runComputation,
} from "@/store/features/visualizationSlice";
import { scenarios } from "@/config/scenarios";

const VisualizationPage: FC = () => {
  // 从 Redux store 获取状态
  const dispatch = useAppDispatch();
  const {
    selectedScenarioKey,
    data: computationResult,
    status,
  } = useAppSelector((state) => state.visualization);

  // 默认选择第一个场景
  const currentScenarioKey = selectedScenarioKey || scenarios[0].key;
  const currentScenario = useMemo(
    () => scenarios.find((s) => s.key === currentScenarioKey)!,
    [currentScenarioKey],
  );

  // 处理场景选择
  const handleScenarioChange = (key: string) => {
    dispatch(setSelectedScenario(key));
  };

  // 处理参数应用
  const handleApplyParams = (params: ParameterValues) => {
    dispatch(runComputation({ scenarioKey: currentScenarioKey, params }));
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px 1fr 300px",
        gap: "16px",
        padding: "20px",
      }}
    >
      {/* 左侧面板：场景选择 + 参数面板 + 信息面板 */}
      <Space direction="vertical" style={{ width: "100%" }}>
        <Select
          value={currentScenarioKey}
          onChange={handleScenarioChange}
          style={{ width: "100%" }}
          options={scenarios.map((s) => ({ label: s.name, value: s.key }))}
        />
        <ParameterPanel
          config={currentScenario.parameterConfig}
          onApply={handleApplyParams}
          isLoading={status === "loading"}
        />
        <InfoPanel
          title={currentScenario.name}
          data={currentScenario.resultTransformer(computationResult)}
          loading={status === "loading"}
        />
      </Space>

      {/* 中间画布 */}
      <main
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          backgroundColor: "#fff",
        }}
      >
        <p>Canvas Area - 这里将来放置图表</p>
      </main>

      {/* 右侧面板：暂时留空，未来放置两个相关联的面板 */}
      <div
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          backgroundColor: "#fff",
          padding: "16px",
        }}
      >
        <p>右侧面板 - 未来放置相关联的面板</p>
      </div>
    </div>
  );
};

export default memo(VisualizationPage);
