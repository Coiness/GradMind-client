import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Gradient Computation Algorithm
 * Computes the gradient (first derivative) of a function
 */
export const gradientAlgorithm: AlgorithmNode = {
  key: "gradient",
  name: "Gradient Computation",
  category: "analytical-optimization",
  description:
    "Computes the gradient (vector of partial derivatives) of a scalar function with respect to its input variables.",
  icon: "∇",

  inputs: [
    {
      id: "function",
      label: "Objective Function",
      dataType: "function",
      required: true,
    },
    {
      id: "point",
      label: "Evaluation Point",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "gradient",
      label: "Gradient Vector",
      dataType: "vector",
    },
    {
      id: "magnitude",
      label: "Gradient Magnitude",
      dataType: "scalar",
    },
  ],

  parameters: [
    {
      key: "method",
      label: "Computation Method",
      type: "select",
      defaultValue: "numerical",
      options: {
        items: [
          { label: "Numerical (Finite Difference)", value: "numerical" },
          { label: "Automatic Differentiation", value: "autodiff" },
        ],
      },
    },
    {
      key: "epsilon",
      label: "Step Size (ε)",
      type: "number",
      defaultValue: 1e-5,
      options: {
        min: 1e-10,
        max: 1e-2,
        step: 1e-6,
      },
    },
  ],

  compute: async (inputs, _params) => {
    // Mock implementation for MVP
    const point = inputs.point || [0, 0];

    // Simulate computation delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock gradient computation
    const gradient = point.map((x: number) => -2 * x);
    const magnitude = Math.sqrt(
      gradient.reduce((sum: number, g: number) => sum + g * g, 0),
    );

    return {
      gradient,
      magnitude,
      visualization: {
        type: "vector",
        data: {
          gradient,
          magnitude,
          point,
        },
      },
    };
  },
};
