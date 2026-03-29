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

void [
  generateTwoClusterData,
  generateLinearData,
  SVD_MATRIX,
  generatePolynomialData,
  generateHighDimData,
  generateLowRankMatrix,
  generateMultiClusterData,
];

// ─── 模板定义 ────────────────────────────────────────────────────────────────

export const templates: Workflow[] = [
  /**
   * 场景1：气温波动拟合对比 (多项式回归)
   */
  {
    id: "scene-temperature-regression",
    name: "气温波动拟合对比",
    description: "演示最小二乘法如何拟合带有噪声的观测数据。上方示波器展示原始散点，下方展示拟合曲线。",
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
        data: { label: "原始气温数据" },
      },
      {
        id: "algo-1",
        type: "algorithm",
        position: { x: 300, y: 250 },
        data: {
          label: "多项式回归",
          algorithmKey: "least-squares",
          parameters: { method: "polynomial", degree: 3, regularization: 0, targetColumn: -1 },
          status: "idle",
        },
      },
      {
        id: "osc-result",
        type: "oscilloscope",
        position: { x: 550, y: 250 },
        data: { label: "回归拟合结果" },
      },
    ],
    edges: [
      { id: "e1-raw", source: "dataset-1", target: "osc-raw", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e1-algo", source: "dataset-1", target: "algo-1", sourceHandle: "dataset", targetHandle: "dataset" },
      { id: "e-algo-result", source: "algo-1", target: "osc-result", sourceHandle: "coefficients", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 场景2：高维特征分类 (PCA 降维)
   */
  {
    id: "scene-highdim-pca",
    name: "高维特征分类 (PCA)",
    description: "展示PCA算法如何将10维的复杂水果特征数据压缩至2维，并自动形成清晰的水果分类簇。",
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
        data: { label: "降维前 (杂乱无章)" },
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
        data: { label: "降维后 (清晰聚类)" },
      },
    ],
    edges: [
      { id: "e1-raw", source: "dataset-1", target: "osc-raw", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e1-algo", source: "dataset-1", target: "algo-1", sourceHandle: "dataset", targetHandle: "dataset" },
      { id: "e-algo-result", source: "algo-1", target: "osc-result", sourceHandle: "transformed", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 场景3：SVD 图像压缩
   */
  {
    id: "scene-svd-image-compression",
    name: "SVD 图像压缩",
    description: "演示如何通过奇异值分解(SVD)截断部分特征值，实现图像的高效压缩与重建。上方为原图，下方为压缩图。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 150 },
        data: {
          label: "示例教学图片",
          datasetData: {
            type: "image",
            data: [[0]], // 由于图片异步加载，使用一个特殊标记让节点自身去获取
            headers: ["pixel"],
            metadata: { rows: 1, columns: 1, isAsyncExample: true },
          },
        },
      },
      {
        id: "osc-original",
        type: "oscilloscope",
        position: { x: 320, y: 20 },
        data: { label: "原始高清图像", status: "idle" },
      },
      {
        id: "svd-1",
        type: "algorithm",
        position: { x: 320, y: 250 },
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
        position: { x: 580, y: 250 },
        data: {
          algorithmKey: "image-reconstruction",
          label: "图像重建",
          parameters: { numComponents: 10 },
          status: "idle",
        },
      },
      {
        id: "osc-reconstructed",
        type: "oscilloscope",
        position: { x: 840, y: 250 },
        data: { label: "压缩重建图像", status: "idle" },
      },
    ],
    edges: [
      { id: "e-raw", source: "dataset-1", target: "osc-original", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e1", source: "dataset-1", target: "svd-1", sourceHandle: "dataset", targetHandle: "matrix" },
      { id: "e2", source: "svd-1", target: "recon-1", sourceHandle: "u", targetHandle: "u" },
      { id: "e3", source: "svd-1", target: "recon-1", sourceHandle: "s", targetHandle: "s" },
      { id: "e4", source: "svd-1", target: "recon-1", sourceHandle: "v", targetHandle: "v" },
      { id: "e6", source: "recon-1", target: "osc-reconstructed", sourceHandle: "reconstructed", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 场景4：梯度下降寻找谷底
   */
  {
    id: "scene-gradient-descent",
    name: "梯度下降寻找谷底",
    description: "展示梯度下降法如何在给定的目标函数（如碗状函数）中，从初始高点逐步迭代寻找最低谷的过程。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 150 },
        data: {
          label: "初始位置 (山腰)",
          datasetData: {
            type: "manual",
            data: [[5, 5]],
            headers: ["x1", "x2"],
            metadata: { rows: 1, columns: 2 },
          },
        },
      },
      {
        id: "gd-1",
        type: "algorithm",
        position: { x: 300, y: 150 },
        data: {
          algorithmKey: "gradient-descent",
          label: "梯度下降优化",
          parameters: { objectiveFunction: "bowl", learningRate: 0.05, maxIterations: 50 },
          status: "idle",
        },
      },
      {
        id: "osc-after",
        type: "oscilloscope",
        position: { x: 560, y: 150 },
        data: { label: "收敛历史" },
      },
    ],
    edges: [
      { id: "e2", source: "dataset-1", target: "gd-1", sourceHandle: "dataset", targetHandle: "initialPoint" },
      { id: "e3", source: "gd-1", target: "osc-after", sourceHandle: "history", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  /**
   * 场景5：智能图像色彩分割 (K-Means)
   */
  {
    id: "scene-kmeans-image-segmentation",
    name: "智能图像色彩分割",
    description: "演示K-Means无监督聚类算法如何根据灰度/色彩相似度，将一张图片智能地“撕”成多个不同的图层区域（如高光、中间调、阴影）。",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 150 },
        data: {
          label: "示例教学图片",
          datasetData: {
            type: "image",
            data: [[0]],
            headers: ["pixel"],
            metadata: { rows: 1, columns: 1, isAsyncExample: true },
          },
        },
      },
      {
        id: "osc-original",
        type: "oscilloscope",
        position: { x: 320, y: 20 },
        data: { label: "原始图像", status: "idle" },
      },
      {
        id: "kmeans-1",
        type: "algorithm",
        position: { x: 320, y: 250 },
        data: {
          algorithmKey: "kmeans",
          label: "K-Means 图像分割",
          parameters: { k: 3, maxIterations: 50, isImage: true },
          status: "idle",
        },
      },
      {
        id: "osc-segmented",
        type: "oscilloscope",
        position: { x: 580, y: 250 },
        data: { label: "多图层分割结果", status: "idle" },
      },
    ],
    edges: [
      { id: "e-raw", source: "dataset-1", target: "osc-original", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e1", source: "dataset-1", target: "kmeans-1", sourceHandle: "dataset", targetHandle: "dataset" },
      { id: "e2", source: "kmeans-1", target: "osc-segmented", sourceHandle: "clusteredImages", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  /**
   * 场景6：神经网络 XOR 逻辑学习
   */
  {
    id: "scene-neural-network-xor",
    name: "神经网络非线性学习 (XOR)",
    description: "演示前馈神经网络如何通过反向传播算法和隐藏层，解决经典的异或(XOR)非线性可分问题，观察损失函数与准确率的训练曲线。",
    nodes: [
      {
        id: "dataset-x",
        type: "dataset",
        position: { x: 50, y: 100 },
        data: {
          label: "XOR 特征数据",
          datasetData: {
            type: "manual",
            data: [[0, 0], [0, 1], [1, 0], [1, 1]],
            headers: ["X1", "X2"],
            metadata: { rows: 4, columns: 2 },
          },
        },
      },
      {
        id: "dataset-y",
        type: "dataset",
        position: { x: 50, y: 300 },
        data: {
          label: "XOR 目标标签",
          datasetData: {
            type: "manual",
            data: [[0], [1], [1], [0]],
            headers: ["Y"],
            metadata: { rows: 4, columns: 1 },
          },
        },
      },
      {
        id: "nn-1",
        type: "algorithm",
        position: { x: 350, y: 200 },
        data: {
          algorithmKey: "neural-network",
          label: "神经网络训练",
          parameters: { 
            hiddenLayers: "8,4", 
            activation: "relu",
            learningRate: 0.05,
            epochs: 500,
            batchSize: 4
          },
          status: "idle",
        },
      },
      {
        id: "osc-training",
        type: "oscilloscope",
        position: { x: 650, y: 200 },
        data: { label: "训练曲线 (Loss/Acc)", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-x", target: "nn-1", sourceHandle: "dataset", targetHandle: "trainData" },
      { id: "e2", source: "dataset-y", target: "nn-1", sourceHandle: "dataset", targetHandle: "trainLabels" },
      { id: "e3", source: "nn-1", target: "osc-training", sourceHandle: "trainingLoss", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  /**
   * 场景7：优化算法对比 (Adam vs 梯度下降)
   */
  {
    id: "scene-optimizer-comparison",
    name: "优化算法收敛速度对比",
    description: "对比基础的梯度下降法与高级优化器(Adam)在相同马鞍面目标函数上的收敛速度差异。",
    nodes: [
      {
        id: "dataset-start",
        type: "dataset",
        position: { x: 50, y: 200 },
        data: {
          label: "二维初始点",
          datasetData: {
            type: "manual",
            data: [[-5, -5]],
            headers: ["X", "Y"],
            metadata: { rows: 1, columns: 2 },
          },
        },
      },
      {
        id: "gd-1",
        type: "algorithm",
        position: { x: 350, y: 80 },
        data: {
          algorithmKey: "gradient-descent",
          label: "基础梯度下降 (GD)",
          parameters: { objectiveFunction: "bowl", learningRate: 0.1, maxIterations: 100 },
          status: "idle",
        },
      },
      {
        id: "adam-1",
        type: "algorithm",
        position: { x: 350, y: 320 },
        data: {
          algorithmKey: "advanced-optimizer",
          label: "Adam 优化器",
          parameters: { optimizer: "adam", objectiveFunction: "bowl", learningRate: 0.5, maxIterations: 100 },
          status: "idle",
        },
      },
      {
        id: "osc-gd",
        type: "oscilloscope",
        position: { x: 650, y: 80 },
        data: { label: "GD 收敛曲线", status: "idle" },
      },
      {
        id: "osc-adam",
        type: "oscilloscope",
        position: { x: 650, y: 320 },
        data: { label: "Adam 收敛曲线", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-start", target: "gd-1", sourceHandle: "dataset", targetHandle: "initialPoint" },
      { id: "e2", source: "dataset-start", target: "adam-1", sourceHandle: "dataset", targetHandle: "initialPoint" },
      { id: "e3", source: "gd-1", target: "osc-gd", sourceHandle: "history", targetHandle: "input" },
      { id: "e4", source: "adam-1", target: "osc-adam", sourceHandle: "history", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  /**
   * 场景8：经典数据聚类 (K-Means 散点)
   */
  {
    id: "scene-kmeans-scatter",
    name: "经典数据聚类 (K-Means)",
    description: "演示K-Means算法如何在杂乱无章的二维散点数据中，自动发现潜在的规律，寻找聚类中心并对数据进行分类染色。",
    nodes: [
      {
        id: "dataset-species",
        type: "dataset",
        position: { x: 50, y: 150 },
        data: {
          label: "混合二维散点数据",
          datasetId: "mixed-cluster-data",
        },
      },
      {
        id: "osc-raw",
        type: "oscilloscope",
        position: { x: 350, y: 50 },
        data: { label: "原始数据分布", status: "idle" },
      },
      {
        id: "kmeans-scatter",
        type: "algorithm",
        position: { x: 350, y: 250 },
        data: {
          algorithmKey: "kmeans",
          label: "K-Means 聚类",
          parameters: { k: 3, maxIterations: 100, isImage: false },
          status: "idle",
        },
      },
      {
        id: "osc-clusters",
        type: "oscilloscope",
        position: { x: 650, y: 250 },
        data: { label: "聚类结果分布图", status: "idle" },
      },
    ],
    edges: [
      { id: "e-raw", source: "dataset-species", target: "osc-raw", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e1", source: "dataset-species", target: "kmeans-scatter", sourceHandle: "dataset", targetHandle: "dataset" },
      { id: "e2", source: "kmeans-scatter", target: "osc-clusters", sourceHandle: "visualization", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
