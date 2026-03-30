import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Gradient Computation Algorithm
 * Computes the gradient (first derivative) of a function
 */
export const gradientAlgorithm: AlgorithmNode = {
  key: "gradient",
  name: "梯度计算",
  category: "analytical-optimization",
  description: "计算标量函数相对于其输入变量的梯度（偏导数向量）。",
  icon: "∇",

  inputs: [
    {
      id: "function",
      label: "目标函数",
      dataType: "function",
      required: true,
    },
    {
      id: "point",
      label: "求值点",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "gradient",
      label: "梯度向量",
      dataType: "vector",
    },
    {
      id: "magnitude",
      label: "梯度幅值",
      dataType: "scalar",
    },
  ],

  parameters: [
    {
      key: "method",
      label: "计算方法",
      type: "select",
      defaultValue: "numerical",
      options: {
        items: [
          { label: "数值法（有限差分）", value: "numerical" },
          { label: "自动微分", value: "autodiff" },
        ],
      },
    },
    {
      key: "epsilon",
      label: "步长（ε）",
      type: "number",
      defaultValue: 1e-5,
      options: {
        min: 1e-10,
        max: 1e-2,
        step: 1e-6,
      },
    },
  ],

  compute: async (inputs, params) => {
    const epsilon = Number(params.epsilon) || 1e-5;
    const method = params.method || "numerical";

    // 提取输入数据
    const functionInput = inputs.function;
    const pointInput = inputs.point;

    // 验证输入
    if (!functionInput) {
      throw new Error("缺少目标函数输入");
    }
    if (!pointInput) {
      throw new Error("缺少求值点输入");
    }

    // 提取点数据
    let point: number[];
    if (Array.isArray(pointInput)) {
      point = pointInput;
    } else if (pointInput.data) {
      point = Array.isArray(pointInput.data[0])
        ? pointInput.data[0]
        : pointInput.data;
    } else {
      throw new Error("无效的点数据格式");
    }

    // 提取函数
    let func: (x: number[]) => number;
    if (typeof functionInput === "function") {
      func = functionInput;
    } else if (typeof functionInput === "string") {
      // 如果是字符串，尝试解析为函数
      try {
        // 简单的函数解析：支持 x[0], x[1] 等形式
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

    // 计算梯度（使用数值微分）
    const gradient: number[] = [];
    const n = point.length;

    for (let i = 0; i < n; i++) {
      // 创建扰动向量
      const pointPlus = [...point];
      const pointMinus = [...point];
      pointPlus[i] += epsilon;
      pointMinus[i] -= epsilon;

      // 计算中心差分
      try {
        const fPlus = func(pointPlus);
        const fMinus = func(pointMinus);
        gradient[i] = (fPlus - fMinus) / (2 * epsilon);
      } catch (error) {
        throw new Error(
          `计算梯度时出错（维度 ${i}）: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }

    // 计算梯度范数
    const magnitude = Math.sqrt(gradient.reduce((sum, g) => sum + g * g, 0));

    return {
      gradient,
      magnitude,
      method,
      point,
      norm: magnitude,
      visualization: {
        type: "vector",
        data: {
          gradient,
          magnitude,
          point,
        },
      },
    };
  },
};
