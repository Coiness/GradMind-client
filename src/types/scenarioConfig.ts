import type { ParameterConfig, ParameterValues } from "./parameterConfig";
import type { InfoItem } from "./InfoConfig";
import type { ComputationResult } from "./computationResult";

// 可视化类型
export type VisualizationType =
  | "gradient-descent-3d"
  | "pca-scatter"
  | "convergence"
  | "none";

// 公式-代码桥接配置
export interface BridgeConfig {
  mappings: Array<{
    id: string;
    name: string;
    formula: string;
    description: string;
    color: string;
    codeLines: [number, number];
    codeSnippet: string;
  }>;
}

// 场景类型
export interface Scenario {
  key: string;
  name: string;
  description: string;
  parameterConfig: ParameterConfig[];
  visualizationType: VisualizationType;
  realtimeMode?: boolean;
  bridgeConfig?: BridgeConfig;
  compute: (params: ParameterValues) => Promise<ComputationResult>;
  resultTransformer: (result: ComputationResult | null) => InfoItem[];
}
