import type { AlgorithmNode } from "@/types/algorithmNode";
import * as math from "mathjs";

/**
 * Hessian Matrix Algorithm
 * Computes the Hessian (second derivative matrix) of a function
 */
export const hessianAlgorithm: AlgorithmNode = {
  key: "hessian",
  name: "Hessian 矩阵",
  category: "analytical-optimization",
  description: "计算 Hessian 矩阵（二阶偏导数矩阵）以分析函数的曲率。",
  icon: "∇²",

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
      id: "hessian",
      label: "Hessian 矩阵",
      dataType: "matrix",
    },
    {
      id: "eigenvalues",
      label: "特征值",
      dataType: "vector",
    },
    {
      id: "convexity",
      label: "凸性分析",
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

    // 提取输入数据
    const functionInput = inputs.function;
    const pointInput = inputs.point;

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

    const n = point.length;
    const hessian: number[][] = Array(n)
      .fill(0)
      .map(() => Array(n).fill(0));

    try {
      // 计算 Hessian 矩阵的每个元素
      // H_ij = ∂²f/∂x_i∂x_j
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) {
            // 对角元素：∂²f/∂x_i²
            // 使用中心差分：f''(x) ≈ [f(x+h) - 2f(x) + f(x-h)] / h²
            const pointPlus = [...point];
            const pointMinus = [...point];
            pointPlus[i] += epsilon;
            pointMinus[i] -= epsilon;

            const fPlus = func(pointPlus);
            const fCenter = func(point);
            const fMinus = func(pointMinus);

            hessian[i][j] =
              (fPlus - 2 * fCenter + fMinus) / (epsilon * epsilon);
          } else {
            // 非对角元素：∂²f/∂x_i∂x_j
            // 使用混合偏导数公式
            const pointPP = [...point];
            const pointPM = [...point];
            const pointMP = [...point];
            const pointMM = [...point];

            pointPP[i] += epsilon;
            pointPP[j] += epsilon;

            pointPM[i] += epsilon;
            pointPM[j] -= epsilon;

            pointMP[i] -= epsilon;
            pointMP[j] += epsilon;

            pointMM[i] -= epsilon;
            pointMM[j] -= epsilon;

            const fPP = func(pointPP);
            const fPM = func(pointPM);
            const fMP = func(pointMP);
            const fMM = func(pointMM);

            hessian[i][j] = (fPP - fPM - fMP + fMM) / (4 * epsilon * epsilon);
          }
        }
      }

      // 计算特征值
      const H = math.matrix(hessian);
      const eigenResult = math.eigs(H);

      // 处理特征值：可能是 Matrix 对象或数组
      let eigenvalues = eigenResult.values;
      if (
        eigenvalues instanceof math.Matrix ||
        (eigenvalues as any).type === "Matrix"
      ) {
        eigenvalues = (eigenvalues as math.Matrix).toArray() as number[];
      } else if (!Array.isArray(eigenvalues)) {
        eigenvalues = [eigenvalues] as number[];
      }

      const processedEigenvalues = (eigenvalues as number[]).map((v) =>
        typeof v === "number" ? v : Math.abs(v),
      );

      // 判断凸性
      // 正定 (所有特征值 > 0) => 严格凸
      // 半正定 (所有特征值 >= 0) => 凸
      // 负定 (所有特征值 < 0) => 严格凹
      // 半负定 (所有特征值 <= 0) => 凹
      // 其他 => 鞍点
      const tolerance = 1e-8;
      const allPositive = processedEigenvalues.every((e) => e > tolerance);
      const allNonNegative = processedEigenvalues.every((e) => e >= -tolerance);
      const allNegative = processedEigenvalues.every((e) => e < -tolerance);
      const allNonPositive = processedEigenvalues.every((e) => e <= tolerance);

      let convexityType: string;
      let convexity: number;
      if (allPositive) {
        convexityType = "严格凸";
        convexity = 2;
      } else if (allNonNegative) {
        convexityType = "凸";
        convexity = 1;
      } else if (allNegative) {
        convexityType = "严格凹";
        convexity = -2;
      } else if (allNonPositive) {
        convexityType = "凹";
        convexity = -1;
      } else {
        convexityType = "鞍点";
        convexity = 0;
      }

      // 计算条件数
      const absEigenvalues = processedEigenvalues.map((e) => Math.abs(e));
      const maxEig = Math.max(...absEigenvalues);
      const minEig = Math.min(...absEigenvalues.filter((e) => e > tolerance));
      const conditionNumber = minEig > 0 ? maxEig / minEig : Infinity;

      return {
        hessian,
        eigenvalues: processedEigenvalues,
        convexity,
        convexityType,
        conditionNumber,
        isPositiveDefinite: allPositive,
        isPositiveSemidefinite: allNonNegative,
        visualization: {
          type: "matrix",
          data: {
            hessian,
            eigenvalues: processedEigenvalues,
            convexityType,
          },
        },
      };
    } catch (error) {
      throw new Error(
        `Hessian 矩阵计算失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};
