import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Least Squares Algorithm
 * Solves linear regression and curve fitting problems
 */
export const leastSquaresAlgorithm: AlgorithmNode = {
  key: "least-squares",
  name: "Least Squares",
  category: "analytical-optimization",
  description:
    "Finds the best-fitting parameters by minimizing the sum of squared residuals. Commonly used for linear regression and curve fitting.",
  icon: "📐",

  inputs: [
    {
      id: "xData",
      label: "X Data (Features)",
      dataType: "matrix",
      required: true,
    },
    {
      id: "yData",
      label: "Y Data (Targets)",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "coefficients",
      label: "Fitted Coefficients",
      dataType: "vector",
    },
    {
      id: "residuals",
      label: "Residuals",
      dataType: "vector",
    },
    {
      id: "rSquared",
      label: "R² Score",
      dataType: "scalar",
    },
  ],

  parameters: [
    {
      key: "method",
      label: "Solution Method",
      type: "select",
      defaultValue: "normal",
      options: {
        items: [
          { label: "Normal Equations", value: "normal" },
          { label: "QR Decomposition", value: "qr" },
          { label: "SVD", value: "svd" },
        ],
      },
    },
    {
      key: "regularization",
      label: "Regularization (λ)",
      type: "number",
      defaultValue: 0,
      options: {
        min: 0,
        max: 10,
        step: 0.1,
      },
    },
  ],

  compute: async (inputs, _params) => {
    // Mock implementation for MVP
    const xData = inputs.xData || [[1], [2], [3]];
    const yData = inputs.yData || [2, 4, 6];

    // Simulate computation delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Mock least squares solution
    const coefficients = [0.5, 1.8]; // [intercept, slope]
    const residuals = yData.map(
      (y: number, i: number) => y - (coefficients[0] + coefficients[1] * (i + 1)),
    );
    const rSquared = 0.95;

    return {
      coefficients,
      residuals,
      rSquared,
      visualization: {
        type: "regression",
        data: {
          xData,
          yData,
          coefficients,
          residuals,
          rSquared,
        },
      },
    };
  },
};
