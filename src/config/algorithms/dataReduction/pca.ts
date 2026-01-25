import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Principal Component Analysis (PCA) Algorithm
 * Reduces dimensionality by finding principal components
 */
export const pcaAlgorithm: AlgorithmNode = {
  key: "pca",
  name: "PCA (Principal Component Analysis)",
  category: "data-reduction",
  description:
    "Reduces the dimensionality of data by projecting it onto the principal components (directions of maximum variance).",
  icon: "📉",

  inputs: [
    {
      id: "dataset",
      label: "Input Dataset",
      dataType: "matrix",
      required: true,
    },
  ],

  outputs: [
    {
      id: "components",
      label: "Principal Components",
      dataType: "matrix",
    },
    {
      id: "variance",
      label: "Explained Variance",
      dataType: "vector",
    },
    {
      id: "transformed",
      label: "Transformed Data",
      dataType: "matrix",
    },
  ],

  parameters: [
    {
      key: "nComponents",
      label: "Number of Components",
      type: "slider",
      defaultValue: 2,
      options: {
        min: 1,
        max: 10,
        step: 1,
      },
    },
    {
      key: "center",
      label: "Center Data",
      type: "select",
      defaultValue: "true",
      options: {
        items: [
          { label: "Yes", value: "true" },
          { label: "No", value: "false" },
        ],
      },
    },
  ],

  compute: async (_inputs, params) => {
    // Mock implementation for MVP
    const nComponents = Number(params.nComponents) || 2;

    // Simulate computation delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock result
    return {
      components: Array(nComponents)
        .fill(0)
        .map(() => [Math.random(), Math.random()]),
      variance: Array(nComponents)
        .fill(0)
        .map((_, i) => 0.9 - i * 0.1),
      transformed: [[1.2, 0.8], [0.5, -0.3], [-0.7, 0.2]],
      visualization: {
        type: "scatter",
        data: {
          points: [[1.2, 0.8], [0.5, -0.3], [-0.7, 0.2]],
          variance: Array(nComponents)
            .fill(0)
            .map((_, i) => 0.9 - i * 0.1),
        },
      },
    };
  },
};
