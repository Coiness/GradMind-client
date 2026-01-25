import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Mini-batch Gradient Descent Algorithm
 * Optimizes using small batches of data for efficiency
 */
export const miniBatchGDAlgorithm: AlgorithmNode = {
  key: "mini-batch-gd",
  name: "Mini-batch Gradient Descent",
  category: "numerical-optimization",
  description:
    "Optimizes a function using mini-batches of data, balancing the efficiency of stochastic gradient descent with the stability of batch gradient descent.",
  icon: "📦",

  inputs: [
    {
      id: "dataset",
      label: "Training Dataset",
      dataType: "dataset",
      required: true,
    },
    {
      id: "model",
      label: "Model/Function",
      dataType: "function",
      required: true,
    },
    {
      id: "initialParams",
      label: "Initial Parameters",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "parameters",
      label: "Optimized Parameters",
      dataType: "vector",
    },
    {
      id: "loss",
      label: "Final Loss",
      dataType: "scalar",
    },
    {
      id: "lossHistory",
      label: "Loss History",
      dataType: "vector",
    },
  ],

  parameters: [
    {
      key: "batchSize",
      label: "Batch Size",
      type: "slider",
      defaultValue: 32,
      options: {
        min: 1,
        max: 256,
        step: 1,
      },
    },
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
      key: "epochs",
      label: "Number of Epochs",
      type: "slider",
      defaultValue: 50,
      options: {
        min: 1,
        max: 500,
        step: 1,
      },
    },
  ],

  compute: async (inputs, params) => {
    // Mock implementation for MVP
    const initialParams = inputs.initialParams || [0, 0];
    const epochs = Number(params.epochs) || 50;
    const batchSize = Number(params.batchSize) || 32;

    // Simulate computation delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock mini-batch GD training
    const lossHistory = [];
    let parameters = [...initialParams];

    for (let epoch = 0; epoch < Math.min(epochs, 50); epoch++) {
      const loss = 10 * Math.exp(-epoch * 0.1) + Math.random() * 0.5;
      lossHistory.push(loss);

      // Simulate parameter update
      parameters = parameters.map((p: number) => p + Math.random() * 0.1 - 0.05);
    }

    return {
      parameters,
      loss: lossHistory[lossHistory.length - 1],
      lossHistory,
      visualization: {
        type: "training",
        data: {
          lossHistory,
          parameters,
          epochs: lossHistory.length,
          batchSize,
        },
      },
    };
  },
};
