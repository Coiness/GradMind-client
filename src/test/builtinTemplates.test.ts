import { describe, it, expect } from "vitest";
import { templates } from "@/config/workflows";

/**
 * 测试新增的4个内置数据模板
 */
describe("内置数据模板 - 基础结构验证", () => {
  it("应该导出 7 个模板（3 原有 + 4 新增）", () => {
    expect(templates.length).toBe(7);
  });

  it("每个模板都应该有必要字段", () => {
    templates.forEach((t) => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(Array.isArray(t.nodes)).toBe(true);
      expect(Array.isArray(t.edges)).toBe(true);
      expect(t.nodes.length).toBeGreaterThan(0);
    });
  });
});

describe("模板4：PCA 降维可视化", () => {
  const tpl = templates.find((t) => t.id === "template-pca-builtin")!;

  it("应该存在", () => {
    expect(tpl).toBeDefined();
  });

  it("Dataset 节点应该内置 30 个二维点", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    expect(datasetNode).toBeDefined();
    const data = datasetNode!.data.datasetData?.data as number[][];
    expect(data).toBeDefined();
    expect(data.length).toBe(30);
    data.forEach((point) => {
      expect(point.length).toBe(2);
    });
  });

  it("PCA 节点应该配置 nComponents: 2", () => {
    const pcaNode = tpl.nodes.find((n) => n.data.algorithmKey === "pca");
    expect(pcaNode).toBeDefined();
    expect(pcaNode!.data.parameters?.nComponents).toBe(2);
  });

  it("应该有一条 Dataset → PCA 的边", () => {
    // 模板含示波器，边数 >= 2；只验证存在 dataset→pca 的边
    const edge = tpl.edges.find((e) => e.targetHandle === "dataset");
    expect(edge).toBeDefined();
  });
});

describe("模板5：梯度下降收敛", () => {
  const tpl = templates.find((t) => t.id === "template-gd-builtin")!;

  it("应该存在", () => {
    expect(tpl).toBeDefined();
  });

  it("Dataset 节点应该内置初始点 [[5, 5]]", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    expect(datasetNode).toBeDefined();
    const data = datasetNode!.data.datasetData?.data as number[][];
    expect(data).toBeDefined();
    expect(data.length).toBe(1);
    expect(data[0]).toEqual([5, 5]);
  });

  it("GD 节点应该配置 learningRate: 0.1, maxIterations: 100", () => {
    const gdNode = tpl.nodes.find(
      (n) => n.data.algorithmKey === "gradient-descent"
    );
    expect(gdNode).toBeDefined();
    expect(gdNode!.data.parameters?.learningRate).toBe(0.1);
    expect(gdNode!.data.parameters?.maxIterations).toBe(100);
  });

  it("应该有一条 Dataset → GD（initialPoint）的边", () => {
    const edge = tpl.edges.find((e) => e.targetHandle === "initialPoint");
    expect(edge).toBeDefined();
  });
});

describe("模板6：最小二乘回归", () => {
  const tpl = templates.find((t) => t.id === "template-ls-builtin")!;

  it("应该存在", () => {
    expect(tpl).toBeDefined();
  });

  it("Dataset 节点应该内置 20 个二维点", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    expect(datasetNode).toBeDefined();
    const data = datasetNode!.data.datasetData?.data as number[][];
    expect(data).toBeDefined();
    expect(data.length).toBe(20);
    data.forEach((point) => {
      expect(point.length).toBe(2);
    });
  });

  it("数据应该大致符合 y ≈ 2x + 1（斜率在 1.5~2.5 之间）", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    const data = datasetNode!.data.datasetData?.data as number[][];
    // 简单线性检验：取首尾点估算斜率
    const first = data[0];
    const last = data[data.length - 1];
    const slope = (last[1] - first[1]) / (last[0] - first[0]);
    expect(slope).toBeGreaterThan(1.5);
    expect(slope).toBeLessThan(2.5);
  });

  it("应该有两条边（xData 和 yData）", () => {
    // 模板含示波器，总边数 >= 2；只验证 xData 和 yData 边存在
    const handles = tpl.edges.map((e) => e.targetHandle);
    expect(handles).toContain("xData");
    expect(handles).toContain("yData");
  });
});

