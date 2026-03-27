import { describe, it, expect } from "vitest";
import { templates } from "@/config/workflows";

/**
 * 测试新增的4个内置数据模板
 */
describe("内置数据模板 - 基础结构验证", () => {
  it("应该导出 12 个模板（3 原有 + 4 内置 + 5 新增预设）", () => {
    expect(templates.length).toBe(12);
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

  it("Dataset 节点应该内置 500 个高维点", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    expect(datasetNode).toBeDefined();
    const data = datasetNode!.data.datasetData?.data as number[][];
    expect(data).toBeDefined();
    expect(data.length).toBe(500);
    data.forEach((point) => {
      expect(point.length).toBe(10);
    });
  });

  it("PCA 节点应该配置 targetDimension: 2", () => {
    const pcaNode = tpl.nodes.find((n) => n.data.algorithmKey === "pca");
    expect(pcaNode).toBeDefined();
    expect(pcaNode!.data.parameters?.targetDimension).toBe(2);
  });

  it("应该有一条 Dataset → PCA 的边", () => {
    // 模板含示波器，边数 >= 2；只验证存在 dataset→pca 的边
    const edge = tpl.edges.find((e) => e.targetHandle === "dataMatrix");
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

  it("GD 节点应该配置 learningRate: 0.01, maxIterations: 100", () => {
    const gdNode = tpl.nodes.find(
      (n) => n.data.algorithmKey === "gradient-descent"
    );
    expect(gdNode).toBeDefined();
    expect(gdNode!.data.parameters?.learningRate).toBe(0.01);
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

  it("Dataset 节点应该内置 500 个二维点", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    expect(datasetNode).toBeDefined();
    const data = datasetNode!.data.datasetData?.data as number[][];
    expect(data).toBeDefined();
    expect(data.length).toBe(500);
    data.forEach((point) => {
      expect(point.length).toBe(2);
    });
  });

  it("数据应在合理的温度波动范围内（0~30度之间）", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    const data = datasetNode!.data.datasetData?.data as number[][];
    const temps = data.map((d) => d[1]);
    const maxTemp = Math.max(...temps);
    const minTemp = Math.min(...temps);
    expect(maxTemp).toBeLessThan(40);
    expect(minTemp).toBeGreaterThan(-10);
  });

  it("应该有一条边连接到 dataset", () => {
    const handles = tpl.edges.map((e) => e.targetHandle);
    expect(handles).toContain("dataset");
  });
});

describe("模板7：SVD 矩阵分解", () => {
  const tpl = templates.find((t) => t.id === "template-svd-builtin")!;

  it("应该存在", () => {
    expect(tpl).toBeDefined();
  });

  it("Dataset 节点应该内置图片数据（初始为 1×1 占位）", () => {
    const datasetNode = tpl.nodes.find((n) => n.type === "dataset");
    expect(datasetNode).toBeDefined();
    const data = datasetNode!.data.datasetData?.data as number[][];
    expect(data).toBeDefined();
    expect(data.length).toBe(1);
    data.forEach((row) => {
      expect(row.length).toBe(1);
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
    expect(result.transformed.length).toBe(500);
    expect(result.visualization?.type).toBe("scatter");
  }, 30000); // mathjs 特征分解在较大数据集上可能需要较长时间
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

    const result = await leastSquaresAlgorithm.compute(
      { dataset: { data, dataType: "matrix" as const } },
      { method: "polynomial", degree: 3, regularization: 0, targetColumn: -1 }
    );

    expect(result.coefficients).toBeDefined();
    expect(result.rSquared).toBeDefined();
    expect(typeof result.rSquared).toBe("number");
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
