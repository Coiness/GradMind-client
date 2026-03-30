// 3D 点坐标
export interface Point3D {
  x: number;
  y: number;
  z: number;
}

// 梯度下降可视化数据
export interface GradientDescentVisualization {
  type: "gradient-descent-3d";
  functionType: string; // 函数类型：bowl, saddle, rosenbrock
  surfaceData: Point3D[]; // 曲面网格数据
  pathPoints: Point3D[]; // 优化路径点
  range: { xMin: number; xMax: number; yMin: number; yMax: number }; // 坐标范围
}

// PCA 可视化数据
export interface PCAVisualization {
  type: "pca-scatter";
  points: number[][]; // 降维后的点
  variance?: number[]; // 方差
  explainedVariance?: number[]; // 解释方差
  cumulativeVariance?: number[]; // 累积方差
}

// 收敛曲线可视化数据
export interface ConvergenceVisualization {
  type: "convergence";
  history: number[]; // 目标函数值历史
  iterations: number;
  converged: boolean;
}

// 可视化数据联合类型
export type VisualizationData =
  | GradientDescentVisualization
  | PCAVisualization
  | ConvergenceVisualization
  | null;

// 计算结果的类型
export interface ComputationResult {
  computationTime: number;
  finalLoss?: number;
  iterations?: number;
  visualization?: VisualizationData; // 可视化数据
  // 其他算法特定的结果字段
  [key: string]: unknown;
}
