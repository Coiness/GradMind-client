import type { Scenario } from "@/types/scenarioConfig";

// 梯度下降场景的实现
const gradientDescentScenario: Scenario = {
  key: "gradient-descent",
  name: "梯度下降",
  description: "演示梯度下降算法如何优化损失函数",
  parameterConfig: [
    {
      key: "learningRate",
      label: "学习率 (Learning Rate)",
      type: "slider",
      defaultValue: 0.1,
      options: { min: 0.01, max: 1, step: 0.01 },
    },
    {
      key: "iterations",
      label: "迭代次数 (Iterations)",
      type: "number",
      defaultValue: 100,
      options: { min: 10, max: 1000, step: 10 },
    },
    {
      key: "initialLoss",
      label: "初始损失 (Initial Loss)",
      type: "number",
      defaultValue: 10,
      options: { min: 1, max: 100, step: 1 },
    },
  ],
  compute: async (params) => {
    // 提取参数
    const learningRate = params.learningRate as number;
    const iterations = params.iterations as number;
    const initialLoss = params.initialLoss as number;

    // 模拟梯度下降计算
    let loss = initialLoss;
    const startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
      // 简化模型：假设梯度为 0.1
      const gradient = 0.1;
      loss -= learningRate * gradient;

      // 防止损失变为负数
      if (loss < 0) loss = 0;

      // 模拟计算耗时
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const computationTime = Date.now() - startTime;

    return {
      computationTime,
      finalLoss: loss,
      iterations,
    };
  },
  resultTransformer: (result) => [
    { label: "计算耗时", value: result?.computationTime, unit: "ms" },
    { label: "最终损失", value: result?.finalLoss?.toFixed(4) },
    { label: "迭代次数", value: result?.iterations },
  ],
};

// 导出所有场景
export default gradientDescentScenario;
