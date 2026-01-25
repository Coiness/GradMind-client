import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Singular Value Decomposition (SVD) Algorithm
 * Decomposes a matrix into U, Σ, and V^T
 */
export const svdAlgorithm: AlgorithmNode = {
  key: "svd",
  name: "SVD (Singular Value Decomposition)",
  category: "data-reduction",
  description:
    "Decomposes a matrix A into three matrices: A = UΣV^T, where U and V are orthogonal matrices and Σ is a diagonal matrix of singular values.",
  icon: "📊",

  inputs: [
    {
      id: "matrix",
      label: "Input Matrix",
      dataType: "matrix",
      required: true,
    },
  ],

  outputs: [
    {
      id: "u",
      label: "U Matrix",
      dataType: "matrix",
    },
    {
      id: "sigma",
      label: "Σ (Singular Values)",
      dataType: "vector",
    },
    {
      id: "vt",
      label: "V^T Matrix",
      dataType: "matrix",
    },
  ],

  parameters: [
    {
      key: "fullMatrices",
      label: "Full Matrices",
      type: "select",
      defaultValue: "false",
      options: {
        items: [
          { label: "True (Full U and V)", value: "true" },
          { label: "False (Economy-size)", value: "false" },
        ],
      },
    },
  ],

  compute: async (_inputs, _params) => {
    // Mock implementation for MVP
    // In production, this would use a numerical library like math.js or numeric.js

    // Simulate computation delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock result
    return {
      u: [[0.8, 0.6], [0.6, -0.8]],
      sigma: [5.0, 3.0],
      vt: [[0.7, 0.7], [-0.7, 0.7]],
      visualization: {
        type: "matrix",
        data: {
          u: [[0.8, 0.6], [0.6, -0.8]],
          sigma: [5.0, 3.0],
          vt: [[0.7, 0.7], [-0.7, 0.7]],
        },
      },
    };
  },
};
