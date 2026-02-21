import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Lagrange Multiplier Algorithm
 * Solves constrained optimization problems using Lagrange multipliers
 */
export const lagrangeAlgorithm: AlgorithmNode = {
  key: "lagrange",
  name: "Lagrange 乘数法",
  category: "analytical-optimization",
  description:
    "使用 Lagrange 乘数法求解受等式约束的函数的局部极大值和极小值。",
  icon: "λ",

  inputs: [
    {
      id: "objective",
      label: "目标函数",
      dataType: "function",
      required: true,
    },
    {
      id: "constraints",
      label: "等式约束",
      dataType: "function",
      required: true,
    },
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
      id: "multipliers",
      label: "Lagrange 乘数",
      dataType: "vector",
    },
    {
      id: "objectiveValue",
      label: "目标值",
      dataType: "scalar",
    },
  ],

  parameters: [
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
  ],

  compute: async (inputs, params) => {
    const tolerance = Number(params.tolerance) || 1e-6;
    const maxIterations = Number(params.maxIterations) || 100;
    const learningRate = Number(params.learningRate) || 0.01;
    const epsilon = 1e-5; // 用于数值梯度计算

    // 提取输入
    const objectiveInput = inputs.objective;
    const constraintsInput = inputs.constraints;
    const initialPointInput = inputs.initialPoint;

    if (!objectiveInput) {
      throw new Error("缺少目标函数输入");
    }
    if (!constraintsInput) {
      throw new Error("缺少约束函数输入");
    }
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

    // 提取目标函数 f(x)
    let objectiveFunc: (x: number[]) => number;
    if (typeof objectiveInput === "function") {
      objectiveFunc = objectiveInput;
    } else if (typeof objectiveInput === "string") {
      try {
        objectiveFunc = new Function("x", `return ${objectiveInput}`) as (x: number[]) => number;
      } catch (error) {
        throw new Error(`无法解析目标函数字符串: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else if (objectiveInput.func) {
      objectiveFunc = objectiveInput.func;
    } else {
      throw new Error("无效的目标函数格式");
    }

    // 提取约束函数 g(x) = 0
    let constraintFunc: (x: number[]) => number | number[];
    if (typeof constraintsInput === "function") {
      constraintFunc = constraintsInput;
    } else if (typeof constraintsInput === "string") {
      try {
        constraintFunc = new Function("x", `return ${constraintsInput}`) as (x: number[]) => number | number[];
      } catch (error) {
        throw new Error(`无法解析约束函数字符串: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else if (constraintsInput.func) {
      constraintFunc = constraintsInput.func;
    } else {
      throw new Error("无效的约束函数格式");
    }

    // 数值梯度计算函数
    const computeGradient = (func: (x: number[]) => number, x: number[]): number[] => {
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

    // 计算约束函数的梯度
    const computeConstraintGradient = (x: number[], constraintIdx: number = 0): number[] => {
      const n = x.length;
      const grad: number[] = [];

      for (let i = 0; i < n; i++) {
        const xPlus = [...x];
        const xMinus = [...x];
        xPlus[i] += epsilon;
        xMinus[i] -= epsilon;

        const gPlus = constraintFunc(xPlus);
        const gMinus = constraintFunc(xMinus);

        const gPlusVal = Array.isArray(gPlus) ? gPlus[constraintIdx] : gPlus;
        const gMinusVal = Array.isArray(gMinus) ? gMinus[constraintIdx] : gMinus;

        grad[i] = (gPlusVal - gMinusVal) / (2 * epsilon);
      }

      return grad;
    };

    // 确定约束数量
    const testConstraint = constraintFunc(initialPoint);
    const numConstraints = Array.isArray(testConstraint) ? testConstraint.length : 1;

    // 初始化变量
    let x = [...initialPoint]; // 优化变量
    let lambda = new Array(numConstraints).fill(0.1); // Lagrange 乘数

    const history: Array<{
      x: number[];
      lambda: number[];
      objectiveValue: number;
      constraintValues: number[];
      gradNorm: number;
    }> = [];

    let converged = false;
    let iterations = 0;

    try {
      for (let iter = 0; iter < maxIterations; iter++) {
        iterations = iter + 1;

        // 计算目标函数值
        const objectiveValue = objectiveFunc(x);

        // 计算约束值
        const constraintResult = constraintFunc(x);
        const constraintValues = Array.isArray(constraintResult) ? constraintResult : [constraintResult];

        // 计算目标函数梯度 ∇f(x)
        const gradF = computeGradient(objectiveFunc, x);

        // 计算 Lagrange 函数的梯度
        // ∇L = ∇f(x) + Σ λᵢ * ∇gᵢ(x)
        let gradL = [...gradF];

        for (let i = 0; i < numConstraints; i++) {
          const gradG = computeConstraintGradient(x, i);
          gradL = gradL.map((val, j) => val + lambda[i] * gradG[j]);
        }

        // 计算梯度范数
        const gradNorm = Math.sqrt(gradL.reduce((sum, g) => sum + g * g, 0));
        const constraintNorm = Math.sqrt(constraintValues.reduce((sum, c) => sum + c * c, 0));

        // 记录历史
        history.push({
          x: [...x],
          lambda: [...lambda],
          objectiveValue,
          constraintValues: [...constraintValues],
          gradNorm,
        });

        // 检查 KKT 条件收敛
        if (gradNorm < tolerance && constraintNorm < tolerance) {
          converged = true;
          break;
        }

        // 更新 x：x = x - α * ∇L
        x = x.map((xi, i) => xi - learningRate * gradL[i]);

        // 更新 λ：使用梯度上升来满足约束
        // λ = λ + α * g(x)
        lambda = lambda.map((lam, i) => lam + learningRate * constraintValues[i]);

        // 检查数值稳定性
        if (x.some((xi) => !isFinite(xi)) || lambda.some((lam) => !isFinite(lam))) {
          throw new Error("优化过程中出现数值不稳定，请尝试减小学习率");
        }
      }

      // 计算最终值
      const finalObjectiveValue = objectiveFunc(x);
      const finalConstraintResult = constraintFunc(x);
      const finalConstraintValues = Array.isArray(finalConstraintResult)
        ? finalConstraintResult
        : [finalConstraintResult];

      return {
        solution: x,
        optimalPoint: x,
        multipliers: lambda,
        lagrangeMultipliers: lambda,
        objectiveValue: finalObjectiveValue,
        optimalValue: finalObjectiveValue,
        constraintValues: finalConstraintValues,
        iterations,
        converged,
        history: history.map((h) => [...h.x, ...h.lambda, h.objectiveValue]),
        detailedHistory: history,
        finalGradientNorm: history[history.length - 1]?.gradNorm || 0,
        visualization: {
          type: "convergence",
          data: {
            solution: x,
            multipliers: lambda,
            objectiveValue: finalObjectiveValue,
            constraintValues: finalConstraintValues,
            iterations,
            converged,
            history: history.map((h) => h.objectiveValue),
            constraintHistory: history.map((h) => h.constraintValues),
            gradientNorms: history.map((h) => h.gradNorm),
          },
        },
      };
    } catch (error) {
      throw new Error(`Lagrange 乘数法失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
};
