import type { Workflow } from "@/types/workflow";

// ─── 内置数据生成工具 ────────────────────────────────────────────────────────

/** 生成两个高斯簇，各 15 个点，共 30 个二维点 */
function generateTwoClusterData(): number[][] {
  const data: number[][] = [];
  // 簇1：均值 (2, 2)，标准差 0.6
  const cluster1 = [
    [1.52, 2.31], [2.18, 1.87], [1.73, 2.54], [2.41, 2.08], [1.95, 1.62],
    [2.63, 2.37], [1.44, 1.93], [2.27, 2.71], [1.81, 2.15], [2.09, 1.78],
    [1.67, 2.42], [2.35, 1.99], [1.88, 2.26], [2.52, 2.14], [1.76, 1.85],
  ];
  // 簇2：均值 (6, 6)，标准差 0.6
  const cluster2 = [
    [6.23, 5.81], [5.74, 6.42], [6.51, 6.17], [5.88, 5.63], [6.34, 6.58],
    [5.61, 6.29], [6.47, 5.94], [5.93, 6.71], [6.18, 5.77], [5.79, 6.33],
    [6.42, 6.05], [5.67, 5.88], [6.29, 6.46], [5.84, 6.12], [6.11, 5.69],
  ];
  data.push(...cluster1, ...cluster2);
  return data;
}

/** 生成 20 个带噪声的线性数据：y = 2x + 1 + noise */
function generateLinearData(): number[][] {
  const data: number[][] = [];
  const xValues = [
    0.5, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0,
    5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0, 9.5, 10.0,
  ];
  const noise = [
    0.23, -0.41, 0.17, 0.58, -0.32, 0.44, -0.19, 0.67, -0.53, 0.28,
    -0.36, 0.51, 0.12, -0.47, 0.39, -0.22, 0.61, -0.14, 0.45, -0.38,
  ];
  xValues.forEach((x, i) => {
    const y = 2 * x + 1 + noise[i];
    data.push([x, y]);
  });
  return data;
}

/** 5×4 示例矩阵（用于 SVD 演示） */
const SVD_MATRIX: number[][] = [
  [1, 2, 3, 4],
  [5, 6, 7, 8],
  [9, 10, 11, 12],
  [2, 4, 6, 8],
  [1, 3, 5, 7],
];

// ─── 模板定义 ────────────────────────────────────────────────────────────────

/**
 * Pre-built workflow templates
 */
export const templates: Workflow[] = [
  // ── 原有模板 ──────────────────────────────────────────────────────────────
  {
    id: "template-linear-regression",
    name: "Linear Regression",
    description: "Simple linear regression using least squares",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 200 },
        data: {
          label: "Training Data",
        },
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
      {
        id: "edge-1",
        source: "dataset-1",
        target: "ls-1",
        sourceHandle: "dataset",
        targetHandle: "xData",
      },
      {
        id: "edge-2",
        source: "dataset-1",
        target: "ls-1",
        sourceHandle: "dataset",
        targetHandle: "yData",
      },
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
        data: {
          label: "Input Dataset",
        },
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
      {
        id: "edge-1",
        source: "dataset-1",
        target: "pca-1",
        sourceHandle: "dataset",
        targetHandle: "dataset",
      },
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
        data: {
          label: "Initial Point",
        },
      },
      {
        id: "gd-1",
        type: "algorithm",
        position: { x: 400, y: 150 },
        data: {
          algorithmKey: "gradient-descent",
          label: "Gradient Descent",
          parameters: {
            learningRate: 0.01,
            maxIterations: 100,
            tolerance: 1e-6,
          },
          status: "idle",
        },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "dataset-1",
        target: "gd-1",
        sourceHandle: "dataset",
        targetHandle: "initialPoint",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // ── 新增内置数据模板 ───────────────────────────────────────────────────────

  /**
   * 模板4：PCA 降维可视化
   * 内置 30 个二维高斯分布点（两个簇），直接执行即可看到散点图
   */
  {
    id: "template-pca-builtin",
    name: "PCA 降维可视化",
    description: "内置双簇数据，执行后在画布下方查看降维散点图",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 200 },
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
        id: "pca-1",
        type: "algorithm",
        position: { x: 420, y: 200 },
        data: {
          algorithmKey: "pca",
          label: "PCA",
          parameters: { nComponents: 2 },
          status: "idle",
        },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "dataset-1",
        target: "pca-1",
        sourceHandle: "dataset",
        targetHandle: "dataset",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板5：梯度下降收敛
   * 内置初始点 [5, 5]，默认目标函数 f(x) = x₁² + x₂²
   */
  {
    id: "template-gd-builtin",
    name: "梯度下降收敛",
    description: "内置初始点 [5,5]，执行后查看收敛曲线",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 150 },
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
        position: { x: 420, y: 150 },
        data: {
          algorithmKey: "gradient-descent",
          label: "梯度下降",
          parameters: {
            learningRate: 0.1,
            maxIterations: 100,
            tolerance: 1e-6,
          },
          status: "idle",
        },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "dataset-1",
        target: "gd-1",
        sourceHandle: "dataset",
        targetHandle: "initialPoint",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板6：最小二乘回归
   * 内置 20 个带噪声线性数据（y = 2x + 1 + noise）
   * 最后一列为 y，其余列为 x
   */
  {
    id: "template-ls-builtin",
    name: "最小二乘回归",
    description: "内置线性数据（y=2x+1+噪声），执行后查看拟合直线",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 200 },
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
        id: "ls-1",
        type: "algorithm",
        position: { x: 420, y: 200 },
        data: {
          algorithmKey: "least-squares",
          label: "最小二乘法",
          parameters: { method: "normal", regularization: 0 },
          status: "idle",
        },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "dataset-1",
        target: "ls-1",
        sourceHandle: "dataset",
        targetHandle: "xData",
      },
      {
        id: "edge-2",
        source: "dataset-1",
        target: "ls-1",
        sourceHandle: "dataset",
        targetHandle: "yData",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  /**
   * 模板7：SVD 矩阵分解
   * 内置一个 5×4 矩阵，执行后查看 U、Σ、V^T
   */
  {
    id: "template-svd-builtin",
    name: "SVD 矩阵分解",
    description: "内置 5×4 矩阵，执行后查看奇异值分解结果",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 200 },
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
        position: { x: 420, y: 200 },
        data: {
          algorithmKey: "svd",
          label: "SVD",
          parameters: { fullMatrices: "false" },
          status: "idle",
        },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "dataset-1",
        target: "svd-1",
        sourceHandle: "dataset",
        targetHandle: "matrix",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
