import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Mini-batch Gradient Descent Algorithm
 * Optimizes using small batches of data for efficiency
 */
export const miniBatchGDAlgorithm: AlgorithmNode = {
  key: "mini-batch-gd",
  name: "小批量梯度下降",
  category: "numerical-optimization",
  description:
    "使用小批量数据优化函数，在随机梯度下降的效率和批量梯度下降的稳定性之间取得平衡。",
  icon: "📦",

  inputs: [
    {
      id: "dataset",
      label: "训练数据集",
      dataType: "dataset",
      required: true,
    },
    {
      id: "model",
      label: "模型/函数",
      dataType: "function",
      required: true,
    },
    {
      id: "initialParams",
      label: "初始参数",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "parameters",
      label: "优化后的参数",
      dataType: "vector",
    },
    {
      id: "loss",
      label: "最终损失",
      dataType: "scalar",
    },
    {
      id: "lossHistory",
      label: "损失历史",
      dataType: "vector",
    },
  ],

  parameters: [
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
    {
      key: "learningRate",
      label: "学习率（α）",
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
      label: "训练轮数",
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
    const learningRate = Number(params.learningRate) || 0.01;
    const epochs = Number(params.epochs) || 50;
    const batchSize = Number(params.batchSize) || 32;
    const epsilon = 1e-5; // 用于数值梯度计算

    // 提取输入
    const datasetInput = inputs.dataset;
    const modelInput = inputs.model;
    const initialParamsInput = inputs.initialParams;

    if (!datasetInput) {
      throw new Error("缺少训练数据集输入");
    }
    if (!modelInput) {
      throw new Error("缺少模型/损失函数输入");
    }
    if (!initialParamsInput) {
      throw new Error("缺少初始参数输入");
    }

    // 提取初始参数
    let parameters: number[];
    if (Array.isArray(initialParamsInput)) {
      parameters = [...initialParamsInput];
    } else if (initialParamsInput.data) {
      parameters = Array.isArray(initialParamsInput.data[0])
        ? [...initialParamsInput.data[0]]
        : [...initialParamsInput.data];
    } else {
      throw new Error("无效的初始参数格式");
    }

    // 提取数据集
    let dataset: { X: number[][]; y: number[] };
    if (datasetInput.X && datasetInput.y) {
      dataset = {
        X: datasetInput.X,
        y: datasetInput.y,
      };
    } else if (datasetInput.data) {
      // 假设数据格式为 [[x1, x2, ..., y], ...]
      const data = datasetInput.data;
      dataset = {
        X: data.map((row: number[]) => row.slice(0, -1)),
        y: data.map((row: number[]) => row[row.length - 1]),
      };
    } else {
      throw new Error("无效的数据集格式");
    }

    const numSamples = dataset.X.length;
    if (numSamples === 0) {
      throw new Error("数据集为空");
    }

    // 提取损失函数
    let lossFunc: (params: number[], X: number[][], y: number[]) => number;
    if (typeof modelInput === "function") {
      lossFunc = modelInput;
    } else if (typeof modelInput === "string") {
      try {
        lossFunc = new Function("params", "X", "y", `return ${modelInput}`) as (
          params: number[],
          X: number[][],
          y: number[],
        ) => number;
      } catch (error) {
        throw new Error(
          `无法解析损失函数字符串: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    } else if (modelInput.func) {
      lossFunc = modelInput.func;
    } else {
      throw new Error("无效的损失函数格式");
    }

    // 数值梯度计算函数（针对批量数据）
    const computeGradient = (
      params: number[],
      batchX: number[][],
      batchY: number[],
    ): number[] => {
      const n = params.length;
      const grad: number[] = [];

      for (let i = 0; i < n; i++) {
        const paramsPlus = [...params];
        const paramsMinus = [...params];
        paramsPlus[i] += epsilon;
        paramsMinus[i] -= epsilon;

        const lossPlus = lossFunc(paramsPlus, batchX, batchY);
        const lossMinus = lossFunc(paramsMinus, batchX, batchY);
        grad[i] = (lossPlus - lossMinus) / (2 * epsilon);
      }

      return grad;
    };

    // Fisher-Yates 洗牌算法
    const shuffleData = (
      X: number[][],
      y: number[],
    ): { X: number[][]; y: number[] } => {
      const indices = Array.from({ length: X.length }, (_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return {
        X: indices.map((i) => X[i]),
        y: indices.map((i) => y[i]),
      };
    };

    // 小批量梯度下降主循环
    const lossHistory: number[] = [];
    let totalIterations = 0;

    try {
      for (let epoch = 0; epoch < epochs; epoch++) {
        // 打乱数据
        const shuffled = shuffleData(dataset.X, dataset.y);
        const { X: shuffledX, y: shuffledY } = shuffled;

        // 计算批次数量
        const numBatches = Math.ceil(numSamples / batchSize);
        let epochLoss = 0;

        // 对每个批次进行训练
        for (let batch = 0; batch < numBatches; batch++) {
          const startIdx = batch * batchSize;
          const endIdx = Math.min(startIdx + batchSize, numSamples);

          // 提取当前批次
          const batchX = shuffledX.slice(startIdx, endIdx);
          const batchY = shuffledY.slice(startIdx, endIdx);

          // 计算批次损失
          const batchLoss = lossFunc(parameters, batchX, batchY);
          epochLoss += batchLoss * (endIdx - startIdx);

          // 计算梯度
          const gradient = computeGradient(parameters, batchX, batchY);

          // 更新参数：θ = θ - α * ∇L(θ)
          parameters = parameters.map((p, i) => p - learningRate * gradient[i]);

          // 检查数值稳定性
          if (parameters.some((p) => !isFinite(p))) {
            throw new Error("优化过程中出现数值不稳定，请尝试减小学习率");
          }

          totalIterations++;
        }

        // 记录 epoch 平均损失
        const avgEpochLoss = epochLoss / numSamples;
        lossHistory.push(avgEpochLoss);
      }

      // 计算最终损失
      const finalLoss = lossFunc(parameters, dataset.X, dataset.y);

      return {
        parameters,
        optimizedParameters: parameters,
        loss: finalLoss,
        finalLoss,
        lossHistory,
        epochs: lossHistory.length,
        totalIterations,
        batchSize,
        learningRate,
        visualization: {
          type: "training",
          data: {
            lossHistory,
            parameters,
            epochs: lossHistory.length,
            batchSize,
            totalIterations,
            finalLoss,
          },
        },
      };
    } catch (error) {
      throw new Error(
        `小批量梯度下降失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};
