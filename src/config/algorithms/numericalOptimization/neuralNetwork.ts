import type { AlgorithmNode } from "@/types/algorithmNode";
import * as math from "mathjs";

/**
 * Neural Network Algorithm
 * Trains a simple feedforward neural network with backpropagation
 */

// 激活函数及其导数
const activationFunctions = {
  sigmoid: {
    forward: (z: number[][]): number[][] => {
      return z.map((row) => row.map((val) => 1 / (1 + Math.exp(-val))));
    },
    backward: (a: number[][]): number[][] => {
      return a.map((row) => row.map((val) => val * (1 - val)));
    },
  },
  relu: {
    forward: (z: number[][]): number[][] => {
      return z.map((row) => row.map((val) => Math.max(0, val)));
    },
    backward: (z: number[][]): number[][] => {
      return z.map((row) => row.map((val) => (val > 0 ? 1 : 0)));
    },
  },
  tanh: {
    forward: (z: number[][]): number[][] => {
      return z.map((row) => row.map((val) => Math.tanh(val)));
    },
    backward: (a: number[][]): number[][] => {
      return a.map((row) => row.map((val) => 1 - val * val));
    },
  },
};

// Xavier 初始化
const xavierInitialize = (nIn: number, nOut: number): number[][] => {
  const limit = Math.sqrt(6 / (nIn + nOut));
  const weights: number[][] = [];
  for (let i = 0; i < nOut; i++) {
    const row: number[] = [];
    for (let j = 0; j < nIn; j++) {
      row.push(Math.random() * 2 * limit - limit);
    }
    weights.push(row);
  }
  return weights;
};

// 矩阵乘法
const matrixMultiply = (a: number[][], b: number[][]): number[][] => {
  const result = math.multiply(math.matrix(a), math.matrix(b));
  const size = math.size(result).valueOf() as number[];
  return math.subset(
    result,
    math.index(math.range(0, size[0]), math.range(0, size[1])),
  ) as unknown as number[][];
};

// 矩阵转置
const transpose = (matrix: number[][]): number[][] => {
  return math.transpose(math.matrix(matrix)).valueOf() as number[][];
};

// 矩阵减法
const matrixSubtract = (a: number[][], b: number[][]): number[][] => {
  return a.map((row, i) => row.map((val, j) => val - b[i][j]));
};

// 逐元素乘法（Hadamard product）
const hadamardProduct = (a: number[][], b: number[][]): number[][] => {
  return a.map((row, i) => row.map((val, j) => val * b[i][j]));
};

// 标量乘法
const scalarMultiply = (matrix: number[][], scalar: number): number[][] => {
  return matrix.map((row) => row.map((val) => val * scalar));
};

// 计算 MSE 损失
const computeMSE = (predictions: number[][], targets: number[][]): number => {
  let sum = 0;
  const n = predictions.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < predictions[i].length; j++) {
      const diff = predictions[i][j] - targets[i][j];
      sum += diff * diff;
    }
  }
  return sum / n;
};

// 计算准确率（用于分类问题）
const computeAccuracy = (
  predictions: number[][],
  targets: number[][],
): number => {
  let correct = 0;
  const n = predictions.length;

  for (let i = 0; i < n; i++) {
    const predClass = predictions[i].indexOf(Math.max(...predictions[i]));
    const targetClass = targets[i].indexOf(Math.max(...targets[i]));
    if (predClass === targetClass) {
      correct++;
    }
  }

  return correct / n;
};