describe("模板7：SVD 矩阵分解", () => {
  const tpl = templates.find((t) => t.id === "template-svd-builtin")!;

  it("应该存在", () => {
    expect(tpl).toBeDefined();
  });

  it("Dataset 节点应该内置 5×4 矩阵", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    expect(datasetNode).toBeDefined();
    const data = datasetNode!.data.datasetData?.data as number[][];
    expect(data).toBeDefined();
    expect(data.length).toBe(5);
    data.forEach((row) => {
      expect(row.length).toBe(4);
    });
  });

  it("SVD 节点应该存在", () => {
    const svdNode = tpl.nodes.find((n) => n.data.algorithmKey === "svd");
    expect(svdNode).toBeDefined();
  });

  it("应该有一条 Dataset → SVD（matrix）的边", () => {
    const edge = tpl.edges.find((e) => e.targetHandle === "matrix");
    expect(edge).toBeDefined();
  });
});

describe("内置模板端到端执行 - PCA", () => {
  it("PCA 内置模板数据应该能正确执行 PCA 算法", async () => {
    const { pcaAlgorithm } = await import(
      "@/config/algorithms/dataReduction/pca"
    );
    const tpl = templates.find((t) => t.id === "template-pca-builtin")!;
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset")!;
    const data = datasetNode.data.datasetData!.data as number[][];

    const result = await pcaAlgorithm.compute(
      { dataset: { data, dataType: "matrix" as const } },
      { nComponents: 2 }
    );

    expect(result.transformed).toBeDefined();
    expect(result.transformed.length).toBe(30);
    expect(result.visualization?.type).toBe("scatter");
  }, 15000); // mathjs 特征分解在 30 个点上需要较长时间
});

describe("内置模板端到端执行 - 梯度下降", () => {
  it("GD 内置模板数据应该能正确执行梯度下降", async () => {
    const { gradientDescentAlgorithm } = await import(
      "@/config/algorithms/numericalOptimization/gradientDescent"
    );

    const result = await gradientDescentAlgorithm.compute(
      { initialPoint: { data: [5, 5], dataType: "vector" as const } },
      { learningRate: 0.1, maxIterations: 100, tolerance: 1e-6 }
    );

    expect(result.solution).toBeDefined();
    expect(result.visualization?.type).toBe("convergence");
    expect(result.converged).toBe(true);
  });
});

describe("内置模板端到端执行 - 最小二乘", () => {
  it("LS 内置模板数据应该能正确执行最小二乘", async () => {
    const { leastSquaresAlgorithm } = await import(
      "@/config/algorithms/analyticalOptimization/leastSquares"
    );
    const tpl = templates.find((t) => t.id === "template-ls-builtin")!;
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset")!;
    const data = datasetNode.data.datasetData!.data as number[][];

    // xData: 第一列，yData: 第二列
    const xData = data.map((row) => [row[0]]);
    const yData = data.map((row) => row[1]);

    const result = await leastSquaresAlgorithm.compute(
      { xData, yData },
      { method: "normal", regularization: 0 }
    );

    expect(result.coefficients).toBeDefined();
    expect(result.rSquared).toBeGreaterThan(0.9); // 高斯噪声下 R² 应该 > 0.9
    expect(result.visualization?.type).toBe("regression");
  });
});

describe("内置模板端到端执行 - SVD", () => {
  it("SVD 内置模板数据应该能正确执行 SVD 分解", async () => {
    const { svdAlgorithm } = await import(
      "@/config/algorithms/dataReduction/svd"
    );
    const tpl = templates.find((t) => t.id === "template-svd-builtin")!;
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset")!;
    const data = datasetNode.data.datasetData!.data as number[][];

    const result = await svdAlgorithm.compute(
      { matrix: { data, dataType: "matrix" as const } },
      { fullMatrices: "false" }
    );

    expect(result.u).toBeDefined();
    expect(result.sigma).toBeDefined();
    expect(result.vt).toBeDefined();
    expect(result.visualization?.type).toBe("matrix");
    // 奇异值应该降序排列
    for (let i = 0; i < result.sigma.length - 1; i++) {
      expect(result.sigma[i]).toBeGreaterThanOrEqual(result.sigma[i + 1]);
    }
  });
});
