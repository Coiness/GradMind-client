import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Gradient Descent Algorithm
 * Iteratively optimizes a function by following the negative gradient
 */
export const gradientDescentAlgorithm: AlgorithmNode = {
  key: "gradient-descent",
  name: "Gradient Descent",
  category: "numerical-optimization",
  description:
    "Iteratively minimizes a function by taking steps proportional to the negative of the gradient at the current point.",
  icon: "⬇️",

  inputs: [
    {
      id: "function",
      label: "Objective Function",
      dataType: "function",
      required: true,
    },
    {
      id: "gradient",
      label: "Gradient (optional)",
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
      key: "learningRate",
      label: "Learning Rate (α)",
      type: "number",
      defaultValue: 0.01,
      options: {
        min: 0.0001,
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
    {
      key: "tolerance",
      label: "Convergence Tolerance",
      type: "number",
      defaultValue: 1e-6,
      options: {
        min: 1e-10,
        max: 1e-2,
        step: 1e-7,
      },
    },
  ],

  compute: async (inputs, params) => {
    // Mock implementation for MVP
    const initialPoint = inputs.initialPoint || [5, 5];
    const learningRate = Number(params.learningRate) || 0.01;
    const maxIterations = Number(params.maxIterations) || 100;

    // Simulate computation delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock gradient descent convergence
    const history = [];
    let point = [...initialPoint];

    for (let i = 0; i < Math.min(maxIterations, 50); i++) {
      const objectiveValue = point.reduce(
        (sum: number, x: number) => sum + x * x,
        0,
      );
      history.push([...point, objectiveValue]);

      // Simulate gradient step
      point = point.map((x: number) => x * (1 - learningRate * 2));

      if (Math.abs(objectiveValue) < 0.01) break;
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
        },
      },
    };
  },
};
