import type { ParameterConfig, ParameterValues } from "./parameterConfig";
import type { InfoItem } from "./InfoConfig";
import type { ComputationResult } from "./computationResult";

// 可视化类型
export type VisualizationType =
  | "gradient-descent-3d" // 3D 梯度下降（曲面 + 路径）
  | "pca-scatter" // PCA 散点图
  | "convergence" // 收敛曲线
  | "none"; // 无可视化

// 场景类型：将参数、信息和计算逻辑统一起来
export interface Scenario {
  key: string; // 唯一标识符
  name: string; // 显示名称
  description: string; // 场景描述
  parameterConfig: ParameterConfig[]; // 参数面板配置
  visualizationType: VisualizationType; // 可视化类型
  realtimeMode?: boolean; // 是否支持实时交互（默认 false）
  // 计算函数：接收参数，返回计算结果
  compute: (params: ParameterValues) => Promise<ComputationResult>;
  // 结果转换函数：将计算结果转换为信息面板的数据
  resultTransformer: (result: ComputationResult | null) => InfoItem[];
}
