import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Advanced Optimizer Algorithm
 * Implements modern optimization algorithms like Adam, RMSprop, AdaGrad
 */
export const advancedOptimizerAlgorithm: AlgorithmNode = {
  key: "advanced-optimizer",
  name: "高级优化器（Adam/RMSprop）",
  category: "numerical-optimization",
  description:
    "现代自适应学习率优化算法，包括 Adam、RMSprop 和 AdaGrad，可实现更快、更稳定的收敛。",
  icon: "🚀",

  inputs: [
    {
      id: "initialPoint",
      label: "初始点",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "solution",
      label: "最优点",
      dataType: "vector",
    },
    {
      id: "objectiveValue",
      label: "最终目标值",
      dataType: "scalar",
    },
    {
      id: "history",
      label: "收敛历史",
      dataType: "matrix",
    },
  ],

  parameters: [
    {
      key: "optimizer",
      label: "优化器类型",
      type: "select",
      defaultValue: "adam",
      options: {
        items: [
          { label: "Adam", value: "adam" },
          { label: "RMSprop", value: "rmsprop" },
          { label: "AdaGrad", value: "adagrad" },
        ],
      },
    },
    {
      key: "objectiveFunction",
      label: "目标函数",
      type: "select",
      defaultValue: "bowl",
      options: {
        items: [
          { label: "碗状函数 (x²+y²)", value: "bowl" },
          { label: "马鞍面 (x²-y²)", value: "saddle" },
          { label: "Rosenbrock (香蕉函数)", value: "rosenbrock" },
        ],
      },
    },
    {
      key: "learningRate",
      label: "学习率（α）",
      type: "number",
      defaultValue: 0.001,
      options: {
        min: 0.0001,
        max: 0.1,
        step: 0.0001,
      },
    },
    {
      key: "beta1",
      label: "Beta1（仅 Adam）",
      type: "number",
      defaultValue: 0.9,
      options: {
        min: 0,
        max: 1,
        step: 0.01,
      },
    },
    {
      key: "beta2",
      label: "Beta2（仅 Adam）",
      type: "number",
      defaultValue: 0.999,
      options: {
        min: 0,
        max: 1,
        step: 0.001,
      },
    },
    {
      key: "maxIterations",
      label: "最大迭代次数",
      type: "slider",
      defaultValue: 100,
      options: {
        min: 10,
        max: 1000,
        step: 10,
      },
    },
  ],

  compute: async (inputs, params) => {
    const learningRate = Number(params.learningRate) || 0.001;
    const maxIterations = Number(params.maxIterations) || 100;
    const optimizer = params.optimizer || "adam";
    const beta1 = Number(params.beta1) || 0.9;
    const beta2 = Number(params.beta2) || 0.999;
    const epsilon = 1e-8; // 用于数值稳定性
    const gradEpsilon = 1e-5; // 用于数值梯度计算
    const tolerance = 1e-6; // 收敛容差

    // 提取输入
    const functionInput = inputs.function;
    const gradientInput = inputs.gradient;
    const initialPointInput = inputs.initialPoint;

    if (!initialPointInput) {
      throw new Error("缺少初始点输入");
    }

    // 提取初始点
    let initialPoint: number[];
    if (Array.isArray(initialPointInput)) {
      initialPoint = initialPointInput;
    } else if (initialPointInput.data) {
      initialPoint = Array.isArray(initialPointInput.data[0])
        ? initialPointInput.data[0]
        : initialPointInput.data;
    } else {
      throw new Error("无效的初始点格式");
    }

    // 提取目标函数
    const objFuncType = params.objectiveFunction || "bowl";

    let func: (x: number[]) => number;
    if (functionInput !== undefined) {
      // 兼容外部传入
      if (typeof functionInput === "function") {
        func = functionInput;
      } else if (typeof functionInput === "string") {
        try {
          func = new Function("x", `return ${functionInput}`) as (
            x: number[],
          ) => number;
        } catch (error) {
          throw new Error(
            `无法解析函数字符串: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
      } else if (functionInput.func) {
        func = functionInput.func;
      } else {
        throw new Error("无效的函数格式");
      }
    } else {
      // 使用内置预设函数
      if (objFuncType === "saddle") {
        func = (x: number[]) => (x[0] || 0) ** 2 - (x[1] || 0) ** 2;
      } else if (objFuncType === "rosenbrock") {
        func = (x: number[]) => {
          const x0 = x[0] || 0;
          const x1 = x[1] || 0;
          return (1 - x0) ** 2 + 100 * (x1 - x0 ** 2) ** 2;
        };
      } else {
        // bowl
        func = (x: number[]) =>
          x.reduce((sum, value) => sum + value * value, 0);
      }
    }

    // 提取梯度函数（如果提供）
    let gradFunc: ((x: number[]) => number[]) | null = null;
    if (gradientInput) {
      if (typeof gradientInput === "function") {
        gradFunc = gradientInput;
      } else if (gradientInput.func) {
        gradFunc = gradientInput.func;
      }
    }

    // 数值梯度计算函数
    const computeNumericalGradient = (x: number[]): number[] => {
      const n = x.length;
      const grad: number[] = [];

      for (let i = 0; i < n; i++) {
        const xPlus = [...x];
        const xMinus = [...x];
        xPlus[i] += gradEpsilon;
        xMinus[i] -= gradEpsilon;

        const fPlus = func(xPlus);
        const fMinus = func(xMinus);
        grad[i] = (fPlus - fMinus) / (2 * gradEpsilon);
      }

      return grad;
    };

    // 初始化优化器状态
    let point = [...initialPoint];
    const n = point.length;
    const history: Array<{
      point: number[];
      value: number;
      gradient: number[];
      gradNorm: number;
    }> = [];
    let converged = false;
    let iterations = 0;

    // Adam 优化器状态
    let m = new Array(n).fill(0); // 一阶矩估计
    let v = new Array(n).fill(0); // 二阶矩估计

    // RMSprop 优化器状态
    let vRms = new Array(n).fill(0); // 二阶矩估计

    try {
      for (let iter = 0; iter < maxIterations; iter++) {
        iterations = iter + 1;

        // 计算当前点的函数值
        const value = func(point);

        // 计算梯度
        const gradient = gradFunc
          ? gradFunc(point)
          : computeNumericalGradient(point);

        // 计算梯度范数
        const gradNorm = Math.sqrt(gradient.reduce((sum, g) => sum + g * g, 0));

        // 记录历史
        history.push({
          point: [...point],
          value,
          gradient: [...gradient],
          gradNorm,
        });

        // 检查收敛
        if (gradNorm < tolerance) {
          converged = true;
          break;
        }

        // 根据优化器类型更新参数
        if (optimizer === "adam") {
          // Adam 算法
          // 更新一阶矩估计: m_t = β1*m_{t-1} + (1-β1)*g_t
          m = m.map((mi, i) => beta1 * mi + (1 - beta1) * gradient[i]);

          // 更新二阶矩估计: v_t = β2*v_{t-1} + (1-β2)*g_t²
          v = v.map(
            (vi, i) => beta2 * vi + (1 - beta2) * gradient[i] * gradient[i],
          );

          // 偏差修正
          const mHat = m.map((mi) => mi / (1 - Math.pow(beta1, iterations)));
          const vHat = v.map((vi) => vi / (1 - Math.pow(beta2, iterations)));

          // 更新参数: x_t = x_{t-1} - α*m̂_t/(√v̂_t + ε)
          point = point.map(
            (x, i) =>
              x - (learningRate * mHat[i]) / (Math.sqrt(vHat[i]) + epsilon),
          );
        } else if (optimizer === "rmsprop") {
          // RMSprop 算法
          // 更新: v_t = β*v_{t-1} + (1-β)*g_t²
          vRms = vRms.map(
            (vi, i) => beta2 * vi + (1 - beta2) * gradient[i] * gradient[i],
          );

          // 更新参数: x_t = x_{t-1} - α*g_t/(√v_t + ε)
          point = point.map(
            (x, i) =>
              x - (learningRate * gradient[i]) / (Math.sqrt(vRms[i]) + epsilon),
          );
        } else if (optimizer === "adagrad") {
          // AdaGrad 算法
          // 累积梯度平方
          v = v.map((vi, i) => vi + gradient[i] * gradient[i]);

          // 更新参数: x_t = x_{t-1} - α*g_t/(√v_t + ε)
          point = point.map(
            (x, i) =>
              x - (learningRate * gradient[i]) / (Math.sqrt(v[i]) + epsilon),
          );
        } else {
          throw new Error(`不支持的优化器类型: ${optimizer}`);
        }

        // 检查是否有 NaN 或 Infinity
        if (point.some((x) => !isFinite(x))) {
          throw new Error("优化过程中出现数值不稳定，请尝试减小学习率");
        }
      }

      // 计算最终值
      const finalValue = func(point);

      return {
        solution: point,
        optimalPoint: point,
        objectiveValue: finalValue,
        optimalValue: finalValue,
        iterations,
        converged,
        optimizer,
        history: history.map((h) => [...h.point, h.value]),
        detailedHistory: history,
        finalGradientNorm: history[history.length - 1]?.gradNorm || 0,
        visualization: {
          type: "convergence",
          data: {
            history: history.map((h) => h.value),
            points: history.map((h) => h.point),
            gradientNorms: history.map((h) => h.gradNorm),
            solution: point,
            iterations,
            converged,
            optimizer,
          },
        },
      };
    } catch (error) {
      throw new Error(
        `${optimizer} 优化失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};
