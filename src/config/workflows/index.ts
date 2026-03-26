import type { Workflow } from "@/types/workflow";

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
  {
    id: "template-linear-regression",
    name: "Linear Regression",
    description: "Simple linear regression using least squares",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 200 },
        data: { label: "Training Data" },
      },
      {
        id: "ls-1",
        type: "algorithm",
        position: { x: 400, y: 200 },
        data: {
          algorithmKey: "least-squares",
          label: "Least Squares",
          parameters: {},
          status: "idle",
        },
      },
    ],
    edges: [
      { id: "edge-1", source: "dataset-1", target: "ls-1", sourceHandle: "dataset", targetHandle: "xData" },
      { id: "edge-2", source: "dataset-1", target: "ls-1", sourceHandle: "dataset", targetHandle: "yData" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-pca",
    name: "PCA Analysis",
    description: "Dimensionality reduction using PCA",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 200 },
        data: { label: "Input Dataset" },
      },
      {
        id: "pca-1",
        type: "algorithm",
        position: { x: 400, y: 200 },
        data: {
          algorithmKey: "pca",
          label: "PCA",
          parameters: { nComponents: 2 },
          status: "idle",
        },
      },
    ],
    edges: [
      { id: "edge-1", source: "dataset-1", target: "pca-1", sourceHandle: "dataset", targetHandle: "dataset" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-gradient-descent",
    name: "Gradient Descent Optimization",
    description: "Optimize a function using gradient descent",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 150 },
        data: { label: "Initial Point" },
      },
      {
        id: "gd-1",
        type: "algorithm",
        position: { x: 400, y: 150 },
        data: {
          algorithmKey: "gradient-descent",
          label: "Gradient Descent",
          parameters: { learningRate: 0.01, maxIterations: 100, tolerance: 1e-6 },
          status: "idle",
        },
      },
    ],
    edges: [
      { id: "edge-1", source: "dataset-1", target: "gd-1", sourceHandle: "dataset", targetHandle: "initialPoint" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ── 新增内置数据模板（带示波器，展示处理前后对比） ─────────────────────────

  /**
   * 模板4：PCA 降维可视化
   * 布局：Dataset → [示波器①原始数据] → PCA → [示波器②降维结果]
   */
  {
    id: "template-pca-builtin",
    name: "PCA 降维可视化",
    description: "内置双簇数据，示波器对比降维前后散点图",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 220 },
        data: {
          label: "双簇数据集（内置）",
          datasetData: {
            type: "manual",
            data: generateTwoClusterData(),
            headers: ["x", "y"],
            metadata: { rows: 30, columns: 2 },
          },
        },
      },
      {
        id: "osc-before",
        type: "oscilloscope",
        position: { x: 280, y: 120 },
        data: { label: "原始数据", status: "idle" },
      },
      {
        id: "pca-1",
        type: "algorithm",
        position: { x: 280, y: 320 },
        data: {
          algorithmKey: "pca",
          label: "PCA",
          parameters: { nComponents: 2 },
          status: "idle",
        },
      },
      {
        id: "osc-after",
        type: "oscilloscope",
        position: { x: 560, y: 320 },
        data: { label: "降维结果", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "osc-before", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e2", source: "dataset-1", target: "pca-1", sourceHandle: "dataset", targetHandle: "dataset" },
      { id: "e3", source: "pca-1", target: "osc-after", sourceHandle: "transformed", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板5：梯度下降收敛
   * 布局：Dataset → GD → [示波器 收敛曲线]
   */
  {
    id: "template-gd-builtin",
    name: "梯度下降收敛",
    description: "内置初始点 [5,5]，示波器展示收敛曲线",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 200 },
        data: {
          label: "初始点（内置）",
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
        position: { x: 300, y: 200 },
        data: {
          algorithmKey: "gradient-descent",
          label: "梯度下降",
          parameters: { learningRate: 0.1, maxIterations: 100, tolerance: 1e-6 },
          status: "idle",
        },
      },
      {
        id: "osc-conv",
        type: "oscilloscope",
        position: { x: 560, y: 200 },
        data: { label: "收敛过程", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "gd-1", sourceHandle: "dataset", targetHandle: "initialPoint" },
      { id: "e2", source: "gd-1", target: "osc-conv", sourceHandle: "solution", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板6：最小二乘回归
   * 布局：Dataset → [示波器①原始散点] → LeastSquares → [示波器②拟合结果]
   */
  {
    id: "template-ls-builtin",
    name: "最小二乘回归",
    description: "内置线性数据，示波器对比原始散点与拟合直线",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 220 },
        data: {
          label: "线性数据集（内置）",
          datasetData: {
            type: "manual",
            data: generateLinearData(),
            headers: ["x", "y"],
            metadata: { rows: 20, columns: 2 },
          },
        },
      },
      {
        id: "osc-before",
        type: "oscilloscope",
        position: { x: 280, y: 80 },
        data: { label: "原始散点", status: "idle" },
      },
      {
        id: "ls-1",
        type: "algorithm",
        position: { x: 280, y: 340 },
        data: {
          algorithmKey: "least-squares",
          label: "最小二乘法",
          parameters: { method: "normal", regularization: 0 },
          status: "idle",
        },
      },
      {
        id: "osc-after",
        type: "oscilloscope",
        position: { x: 560, y: 340 },
        data: { label: "拟合结果", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "osc-before", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e2", source: "dataset-1", target: "ls-1", sourceHandle: "dataset", targetHandle: "xData" },
      { id: "e3", source: "dataset-1", target: "ls-1", sourceHandle: "dataset", targetHandle: "yData" },
      { id: "e4", source: "ls-1", target: "osc-after", sourceHandle: "coefficients", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板7：SVD 矩阵分解
   * 布局：Dataset → SVD → [示波器 奇异值]
   */
  {
    id: "template-svd-builtin",
    name: "SVD 矩阵分解",
    description: "内置 5×4 矩阵，示波器展示奇异值分布",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 200 },
        data: {
          label: "示例矩阵（内置）",
          datasetData: {
            type: "manual",
            data: SVD_MATRIX,
            headers: ["c1", "c2", "c3", "c4"],
            metadata: { rows: 5, columns: 4 },
          },
        },
      },
      {
        id: "svd-1",
        type: "algorithm",
        position: { x: 300, y: 200 },
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
        position: { x: 560, y: 200 },
        data: { label: "奇异值分布", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "svd-1", sourceHandle: "dataset", targetHandle: "matrix" },
      { id: "e2", source: "svd-1", target: "osc-sigma", sourceHandle: "sigma", targetHandle: "input" },
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
          parameters: {},
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
      { id: "e1", source: "dataset-1", target: "ls-1", sourceHandle: "dataset", targetHandle: "xData" },
      { id: "e2", source: "dataset-1", target: "ls-1", sourceHandle: "dataset", targetHandle: "yData" },
      { id: "e3", source: "ls-1", target: "osc-result", sourceHandle: "coefficients", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板9：高维数据降维
   * 使用 generateHighDimData() - 50×10 高维数据
   */
  {
    id: "template-highdim-pca",
    name: "高维数据降维",
    description: "50×10 数据降至 2 维",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 200 },
        data: {
          label: "高维数据（10维）",
          datasetData: {
            type: "manual",
            data: generateHighDimData(),
            headers: ["d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "d10"],
            metadata: { rows: 50, columns: 10 },
          },
        },
      },
      {
        id: "pca-1",
        type: "algorithm",
        position: { x: 320, y: 200 },
        data: {
          algorithmKey: "pca",
          label: "PCA",
          parameters: { nComponents: 2 },
          status: "idle",
        },
      },
      {
        id: "osc-reduced",
        type: "oscilloscope",
        position: { x: 580, y: 200 },
        data: { label: "降维结果", status: "idle" },
      },
    ],
    edges: [
      { id: "e1", source: "dataset-1", target: "pca-1", sourceHandle: "dataset", targetHandle: "dataset" },
      { id: "e2", source: "pca-1", target: "osc-reduced", sourceHandle: "transformed", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板10：四簇数据可视化
   * 使用 generateMultiClusterData() - 60×2 四簇数据
   */
  {
    id: "template-four-clusters",
    name: "四簇数据可视化",
    description: "60个点分布在4个簇中",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 60, y: 200 },
        data: {
          label: "四簇数据",
          datasetData: {
            type: "manual",
            data: generateMultiClusterData(),
            headers: ["x", "y"],
            metadata: { rows: 60, columns: 2 },
          },
        },
      },
      {
        id: "pca-1",
        type: "algorithm",
        position: { x: 320, y: 200 },
        data: {
          algorithmKey: "pca",
          label: "PCA",
          parameters: { nComponents: 2 },
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
      { id: "e1", source: "dataset-1", target: "pca-1", sourceHandle: "dataset", targetHandle: "dataset" },
      { id: "e2", source: "pca-1", target: "osc-clusters", sourceHandle: "transformed", targetHandle: "input" },
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
      { id: "e2", source: "svd-1", target: "osc-sigma", sourceHandle: "sigma", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板12：SVD 图像压缩
   * 上传图像，使用SVD分解并重建，观察压缩效果
   */
  {
    id: "template-image-compression",
    name: "SVD图像压缩",
    description: "上传图像，使用SVD分解并重建，观察压缩效果",
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
          label: "SVD",
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
      { id: "e3", source: "svd-1", target: "recon-1", sourceHandle: "sigma", targetHandle: "sigma" },
      { id: "e4", source: "svd-1", target: "recon-1", sourceHandle: "vt", targetHandle: "vt" },
      { id: "e5", source: "dataset-1", target: "osc-original", sourceHandle: "dataset", targetHandle: "input" },
      { id: "e6", source: "recon-1", target: "osc-reconstructed", sourceHandle: "reconstructed", targetHandle: "input" },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
