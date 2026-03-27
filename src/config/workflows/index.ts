import type { Workflow } from "@/types/workflow";
import { presetDatasets } from "@/config/presetDatasets";

// ─── 内置数据生成工具 ────────────────────────────────────────────────────────

/** 生成两个高斯簇，各 15 个点，共 30 个二维点 */
function generateTwoClusterData(): number[][] {
  const cluster1 = [
    [1.52, 2.31], [2.18, 1.87], [1.73, 2.54], [2.41, 2.08], [1.95, 1.62],
    [2.63, 2.37], [1.44, 1.93], [2.27, 2.71], [1.81, 2.15], [2.09, 1.78],
    [1.67, 2.42], [2.35, 1.99], [1.88, 2.26], [2.52, 2.14], [1.76, 1.85],
  ];
  const cluster2 = [
    [6.23, 5.81], [5.74, 6.42], [6.51, 6.17], [5.88, 5.63], [6.34, 6.58],
    [5.61, 6.29], [6.47, 5.94], [5.93, 6.71], [6.18, 5.77], [5.79, 6.33],
    [6.42, 6.05], [5.67, 5.88], [6.29, 6.46], [5.84, 6.12], [6.11, 5.69],
  ];
  return [...cluster1, ...cluster2];
}

/** 生成 20 个带噪声的线性数据：y = 2x + 1 + noise */
function generateLinearData(): number[][] {
  const xValues = [
    0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0,
    5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0,
  ];
  const noise = [
    0.23, -0.41, 0.17, 0.58, -0.32, 0.44, -0.19, 0.67, -0.53, 0.28,
    -0.36, 0.51, 0.12, -0.47, 0.39, -0.22, 0.61, -0.14, 0.45, -0.38,
  ];
  return xValues.map((x, i) => [x, 2 * x + 1 + noise[i]]);
}

/** 5×4 示例矩阵（用于 SVD 演示） */
const SVD_MATRIX: number[][] = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [2, 4, 6, 8],
  [1, 3, 5, 7],
];

// ─── 新增8个预设数据集 ──────────────────────────────────────────────────────

/** 生成双螺旋数据（100×2）- 用于非线性分类/聚类 */
// @ts-expect-error - Reserved for future use
function _generateSpiralData(): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < 50; i++) {
    const t = (i / 50) * 4 * Math.PI;
    const r = t / (4 * Math.PI);
    data.push([r * Math.cos(t) + (Math.random() - 0.5) * 0.1, r * Math.sin(t) + (Math.random() - 0.5) * 0.1]);
    data.push([-r * Math.cos(t) + (Math.random() - 0.5) * 0.1, -r * Math.sin(t) + (Math.random() - 0.5) * 0.1]);
  }
  return data;
}

/** 生成三次多项式数据（30×2）- y = 0.5x³ - 2x² + x + 3 + noise */
function generatePolynomialData(): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < 30; i++) {
    const x = -2 + (i / 29) * 6;
    const y = 0.5 * x ** 3 - 2 * x ** 2 + x + 3 + (Math.random() - 0.5) * 2;
    data.push([x, y]);
  }
  return data;
}

/** 生成高维数据（50×10）- 用于PCA降维 */
function generateHighDimData(): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < 50; i++) {
    const base = [Math.random() * 10, Math.random() * 8];
    const row = [
      base[0] + (Math.random() - 0.5),
      base[1] + (Math.random() - 0.5),
      base[0] * 0.8 + base[1] * 0.2 + (Math.random() - 0.5),
      base[0] * 0.3 + base[1] * 0.7 + (Math.random() - 0.5),
      Math.random() * 2,
      Math.random() * 2,
      base[0] * 0.5 + (Math.random() - 0.5) * 0.5,
      base[1] * 0.5 + (Math.random() - 0.5) * 0.5,
      Math.random() * 3,
      Math.random() * 3,
    ];
    data.push(row);
  }
  return data;
}

/** 生成同心圆数据（80×2）- 用于非线性分类 */
// @ts-expect-error - Reserved for future use
function _generateCircularData(): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < 40; i++) {
    const theta = (i / 40) * 2 * Math.PI;
    data.push([2 * Math.cos(theta) + (Math.random() - 0.5) * 0.3, 2 * Math.sin(theta) + (Math.random() - 0.5) * 0.3]);
    data.push([5 * Math.cos(theta) + (Math.random() - 0.5) * 0.5, 5 * Math.sin(theta) + (Math.random() - 0.5) * 0.5]);
  }
  return data;
}

