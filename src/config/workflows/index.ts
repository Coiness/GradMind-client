import type { Workflow } from "@/types/workflow";

/**
 * Pre-built workflow templates
 */
export const templates: Workflow[] = [
  {
    id: "template-linear-regression",
    name: "Linear Regression",
    description: "Simple linear regression using least squares",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 200 },
        data: {
          label: "Training Data",
        },
      },
      {
        id: "ls-1",
        type: "algorithm",
        position: { x: 400, y: 200 },
        data: {
          algorithmKey: "least-squares",
          label: "Least Squares",
          parameters: {},
          status: "idle",
        },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "dataset-1",
        target: "ls-1",
        sourceHandle: "dataset",
        targetHandle: "xData",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-pca",
    name: "PCA Analysis",
    description: "Dimensionality reduction using PCA",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 200 },
        data: {
          label: "Input Dataset",
        },
      },
      {
        id: "pca-1",
        type: "algorithm",
        position: { x: 400, y: 200 },
        data: {
          algorithmKey: "pca",
          label: "PCA",
          parameters: { nComponents: 2 },
          status: "idle",
        },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "dataset-1",
        target: "pca-1",
        sourceHandle: "dataset",
        targetHandle: "dataset",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "template-gradient-descent",
    name: "Gradient Descent Optimization",
    description: "Optimize a function using gradient descent",
    nodes: [
      {
        id: "dataset-1",
        type: "dataset",
        position: { x: 100, y: 150 },
        data: {
          label: "Initial Point",
        },
      },
      {
        id: "gd-1",
        type: "algorithm",
        position: { x: 400, y: 150 },
        data: {
          algorithmKey: "gradient-descent",
          label: "Gradient Descent",
          parameters: { learningRate: 0.01, maxIterations: 100 },
          status: "idle",
        },
      },
    ],
    edges: [
      {
        id: "edge-1",
        source: "dataset-1",
        target: "gd-1",
        sourceHandle: "dataset",
        targetHandle: "initialPoint",
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
