import { memo, useMemo } from "react";
import type { FC } from "react";
import { Select, Space } from "antd";
import type { ParameterValues } from "@/types/parameterConfig";
import { ParameterPanel } from "@/components/ParameterPanel";
import { InfoPanel } from "@/components/InfoPanel";
import { MathCodeBridge } from "@/components/MathCodeBridge";
import VisualizationCanvas from "@/components/VisualizationCanvas";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedScenario,
  runComputation,
} from "@/store/features/visualizationSlice";
import { scenarios } from "@/config/scenarios";

const VisualizationPage: FC = () => {
  const dispatch = useAppDispatch();
  const {
    selectedScenarioKey,
    data: computationResult,
    status,
  } = useAppSelector((state) => state.visualization);

  const currentScenarioKey = selectedScenarioKey || scenarios[0].key;
  const currentScenario = useMemo(
    () => scenarios.find((s) => s.key === currentScenarioKey)!,
    [currentScenarioKey],
  );

  const handleScenarioChange = (key: string) => {
    dispatch(setSelectedScenario(key));
  };

  const handleApplyParams = (params: ParameterValues) => {
    dispatch(runComputation({ scenarioKey: currentScenarioKey, params }));
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "300px minmax(0, 1fr) 400px",
        gap: "16px",
        padding: "20px",
      }}
    >
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

      <main
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          backgroundColor: "#fff",
          padding: "16px",
        }}
      >
        <VisualizationCanvas
          visualizationType={currentScenario.visualizationType}
          data={computationResult}
          loading={status === "loading"}
        />
      </main>

      <div
        style={{
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        <MathCodeBridge />
      </div>
    </div>
  );
};

export default memo(VisualizationPage);
