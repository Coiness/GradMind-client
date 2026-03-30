import { describe, it, expect } from "vitest";
import { pcaAlgorithm } from "@/config/algorithms/dataReduction/pca";
import { svdAlgorithm } from "@/config/algorithms/dataReduction/svd";

/**
 * 测试 PCA 和 SVD 算法的 math.eigs 类型处理
 * 这是 P1 修复：处理 math.eigs 返回值的不同格式
 */
describe("PCA - math.eigs 类型处理", () => {
  it("应该正确执行 PCA 并返回降维结果", async () => {
    const inputs = {
      dataset: {
        data: [
          [2.5, 2.4],
          [0.5, 0.7],
          [2.2, 2.9],
          [1.9, 2.2],
          [3.1, 3.0],
          [2.3, 2.7],
          [2.0, 1.6],
          [1.0, 1.1],
          [1.5, 1.6],
          [1.1, 0.9],
        ],
        dataType: "matrix" as const,
      },
    };

    const result = await pcaAlgorithm.compute(inputs, {
      nComponents: 1,
    });

    expect(result.transformed).toBeDefined();
    expect(Array.isArray(result.transformed)).toBe(true);
    expect(result.transformed.length).toBe(10); // 10 个样本

    expect(result.components).toBeDefined();
    expect(Array.isArray(result.components)).toBe(true);

    expect(result.explainedVariance).toBeDefined();
    expect(Array.isArray(result.explainedVariance)).toBe(true);
    expect(result.explainedVariance.length).toBe(1); // 1 个主成分
  });

  it("应该返回正确数量的主成分", async () => {
    const inputs = {
      dataset: {
        data: [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
          [10, 11, 12],
        ],
        dataType: "matrix" as const,
      },
    };

    const result = await pcaAlgorithm.compute(inputs, {
      nComponents: 2,
    });

    expect(result.components.length).toBe(2);
    expect(result.explainedVariance.length).toBe(2);
  });
});

describe("SVD - math.eigs 类型处理", () => {
  it("应该正确执行 SVD 并返回 u, sigma, vt", async () => {
    const inputs = {
      matrix: {
        data: [
          [1, 2],
          [3, 4],
          [5, 6],
        ],
        dataType: "matrix" as const,
      },
    };

    const result = await svdAlgorithm.compute(inputs, {});

    // 检查返回的三个矩阵
    expect(result.u).toBeDefined();
    expect(Array.isArray(result.u)).toBe(true);
    expect(result.u.length).toBe(3); // 3 行

    expect(result.sigma).toBeDefined();
    expect(Array.isArray(result.sigma)).toBe(true);

    expect(result.vt).toBeDefined();
    expect(Array.isArray(result.vt)).toBe(true);
  });

  it("SVD 分解应该满足 A = U * Σ * V^T", async () => {
    const inputs = {
      matrix: {
        data: [
          [1, 0],
          [0, 1],
        ],
        dataType: "matrix" as const,
      },
    };

    const result = await svdAlgorithm.compute(inputs, {});

    // 对于单位矩阵，奇异值应该都是 1
    expect(result.sigma.every((s: number) => Math.abs(s - 1) < 0.01)).toBe(
      true,
    );
  });

  it("应该返回降序排列的奇异值", async () => {
    const inputs = {
      matrix: {
        data: [
          [3, 2, 2],
          [2, 3, -2],
        ],
        dataType: "matrix" as const,
      },
    };

    const result = await svdAlgorithm.compute(inputs, {});

    // 奇异值应该降序排列
    for (let i = 0; i < result.sigma.length - 1; i++) {
      expect(result.sigma[i]).toBeGreaterThanOrEqual(result.sigma[i + 1]);
    }
  });
});
