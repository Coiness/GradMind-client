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
      label: "目标函数(可选)",
      dataType: "function",
      required: false,
      description: "要计算梯度的目标函数",
    },
    {
      id: "point",
      label: "求值点",
      dataType: "vector",
      required: true,
      description: "计算梯度的坐标点",
    },
  ],

  outputs: [
    {
      id: "gradient",
      label: "梯度向量",
      dataType: "vector",
      description: "计算得到的偏导数向量",
    },
    {
      id: "magnitude",
      label: "梯度幅值",
      dataType: "scalar",
      description: "梯度向量的模长(接近0代表平稳点)",
    },
  ],

  parameters: [
    {
      key: "objectiveFunction",
      label: "内置目标函数",
      type: "select",
      defaultValue: "bowl",
      options: {
        items: [
          { label: "碗状函数 (Bowl)", value: "bowl" },
          { label: "马鞍函数 (Saddle)", value: "saddle" },
          { label: "Rosenbrock函数", value: "rosenbrock" },
        ],
      },
      description: "选择内置的测试函数(如果有连线输入则忽略此项)",
    },
    {
      key: "method",
      label: "差分方法",
      type: "select",
      defaultValue: "central",
      options: {
        items: [
          { label: "中心差分", value: "central" },
          { label: "前向差分", value: "forward" },
          { label: "后向差分", value: "backward" },
        ],
      },
    },
    {
      key: "epsilon",
      label: "步长 (ε)",
      type: "number",
      defaultValue: 1e-5,
      options: {
        min: 1e-8,
        max: 1e-1,
        step: 1e-6,
      },
    },
  ],

  compute: async (inputs, params) => {
    const epsilon = Number(params.epsilon) || 1e-5;
    const method = params.method || "central";

    // 提取输入数据
    const functionInput = inputs.function;
    const pointInput = inputs.point;

    // 验证输入
    if (!pointInput) {
      throw new Error("缺少求值点输入");
    }

    // 提取点数据
    let point: number[];
    if (Array.isArray(pointInput)) {
      point = pointInput.flat(Infinity) as number[];
    } else if (
      typeof pointInput === "object" &&
      pointInput !== null &&
      "data" in pointInput
    ) {
      const data = (pointInput as any).data;
      point = Array.isArray(data) ? (data.flat(Infinity) as number[]) : [0, 0];
    } else if (typeof pointInput === "number") {
      point = [pointInput];
    } else {
      throw new Error("求值点必须是向量或数字");
    }

    // 提取函数
    let func: (x: number[]) => number;
    if (!functionInput) {
      const objFunc = (params.objectiveFunction as string) || "bowl";
      switch (objFunc) {
        case "bowl":
          func = (x) => x[0] * x[0] + x[1] * x[1];
          break;
        case "saddle":
          func = (x) => x[0] * x[0] - x[1] * x[1];
          break;
        case "rosenbrock":
          func = (x) => Math.pow(1 - x[0], 2) + 100 * Math.pow(x[1] - x[0] * x[0], 2);
          break;
        default:
          func = (x) => x[0] * x[0] + x[1] * x[1];
      }
    } else if (typeof functionInput === "function") {
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
