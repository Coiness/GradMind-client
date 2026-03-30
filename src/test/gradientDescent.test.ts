import { describe, it, expect } from "vitest";
import { gradientDescentAlgorithm } from "@/config/algorithms/numericalOptimization/gradientDescent";

/**
 * 测试梯度下降算法的默认函数功能
 * 这是 P0 修复：function 输入改为可选，缺失时使用默认二次目标函数
 */
describe("gradientDescent - 默认目标函数", () => {
  it("应该定义 function 输入为可选", () => {
    const functionInput = gradientDescentAlgorithm.inputs.find(
      (input) => input.id === "function",
    );

    expect(functionInput).toBeDefined();
    expect(functionInput?.required).toBe(false);
  });

  it("应该在没有提供函数时使用默认二次函数", async () => {
    const inputs = {
      initialPoint: {
        data: [5, 5],
        dataType: "vector" as const,
      },
      // 不提供 function 输入
    };

    const result = await gradientDescentAlgorithm.compute(inputs, {
      learningRate: 0.1,
      maxIterations: 100,
      tolerance: 1e-6,
    });

    // 默认函数是 x² 求和，最优点应该接近 [0, 0]
    expect(result.solution).toBeDefined();
    expect(Array.isArray(result.solution)).toBe(true);
    expect(result.solution.length).toBe(2);

    // 检查是否收敛到接近 [0, 0]
    expect(Math.abs(result.solution[0])).toBeLessThan(0.1);
    expect(Math.abs(result.solution[1])).toBeLessThan(0.1);

    // 目标值应该接近 0
    expect(result.objectiveValue).toBeDefined();
    expect(result.objectiveValue).toBeLessThan(0.1);
  });

  it("应该在提供自定义函数时使用自定义函数", async () => {
    const inputs = {
      function: (x: number[]) => (x[0] - 3) ** 2 + (x[1] - 4) ** 2,
      initialPoint: {
        data: [0, 0],
        dataType: "vector" as const,
      },
    };

    const result = await gradientDescentAlgorithm.compute(inputs, {
      learningRate: 0.1,
      maxIterations: 200,
      tolerance: 1e-6,
    });

    // 自定义函数的最优点应该接近 [3, 4]
    expect(Math.abs(result.solution[0] - 3)).toBeLessThan(0.5);
    expect(Math.abs(result.solution[1] - 4)).toBeLessThan(0.5);
  });

  it("应该返回收敛历史", async () => {
    const inputs = {
      initialPoint: {
        data: [2, 2],
        dataType: "vector" as const,
      },
    };

    const result = await gradientDescentAlgorithm.compute(inputs, {
      learningRate: 0.1,
      maxIterations: 50,
      tolerance: 1e-6,
    });

    expect(result.detailedHistory).toBeDefined();
    expect(Array.isArray(result.detailedHistory)).toBe(true);
    expect(result.detailedHistory.length).toBeGreaterThan(0);

    // 历史记录应该包含点、值、梯度和梯度范数
    const firstRecord = result.detailedHistory[0];
    expect(firstRecord).toHaveProperty("point");
    expect(firstRecord).toHaveProperty("value");
    expect(firstRecord).toHaveProperty("gradient");
    expect(firstRecord).toHaveProperty("gradNorm");
  });
});
