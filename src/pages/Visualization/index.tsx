import React, { memo, useMemo } from "react";
import type { FC } from "react";
import { Select } from "antd";
import type { ParameterValues } from "@/types/parameterConfig";
import { ParameterPanel } from "@/components/ParameterPanel";
import { InfoPanel } from "@/components/InfoPanel";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  setSelectedScenario,
  runComputation,
} from "@/store/features/visualizationSlice";
import { scenarios } from "@/config/scenarios";
import { MathCodeBridge } from "@/components/MathCodeBridge";

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
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      padding: "20px",
      gap: "16px",
      backgroundColor: "#f5f5f5",
      boxSizing: "border-box",
      overflow: "hidden"
    }}>
      {/* 左侧面板 */}
      <div style={{ 
        width: "300px",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 0
      }}>
        {/* Select 组件 */}
        <div style={{ marginBottom: "16px" }}>
          <Select
            value={currentScenarioKey}
            onChange={handleScenarioChange}
            style={{ width: "100%" }}
            options={scenarios.map((s) => ({ label: s.name, value: s.key }))}
          />
        </div>
        
        {/* ParameterPanel - 占50%高度 */}
        <div style={{ 
          flex: "1 1 50%",
          minHeight: 0,
          marginBottom: "16px",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ 
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            backgroundColor: "#fff",
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column"
          }}>
            <ParameterPanel
              config={currentScenario.parameterConfig}
              onApply={handleApplyParams}
              isLoading={status === "loading"}
            />
          </div>
        </div>
        
        {/* InfoPanel - 占50%高度 */}
        <div style={{ 
          flex: "1 1 50%",
          minHeight: 0,
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ 
            border: "1px solid #f0f0f0",
            borderRadius: "8px",
            backgroundColor: "#fff",
            flex: 1,
            overflow: "auto",
            display: "flex",
            flexDirection: "column"
          }}>
            <InfoPanel
              title={currentScenario.name}
              data={currentScenario.resultTransformer(computationResult)}
              loading={status === "loading"}
            />
          </div>
        </div>
      </div>

      {/* 中间面板 */}
      <div style={{ 
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}>
        <div style={{ 
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          backgroundColor: "#fff",
          padding: "16px",
          flex: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column"
        }}>
          <h3 style={{ marginTop: 0 }}>可视化图表区域</h3>
          <div style={{ 
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0
          }}>
            <p>这里显示梯度下降的可视化图表</p>
          </div>
        </div>
      </div>

      {/* 右侧面板 */}
      <div style={{ 
        width: "400px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        height: "100%"
      }}>
        <div style={{ 
          border: "1px solid #f0f0f0",
          borderRadius: "8px",
          backgroundColor: "#fff",
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column"
        }}>
          <MathCodeBridge />
        </div>
      </div>
    </div>
  );
};

export default memo(VisualizationPage);