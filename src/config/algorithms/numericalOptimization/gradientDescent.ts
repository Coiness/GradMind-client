import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Gradient Descent Algorithm
 * Iteratively optimizes a function by following the negative gradient
 */
export const gradientDescentAlgorithm: AlgorithmNode = {
  key: "gradient-descent",
  name: "梯度下降",
  category: "numerical-optimization",
  description:
    "通过在当前点沿负梯度方向迭代步进来最小化函数。",
  icon: "⬇️",

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
      defaultValue: 0.01,
      options: {
        min: 0.0001,
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
    {
      key: "tolerance",
      label: "收敛容差",
      type: "number",
      defaultValue: 1e-6,
      options: {
        min: 1e-10,
        max: 1e-2,
        step: 1e-7,
      },
    },
  ],

  compute: async (inputs, params) => {
    const learningRate = Number(params.learningRate) || 0.01;
    const maxIterations = Number(params.maxIterations) || 100;
    const tolerance = Number(params.tolerance) || 1e-6;
    const epsilon = 1e-5; // 用于数值梯度计算

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
          func = new Function("x", `return ${functionInput}`) as (x: number[]) => number;
        } catch (error) {
          throw new Error(`无法解析函数字符串: ${error instanceof Error ? error.message : String(error)}`);
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
        func = (x: number[]) => x.reduce((sum, value) => sum + value * value, 0);
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
        xPlus[i] += epsilon;
        xMinus[i] -= epsilon;

        const fPlus = func(xPlus);
        const fMinus = func(xMinus);
        grad[i] = (fPlus - fMinus) / (2 * epsilon);
      }

      return grad;
    };

    // 梯度下降主循环
    let point = [...initialPoint];
    const history: Array<{ point: number[]; value: number; gradient: number[]; gradNorm: number }> = [];
    let converged = false;
    let iterations = 0;

    try {
      for (let iter = 0; iter < maxIterations; iter++) {
        iterations = iter + 1;

        // 计算当前点的函数值
        const value = func(point);

        // 计算梯度
        const gradient = gradFunc ? gradFunc(point) : computeNumericalGradient(point);

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

        // 梯度下降更新：x_{k+1} = x_k - α * ∇f(x_k)
        point = point.map((x, i) => x - learningRate * gradient[i]);

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
        history: history.map((h) => h.value),
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
          },
        },
      };
    } catch (error) {
      throw new Error(`梯度下降失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};
