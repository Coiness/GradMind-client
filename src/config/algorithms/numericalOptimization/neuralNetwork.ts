import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Neural Network Algorithm
 * Trains a simple feedforward neural network
 */
export const neuralNetworkAlgorithm: AlgorithmNode = {
  key: "neural-network",
  name: "Neural Network",
  category: "numerical-optimization",
  description:
    "Trains a feedforward neural network using backpropagation and gradient-based optimization.",
  icon: "🧠",

  inputs: [
    {
      id: "trainData",
      label: "Training Data",
      dataType: "dataset",
      required: true,
    },
    {
      id: "trainLabels",
      label: "Training Labels",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "model",
      label: "Trained Model",
      dataType: "model",
    },
    {
      id: "weights",
      label: "Network Weights",
      dataType: "matrix",
    },
    {
      id: "trainingLoss",
      label: "Training Loss History",
      dataType: "vector",
    },
    {
      id: "accuracy",
      label: "Final Accuracy",
      dataType: "scalar",
    },
  ],

  parameters: [
    {
      key: "hiddenLayers",
      label: "Hidden Layer Sizes",
      type: "select",
      defaultValue: "64,32",
      options: {
        items: [
          { label: "32", value: "32" },
          { label: "64", value: "64" },
          { label: "64, 32", value: "64,32" },
          { label: "128, 64, 32", value: "128,64,32" },
        ],
      },
    },
    {
      key: "activation",
      label: "Activation Function",
      type: "select",
      defaultValue: "relu",
      options: {
        items: [
          { label: "ReLU", value: "relu" },
          { label: "Sigmoid", value: "sigmoid" },
          { label: "Tanh", value: "tanh" },
        ],
      },
    },
    {
      key: "learningRate",
      label: "Learning Rate",
      type: "number",
      defaultValue: 0.001,
      options: {
        min: 0.0001,
        max: 0.1,
        step: 0.0001,
      },
    },
    {
      key: "epochs",
      label: "Training Epochs",
      type: "slider",
      defaultValue: 100,
      options: {
        min: 10,
        max: 500,
        step: 10,
      },
    },
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
  ],

  compute: async (_inputs, params) => {
    // Mock implementation for MVP
    const epochs = Number(params.epochs) || 100;
    const hiddenLayers = String(params.hiddenLayers) || "64,32";

    // Simulate computation delay (longer for NN training)
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock neural network training
    const trainingLoss = [];
    for (let epoch = 0; epoch < Math.min(epochs, 100); epoch++) {
      const loss = 2 * Math.exp(-epoch * 0.05) + Math.random() * 0.1;
      trainingLoss.push(loss);
    }

    const accuracy = 0.85 + Math.random() * 0.1;

    // Mock weights (simplified)
    const weights = [
      [0.5, -0.3, 0.8],
      [0.2, 0.6, -0.4],
    ];

    return {
      model: {
        type: "neural-network",
        architecture: hiddenLayers,
        activation: params.activation,
      },
      weights,
      trainingLoss,
      accuracy,
      visualization: {
        type: "training",
        data: {
          trainingLoss,
          accuracy,
          epochs: trainingLoss.length,
          architecture: hiddenLayers,
        },
      },
    };
  },
};
