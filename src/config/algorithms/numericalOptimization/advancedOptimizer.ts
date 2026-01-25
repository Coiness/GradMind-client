import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Advanced Optimizer Algorithm
 * Implements modern optimization algorithms like Adam, RMSprop, AdaGrad
 */
export const advancedOptimizerAlgorithm: AlgorithmNode = {
  key: "advanced-optimizer",
  name: "Advanced Optimizer (Adam/RMSprop)",
  category: "numerical-optimization",
  description:
    "Modern adaptive learning rate optimization algorithms including Adam, RMSprop, and AdaGrad for faster and more stable convergence.",
  icon: "🚀",

  inputs: [
    {
      id: "function",
      label: "Objective Function",
      dataType: "function",
      required: true,
    },
    {
      id: "gradient",
      label: "Gradient Function",
      dataType: "function",
      required: false,
    },
    {
      id: "initialPoint",
      label: "Initial Point",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "solution",
      label: "Optimal Point",
      dataType: "vector",
    },
    {
      id: "objectiveValue",
      label: "Final Objective Value",
      dataType: "scalar",
    },
    {
      id: "history",
      label: "Convergence History",
      dataType: "matrix",
    },
  ],

  parameters: [
    {
      key: "optimizer",
      label: "Optimizer Type",
      type: "select",
      defaultValue: "adam",
      options: {
        items: [
          { label: "Adam", value: "adam" },
          { label: "RMSprop", value: "rmsprop" },
          { label: "AdaGrad", value: "adagrad" },
        ],
      },
    },
    {
      key: "learningRate",
      label: "Learning Rate (α)",
      type: "number",
      defaultValue: 0.001,
      options: {
        min: 0.0001,
        max: 0.1,
        step: 0.0001,
      },
    },
    {
      key: "beta1",
      label: "Beta1 (Adam only)",
      type: "number",
      defaultValue: 0.9,
      options: {
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    {
      key: "beta2",
      label: "Beta2 (Adam only)",
      type: "number",
      defaultValue: 0.999,
      options: {
        min: 0,
        max: 1,
        step: 0.001,
      },
    },
    {
      key: "maxIterations",
      label: "Max Iterations",
      type: "slider",
      defaultValue: 100,
      options: {
        min: 10,
        max: 1000,
        step: 10,
      },
    },
  ],

  compute: async (inputs, params) => {
    // Mock implementation for MVP
    const initialPoint = inputs.initialPoint || [5, 5];
    const maxIterations = Number(params.maxIterations) || 100;
    const optimizer = params.optimizer || "adam";

    // Simulate computation delay
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Mock advanced optimizer convergence (faster than vanilla GD)
    const history = [];
    let point = [...initialPoint];

    for (let i = 0; i < Math.min(maxIterations, 50); i++) {
      const objectiveValue = point.reduce(
        (sum: number, x: number) => sum + x * x,
        0,
      );
      history.push([...point, objectiveValue]);

      // Simulate adaptive learning rate step (converges faster)
      const adaptiveLR = 0.1 / (1 + i * 0.01);
      point = point.map((x: number) => x * (1 - adaptiveLR * 2));

      if (Math.abs(objectiveValue) < 0.001) break;
    }

    const solution = point;
    const objectiveValue = solution.reduce(
      (sum: number, x: number) => sum + x * x,
      0,
    );

    return {
      solution,
      objectiveValue,
      history,
      visualization: {
        type: "convergence",
        data: {
          history,
          solution,
          iterations: history.length,
          optimizer,
        },
      },
    };
  },
};