export const neuralNetworkAlgorithm: AlgorithmNode = {
  key: "neural-network",
  name: "神经网络",
  category: "numerical-optimization",
  description: "使用反向传播和基于梯度的优化训练前馈神经网络。",
  icon: "🧠",

  inputs: [
    {
      id: "trainData",
      label: "训练数据",
      dataType: "dataset",
      required: true,
    },
    {
      id: "trainLabels",
      label: "训练标签",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "model",
      label: "训练好的模型",
      dataType: "model",
    },
    {
      id: "weights",
      label: "网络权重",
      dataType: "matrix",
    },
    {
      id: "trainingLoss",
      label: "训练损失历史",
      dataType: "vector",
    },
    {
      id: "accuracy",
      label: "最终准确率",
      dataType: "scalar",
    },
  ],

  parameters: [
    {
      key: "hiddenLayers",
      label: "隐藏层大小",
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
      label: "激活函数",
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
      label: "学习率",
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
      label: "训练轮数",
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
      label: "批量大小",
      type: "slider",
      defaultValue: 32,
      options: {
        min: 1,
        max: 256,
        step: 1,
      },
    },
  ],

  compute: async (inputs, params) => {
    // 提取参数
    const learningRate = Number(params.learningRate) || 0.001;
    const epochs = Number(params.epochs) || 100;
    const batchSize = Number(params.batchSize) || 32;
    const activationType = String(params.activation) || "relu";
    const hiddenLayersStr = String(params.hiddenLayers) || "64,32";

    // 解析隐藏层配置
    const hiddenLayerSizes = hiddenLayersStr
      .split(",")
      .map((s) => parseInt(s.trim()));

    // 提取训练数据
    const trainDataInput = inputs.trainData;
    const trainLabelsInput = inputs.trainLabels;

    if (!trainDataInput) {
      throw new Error("缺少训练数据输入");
    }
    if (!trainLabelsInput) {
      throw new Error("缺少训练标签输入");
    }

    // 解析训练数据
    let X: number[][];
    if (Array.isArray(trainDataInput)) {
      X = trainDataInput;
    } else if (trainDataInput.data) {
      X = trainDataInput.data;
    } else {
      throw new Error("无效的训练数据格式");
    }

    // 解析训练标签
    let Y: number[][];
    if (Array.isArray(trainLabelsInput)) {
      // 如果是一维数组，转换为二维
      if (typeof trainLabelsInput[0] === "number") {
        Y = trainLabelsInput.map((label) => [label]);
      } else {
        Y = trainLabelsInput as number[][];
      }
    } else if (trainLabelsInput.data) {
      const data = trainLabelsInput.data;
      if (typeof data[0] === "number") {
        Y = data.map((label: number) => [label]);
      } else {
        Y = data as number[][];
      }
    } else {
      throw new Error("无效的训练标签格式");
    }

    // 验证数据维度
    const nSamples = X.length;
    const nFeatures = X[0].length;
    const nOutputs = Y[0].length;

    if (Y.length !== nSamples) {
      throw new Error(`训练数据和标签数量不匹配: ${nSamples} vs ${Y.length}`);
    }

    // 构建网络架构
    const layerSizes = [nFeatures, ...hiddenLayerSizes, nOutputs];
    const nLayers = layerSizes.length;

    // 初始化权重和偏置（Xavier 初始化）
    const weights: number[][][] = [];
    const biases: number[][][] = [];

    for (let l = 0; l < nLayers - 1; l++) {
      weights.push(xavierInitialize(layerSizes[l], layerSizes[l + 1]));
      biases.push(
        Array(layerSizes[l + 1])
          .fill(0)
          .map(() => [0]),
      );
    }

    // 获取激活函数
    const activation =
      activationFunctions[activationType as keyof typeof activationFunctions];
    if (!activation) {
      throw new Error(`不支持的激活函数: ${activationType}`);
    }

    // 训练历史
    const lossHistory: number[] = [];
    const accuracyHistory: number[] = [];

    try {
      // 训练循环
      for (let epoch = 0; epoch < epochs; epoch++) {
        let epochLoss = 0;
        let epochAccuracy = 0;
        const numBatches = Math.ceil(nSamples / batchSize);

        // 小批量训练
        for (let batch = 0; batch < numBatches; batch++) {
          const startIdx = batch * batchSize;
          const endIdx = Math.min(startIdx + batchSize, nSamples);
          const batchX = X.slice(startIdx, endIdx);
          const batchY = Y.slice(startIdx, endIdx);
          const currentBatchSize = batchX.length;

          // === 前向传播 ===
          const activations: number[][][] = [batchX];
          const zValues: number[][][] = [];

          for (let l = 0; l < nLayers - 1; l++) {
            // z^[l] = W^[l] * a^[l-1] + b^[l]
            const z = matrixMultiply(activations[l], transpose(weights[l]));

            // 添加偏置
            for (let i = 0; i < z.length; i++) {
              for (let j = 0; j < z[i].length; j++) {
                z[i][j] += biases[l][j][0];
              }
            }

            zValues.push(z);

            // a^[l] = activation(z^[l])
            let a: number[][];
            if (l === nLayers - 2) {
              // 输出层使用 sigmoid（用于回归或二分类）
              a = activationFunctions.sigmoid.forward(z);
            } else {
              // 隐藏层使用指定的激活函数
              a = activation.forward(z);
            }

            activations.push(a);
          }

          // 计算损失
          const predictions = activations[nLayers - 1];
          const loss = computeMSE(predictions, batchY);
          epochLoss += loss * currentBatchSize;

          // 计算准确率（如果是分类问题）
          if (nOutputs > 1) {
            const acc = computeAccuracy(predictions, batchY);
            epochAccuracy += acc * currentBatchSize;
          }

          // === 反向传播 ===
          const deltas: number[][][] = [];

          // 输出层误差: δ^[L] = (a^[L] - y) ⊙ activation'(z^[L])
          const outputError = matrixSubtract(predictions, batchY);
          const outputActivationDerivative =
            activationFunctions.sigmoid.backward(predictions);
          deltas.unshift(
            hadamardProduct(outputError, outputActivationDerivative),
          );

          // 隐藏层误差: δ^[l] = (W^[l+1])^T * δ^[l+1] ⊙ activation'(z^[l])
          for (let l = nLayers - 3; l >= 0; l--) {
            const weightTranspose = weights[l + 1];
            const delta = matrixMultiply(deltas[0], weightTranspose);

            let activationDerivative: number[][];
            if (activationType === "relu") {
              activationDerivative = activation.backward(zValues[l]);
            } else {
              activationDerivative = activation.backward(activations[l + 1]);
            }

            deltas.unshift(hadamardProduct(delta, activationDerivative));
          }

          // === 参数更新 ===
          for (let l = 0; l < nLayers - 1; l++) {
            // ∇W^[l] = (1/m) * δ^[l]^T * a^[l-1]
            const gradW = matrixMultiply(transpose(deltas[l]), activations[l]);
            const gradWScaled = scalarMultiply(
              gradW,
              learningRate / currentBatchSize,
            );

            // W^[l] = W^[l] - α * ∇W^[l]
            weights[l] = matrixSubtract(weights[l], gradWScaled);

            // ∇b^[l] = (1/m) * Σ δ^[l]
            const gradB: number[][] = [];
            for (let j = 0; j < deltas[l][0].length; j++) {
              let sum = 0;
              for (let i = 0; i < deltas[l].length; i++) {
                sum += deltas[l][i][j];
              }
              gradB.push([sum / currentBatchSize]);
            }

            // b^[l] = b^[l] - α * ∇b^[l]
            biases[l] = matrixSubtract(
              biases[l],
              scalarMultiply(gradB, learningRate),
            );
          }
        }

        // 记录 epoch 统计
        epochLoss /= nSamples;
        lossHistory.push(epochLoss);

        if (nOutputs > 1) {
          epochAccuracy /= nSamples;
          accuracyHistory.push(epochAccuracy);
        }

        // 检查数值稳定性
        if (!isFinite(epochLoss)) {
          throw new Error("训练过程中出现数值不稳定，请尝试减小学习率");
        }
      }

      // === 最终预测 ===
      let finalActivations = X;
      for (let l = 0; l < nLayers - 1; l++) {
        const z = matrixMultiply(finalActivations, transpose(weights[l]));

        // 添加偏置
        for (let i = 0; i < z.length; i++) {
          for (let j = 0; j < z[i].length; j++) {
            z[i][j] += biases[l][j][0];
          }
        }

        if (l === nLayers - 2) {
          finalActivations = activationFunctions.sigmoid.forward(z);
        } else {
          finalActivations = activation.forward(z);
        }
      }

      const finalPredictions = finalActivations;
      const finalLoss = lossHistory[lossHistory.length - 1];
      const finalAccuracy =
        nOutputs > 1
          ? computeAccuracy(finalPredictions, Y)
          : 1 - Math.min(finalLoss, 1); // 回归问题的伪准确率

      return {
        model: {
          type: "neural-network",
          architecture: layerSizes,
          activation: activationType,
          weights,
          biases,
        },
        weights: weights[0], // 返回第一层权重作为示例
        trainingLoss: lossHistory,
        lossHistory,
        accuracyHistory: nOutputs > 1 ? accuracyHistory : undefined,
        accuracy: finalAccuracy,
        finalLoss,
        predictions: finalPredictions,
        epochs: lossHistory.length,
        visualization: {
          type: "training",
          data: {
            trainingLoss: lossHistory,
            accuracyHistory: nOutputs > 1 ? accuracyHistory : undefined,
            accuracy: finalAccuracy,
            epochs: lossHistory.length,
            architecture: layerSizes,
            activationType,
            finalLoss,
          },
        },
      };
    } catch (error) {
      throw new Error(
        `神经网络训练失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};
