import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Hessian Matrix Algorithm
 * Computes the Hessian (second derivative matrix) of a function
 */
export const hessianAlgorithm: AlgorithmNode = {
  key: "hessian",
  name: "Hessian Matrix",
  category: "analytical-optimization",
  description:
    "Computes the Hessian matrix (matrix of second-order partial derivatives) to analyze the curvature of a function.",
  icon: "∇²",

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
      id: "hessian",
      label: "Hessian Matrix",
      dataType: "matrix",
    },
    {
      id: "eigenvalues",
      label: "Eigenvalues",
      dataType: "vector",
    },
    {
      id: "convexity",
      label: "Convexity Analysis",
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
    const dim = point.length;

    // Simulate computation delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Mock Hessian matrix (positive definite for convex function)
    const hessian = Array(dim)
      .fill(0)
      .map((_, i) =>
        Array(dim)
          .fill(0)
          .map((_, j) => (i === j ? 2 : 0)),
      );

    const eigenvalues = Array(dim).fill(2);
    const convexity = eigenvalues.every((e: number) => e > 0) ? 1 : 0; // 1 = convex, 0 = not convex

    return {
      hessian,
      eigenvalues,
      convexity,
      visualization: {
        type: "matrix",
        data: {
          hessian,
          eigenvalues,
          convexity: convexity === 1 ? "Convex" : "Not Convex",
        },
      },
    };
  },
};