/** 生成优化起点（1×2）- 用于梯度下降 */
// @ts-expect-error - Reserved for future use
function _generateOptimizationStart(): number[][] {
  return [[3.5, 4.2]];
}

/** 生成低秩矩阵（6×8）- 用于SVD分解 */
function generateLowRankMatrix(): number[][] {
  const u = [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2], [2, 2]];
  const v = [[1, 0, 1, 2, 1, 2, 3, 2], [0, 1, 1, 1, 2, 2, 2, 3]];
  const data: number[][] = [];
  for (let i = 0; i < 6; i++) {
    const row: number[] = [];
    for (let j = 0; j < 8; j++) {
      row.push(u[i][0] * v[0][j] + u[i][1] * v[1][j] + (Math.random() - 0.5) * 0.5);
    }
    data.push(row);
  }
  return data;
}

/** 生成异常值数据（25×2）- 用于鲁棒回归 */
// @ts-expect-error - Reserved for future use
function _generateOutlierData(): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < 20; i++) {
    const x = i * 0.5;
    data.push([x, 2 * x + 1 + (Math.random() - 0.5) * 0.8]);
  }
  data.push([5, 15], [6, 18], [7, 2], [8, 20], [9, 3]);
  return data;
}

/** 生成四簇数据（60×2）- 用于聚类/PCA */
function generateMultiClusterData(): number[][] {
  const centers = [[2, 2], [2, 8], [8, 2], [8, 8]];
  const data: number[][] = [];
  centers.forEach(([cx, cy]) => {
    for (let i = 0; i < 15; i++) {
      data.push([cx + (Math.random() - 0.5) * 1.5, cy + (Math.random() - 0.5) * 1.5]);
    }
  });
  return data;
}

// ─── 模板定义 ────────────────────────────────────────────────────────────────

