import React from "react";
import type { ComputationResult } from "@/types/computationResult";
import type { VisualizationType } from "@/types/scenarioConfig";
import GradientDescent3DChart from "./charts/GradientDescent3DChart";
import ScatterChart from "@/pages/Orchestration/components/ResultPanel/charts/ScatterChart";

interface VisualizationCanvasProps {
  visualizationType: VisualizationType;
  data: ComputationResult | null;
  loading?: boolean;
}

const VisualizationCanvas: React.FC<VisualizationCanvasProps> = ({
  visualizationType,
  data,
  loading,
}) => {
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <div>计算中...</div>
      </div>
    );
  }

  if (!data?.visualization) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "var(--text-secondary)",
        }}
      >
        <div>请调整参数并点击"应用参数"查看可视化</div>
      </div>
    );
  }

  const { visualization } = data;

  switch (visualizationType) {
    case "gradient-descent-3d":
      if (visualization.type === "gradient-descent-3d") {
        return <GradientDescent3DChart data={visualization} />;
      }
      break;

    case "pca-scatter":
      if (visualization.type === "pca-scatter") {
        return <ScatterChart data={visualization} />;
      }
      break;

    case "convergence":
      return <div>收敛曲线（待实现）</div>;

    case "none":
    default:
      return null;
  }

  return <div style={{ padding: "20px", color: "var(--text-secondary)" }}>可视化类型不匹配</div>;
};

export default VisualizationCanvas;