export const templates: Workflow[] = [
  // ── 原有基础模板（不带示波器） ─────────────────────────────────────────────
  /**
   * 模板1：简单线性回归 (房屋价格预测)
   */
  {
    id: "template-linear-regression",
    name: "房屋价格预测 (线性回归)",
    description: "通过房屋面积预测价格，使用简单线性回归模型拟合正相关趋势，适合入门教学。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 50, y: 150 },
        data: {
          label: "房屋价格与面积数据",
          datasetData: presetDatasets.find((d) => d.id === "house-price-data")?.datasetData,
        },
      },
      {
        id: "algo-1",
        type: "algorithm",
        position: { x: 300, y: 150 },
        data: {
          label: "最小二乘法",
          algorithmKey: "least-squares",
          parameters: { method: "normal", regularization: 0, targetColumn: -1 },
          status: "idle",
        },
      },
      {
        id: "osc-1",
        type: "oscilloscope",
        position: { x: 550, y: 150 },
        data: { label: "回归结果分析" },
      },
    ],
    edges: [
      {
        id: "e1-2-dataset",
        source: "dataset-1",
        target: "algo-1",
        sourceHandle: "dataset",
        targetHandle: "dataset",
      },
      {
        id: "e2-3",
        source: "algo-1",
        target: "osc-1",
        sourceHandle: "coefficients",
        targetHandle: "input",
      },
    ],
  },

  /**
   * 模板2：多项式回归拟合 (抛物体运动轨迹)
   */
  {
    id: "template-polynomial",
    name: "抛物体轨迹拟合 (多项式回归)",
    description: "分析抛物体在空中的飞行轨迹，使用多项式曲线拟合完美的抛物线。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 50, y: 150 },
        data: {
          label: "抛物体运动数据",
          datasetData: presetDatasets.find((d) => d.id === "projectile-motion-data")?.datasetData,
        },
      },
      {
        id: "algo-1",
        type: "algorithm",
        position: { x: 300, y: 150 },
        data: {
          label: "最小二乘法",
          algorithmKey: "least-squares",
          parameters: { method: "polynomial", degree: 2, regularization: 0, targetColumn: -1 },
          status: "idle",
        },
      },
      {
        id: "osc-1",
        type: "oscilloscope",
        position: { x: 550, y: 150 },
        data: { label: "抛物体轨迹拟合" },
      },
    ],
    edges: [
      {
        id: "e1-2-dataset",
        source: "dataset-1",
        target: "algo-1",
        sourceHandle: "dataset",
        targetHandle: "dataset",
      },
      {
        id: "e2-3",
        source: "algo-1",
        target: "osc-1",
        sourceHandle: "coefficients",
        targetHandle: "input",
      },
    ],
  },

  /**
   * 模板3：梯度下降法 (寻找局部最优)
   */
  {
    id: "template-kmeans",
    name: "梯度下降优化演示",
    description: "演示梯度下降算法在特定目标函数下，从初始点出发寻找局部最优解的迭代过程。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 50, y: 150 },
        data: {
          label: "初始点数据",
          datasetData: {
            type: "manual",
            data: [[5, 5]],
            headers: ["x1", "x2"],
            metadata: { rows: 1, columns: 2 },
          },
        },
      },
      {
        id: "algo-1",
        type: "algorithm",
        position: { x: 300, y: 150 },
        data: {
          label: "梯度下降法",
          algorithmKey: "gradient-descent",
          parameters: { learningRate: 0.01, maxIterations: 100 },
          status: "idle",
        },
      },
      {
        id: "osc-1",
        type: "oscilloscope",
        position: { x: 550, y: 150 },
        data: { label: "收敛历史分析" },
      },
    ],
    edges: [
      {
        id: "e1-2",
        source: "dataset-1",
        target: "algo-1",
        sourceHandle: "dataset",
        targetHandle: "initialPoint",
      },
      {
        id: "e2-3",
        source: "algo-1",
        target: "osc-1",
        sourceHandle: "history",
        targetHandle: "input",
      },
    ],
  },

  // ── 新增内置数据模板（带示波器，展示处理前后对比） ─────────────────────────

  /**
   * 模板4：PCA 降维可视化
   * 布局：Dataset → [示波器①原始数据] → PCA → [示波器②降维结果]
   */
  {
    id: "template-pca-builtin",
    name: "高维特征 PCA 降维对比",
    description: "演示PCA算法如何将多维特征数据降维。上方示波器展示原始高维数据，下方展示降维后的结果。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 50, y: 150 },
        data: {
          label: "水果多维特征数据",
          datasetData: presetDatasets.find((d) => d.id === "fruit-properties-data")?.datasetData,
        },
      },
      {
        id: "osc-raw",
        type: "oscilloscope",
        position: { x: 300, y: 50 },
        data: { label: "原始高维数据展示" },
      },
      {
        id: "algo-1",
        type: "algorithm",
        position: { x: 300, y: 250 },
        data: {
          label: "PCA 降维",
          algorithmKey: "pca",
          parameters: { targetDimension: 2 },
          status: "idle",
        },
      },
      {
        id: "osc-result",
        type: "oscilloscope",
        position: { x: 550, y: 250 },
        data: { label: "PCA 降维结果展示" },
      },
    ],
    edges: [
      {
        id: "e1-raw",
        source: "dataset-1",
        target: "osc-raw",
        sourceHandle: "dataset",
        targetHandle: "input",
      },
      {
        id: "e1-algo",
        source: "dataset-1",
        target: "algo-1",
        sourceHandle: "dataset",
        targetHandle: "dataMatrix",
      },
      {
        id: "e-algo-result",
        source: "algo-1",
        target: "osc-result",
        sourceHandle: "reducedData",
        targetHandle: "input",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板5：梯度下降法拟合效果对比
   * 布局：Dataset → [示波器①原始数据] → 梯度下降法 → [示波器②拟合结果]
   */
  {
    id: "template-gd-builtin",
    name: "梯度下降优化全景",
    description: "展示梯度下降法在寻找极小值过程中的收敛历史，与初始点状态形成对比。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 220 },
        data: {
          label: "初始点数据",
          datasetData: {
            type: "manual",
            data: [[5, 5]],
            headers: ["x1", "x2"],
            metadata: { rows: 1, columns: 2 },
          },
        },
      },
      {
        id: "osc-before",
        type: "oscilloscope",
        position: { x: 280, y: 120 },
        data: { label: "原始数据分布" },
      },
      {
        id: "gd-1",
        type: "algorithm",
        position: { x: 280, y: 320 },
        data: {
          algorithmKey: "gradient-descent",
          label: "梯度下降优化",
          parameters: { learningRate: 0.01, maxIterations: 100 },
          status: "idle",
        },
      },
      {
        id: "osc-after",
        type: "oscilloscope",
        position: { x: 560, y: 320 },
        data: { label: "收敛历史" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "osc-before", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e2", source: "dataset-1", target: "gd-1", sourceHandle: "dataset", targetHandle: "initialPoint" },
      { id: "e3", source: "gd-1", target: "osc-after", sourceHandle: "history", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板6：最小二乘法曲线拟合效果对比
   */
  {
    id: "template-ls-builtin",
    name: "最小二乘法曲线拟合对比",
    description: "演示最小二乘法如何拟合带有噪声的观测数据。上方示波器展示原始散点，下方展示拟合系数。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 50, y: 150 },
        data: {
          label: "连续气温波动记录",
          datasetData: presetDatasets.find((d) => d.id === "temperature-fluctuation-data")?.datasetData,
        },
      },
      {
        id: "osc-raw",
        type: "oscilloscope",
        position: { x: 300, y: 50 },
        data: { label: "气温波动散点图" },
      },
      {
        id: "algo-1",
        type: "algorithm",
        position: { x: 300, y: 250 },
        data: {
          label: "最小二乘法",
          algorithmKey: "least-squares",
          parameters: { method: "polynomial", degree: 3, regularization: 0, targetColumn: -1 },
          status: "idle",
        },
      },
      {
        id: "osc-result",
        type: "oscilloscope",
        position: { x: 550, y: 250 },
        data: { label: "拟合系数分析" },
      },
    ],
    edges: [
      {
        id: "e1-raw",
        source: "dataset-1",
        target: "osc-raw",
        sourceHandle: "dataset",
        targetHandle: "input",
      },
      {
        id: "e1-algo-dataset",
        source: "dataset-1",
        target: "algo-1",
        sourceHandle: "dataset",
        targetHandle: "dataset",
      },
      {
        id: "e-algo-result",
        source: "algo-1",
        target: "osc-result",
        sourceHandle: "coefficients",
        targetHandle: "input",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板7：SVD 特征提取
   * 布局：Dataset → SVD → [示波器 特征值分析]
   */
  {
    id: "template-svd-builtin",
    name: "SVD 特征提取 (教学图片)",
    description: "内置示例教学图片，通过SVD分解提取奇异值特征，示波器展示特征值大小分布",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 200 },
        data: {
          label: "示例教学图片",
          datasetData: presetDatasets.find((d) => d.id === "example-image")?.datasetData,
        },
      },
      {
        id: "svd-1",
        type: "algorithm",
        position: { x: 300, y: 200 },
        data: {
          algorithmKey: "svd",
          label: "SVD 分解",
          parameters: { k: 10 },
          status: "idle",
        },
      },
      {
        id: "osc-s",
        type: "oscilloscope",
        position: { x: 560, y: 200 },
        data: { label: "奇异值分布" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "svd-1", sourceHandle: "dataset", targetHandle: "matrix" },
      { id: "e2", source: "svd-1", target: "osc-s", sourceHandle: "s", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ── 新增预设数据集模板 ──────────────────────────────────────────────────────

  /**
   * 模板8：多项式回归（三次）
   * 使用 generatePolynomialData() - 30个点的三次多项式数据
   */
  {
    id: "template-polynomial-regression",
    name: "多项式回归",
    description: "三次多项式数据拟合（30点）",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 200 },
        data: {
          label: "三次多项式数据",
          datasetData: {
            type: "manual",
            data: generatePolynomialData(),
            headers: ["x", "y"],
            metadata: { rows: 30, columns: 2 },
          },
        },
      },
      {
        id: "ls-1",
        type: "algorithm",
        position: { x: 320, y: 200 },
        data: {
          algorithmKey: "least-squares",
          label: "最小二乘法",
          parameters: { method: "polynomial", degree: 3, regularization: 0, targetColumn: -1 },
          status: "idle",
        },
      },
      {
        id: "osc-result",
        type: "oscilloscope",
        position: { x: 580, y: 200 },
        data: { label: "拟合系数", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "ls-1", sourceHandle: "dataset", targetHandle: "dataset" },
      { id: "e3", source: "ls-1", target: "osc-result", sourceHandle: "coefficients", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板9：高维数据降维 (水果特征PCA)
   * 使用 fruit-properties-data - 500×10 高维数据
   */
  {
    id: "template-highdim-pca",
    name: "高维数据降维 (水果特征PCA)",
    description: "将包含10个维度的500个水果特征数据通过PCA降维至2维，以便于可视化分析。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 200 },
        data: {
          label: "水果多维特征数据",
          datasetData: presetDatasets.find((d) => d.id === "fruit-properties-data")?.datasetData,
        },
      },
      {
        id: "pca-1",
        type: "algorithm",
        position: { x: 320, y: 200 },
        data: {
          algorithmKey: "pca",
          label: "PCA",
          parameters: { targetDimension: 2 },
          status: "idle",
        },
      },
      {
        id: "osc-1",
        type: "oscilloscope",
        position: { x: 580, y: 200 },
        data: { label: "降维结果", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "pca-1", sourceHandle: "dataset", targetHandle: "dataMatrix" },
      { id: "e2", source: "pca-1", target: "osc-1", sourceHandle: "reducedData", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板10：多类别数据可视化 (动植物多类别)
   * 使用 species-classification-data - 600×2 
   */
  {
    id: "template-four-clusters",
    name: "多类别数据可视化 (动植物分类)",
    description: "600个包含体重和高度的样本点，自然分布在4个动植物类别簇中，适合聚类和分类教学。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 200 },
        data: {
          label: "动植物多类别分布数据",
          datasetData: presetDatasets.find((d) => d.id === "species-classification-data")?.datasetData,
        },
      },
      {
        id: "pca-1",
        type: "algorithm",
        position: { x: 320, y: 200 },
        data: {
          algorithmKey: "pca",
          label: "PCA",
          parameters: { targetDimension: 2 },
          status: "idle",
        },
      },
      {
        id: "osc-clusters",
        type: "oscilloscope",
        position: { x: 580, y: 200 },
        data: { label: "簇分布", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "pca-1", sourceHandle: "dataset", targetHandle: "dataMatrix" },
      { id: "e2", source: "pca-1", target: "osc-clusters", sourceHandle: "reducedData", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板11：SVD 低秩矩阵分解
   * 使用 generateLowRankMatrix() - 6×8 低秩矩阵
   */
  {
    id: "template-lowrank-svd",
    name: "低秩矩阵分解",
    description: "6×8 低秩矩阵 SVD 分解",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 200 },
        data: {
          label: "低秩矩阵（6×8）",
          datasetData: {
            type: "manual",
            data: generateLowRankMatrix(),
            headers: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"],
            metadata: { rows: 6, columns: 8 },
          },
        },
      },
      {
        id: "svd-1",
        type: "algorithm",
        position: { x: 320, y: 200 },
        data: {
          algorithmKey: "svd",
          label: "SVD",
          parameters: { fullMatrices: "false" },
          status: "idle",
        },
      },
      {
        id: "osc-sigma",
        type: "oscilloscope",
        position: { x: 580, y: 200 },
        data: { label: "奇异值", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "svd-1", sourceHandle: "dataset", targetHandle: "matrix" },
      { id: "e2", source: "svd-1", target: "osc-sigma", sourceHandle: "s", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板12：SVD 图像压缩
   * 演示如何通过SVD截断部分特征值，实现图像的压缩与重建。
   */
  {
    id: "template-image-compression",
    name: "SVD 图像压缩",
    description: "演示如何通过SVD截断部分特征值，实现图像的压缩与重建。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 150 },
        data: {
          label: "图像数据集",
          datasetData: {
            type: "image",
            data: [[0]], // 占位，实际在画布中会被建议替换为真实图片
            headers: ["pixel"],
            metadata: { rows: 1, columns: 1, fileName: "请替换为左侧示例图片" },
          },
        },
      },
      {
        id: "svd-1",
        type: "algorithm",
        position: { x: 320, y: 150 },
        data: {
          algorithmKey: "svd",
          label: "SVD 分解",
          parameters: { fullMatrices: "false" },
          status: "idle",
        },
      },
      {
        id: "recon-1",
        type: "algorithm",
        position: { x: 580, y: 150 },
        data: {
          algorithmKey: "image-reconstruction",
          label: "图像重建",
          parameters: { numComponents: 10 },
          status: "idle",
        },
      },
      {
        id: "osc-original",
        type: "oscilloscope",
        position: { x: 60, y: 320 },
        data: { label: "原始图像", status: "idle" },
      },
      {
        id: "osc-reconstructed",
        type: "oscilloscope",
        position: { x: 580, y: 320 },
        data: { label: "重建图像", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "svd-1", sourceHandle: "dataset", targetHandle: "matrix" },
      { id: "e2", source: "svd-1", target: "recon-1", sourceHandle: "u", targetHandle: "u" },
      { id: "e3", source: "svd-1", target: "recon-1", sourceHandle: "s", targetHandle: "s" },
      { id: "e4", source: "svd-1", target: "recon-1", sourceHandle: "v", targetHandle: "v" },
      { id: "e5", source: "dataset-1", target: "osc-original", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e6", source: "recon-1", target: "osc-reconstructed", sourceHandle: "reconstructed", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
