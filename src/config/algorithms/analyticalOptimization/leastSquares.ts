import type { AlgorithmNode } from "@/types/algorithmNode";
import * as math from "mathjs";

/**
 * Least Squares Algorithm
 * Solves linear regression and curve fitting problems
 */
export const leastSquaresAlgorithm: AlgorithmNode = {
  key: "least-squares",
  name: "最小二乘法",
  category: "analytical-optimization",
  description:
    "通过最小化残差平方和来找到最佳拟合参数。常用于线性回归和曲线拟合。",
  icon: "📐",

  inputs: [
    {
      id: "xData",
      label: "X 数据（特征）",
      dataType: "matrix",
      required: true,
    },
    {
      id: "yData",
      label: "Y 数据（目标）",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "coefficients",
      label: "拟合系数",
      dataType: "vector",
    },
    {
      id: "residuals",
      label: "残差",
      dataType: "vector",
    },
    {
      id: "rSquared",
      label: "R² 分数",
      dataType: "scalar",
    },
  ],

  parameters: [
    {
      key: "method",
      label: "求解方法",
      type: "select",
      defaultValue: "normal",
      options: {
        items: [
          { label: "正规方程", value: "normal" },
          { label: "QR 分解", value: "qr" },
          { label: "SVD", value: "svd" },
        ],
      },
    },
    {
      key: "regularization",
      label: "正则化（λ）",
      type: "number",
      defaultValue: 0,
      options: {
        min: 0,
        max: 10,
        step: 0.1,
      },
    },
  ],

  compute: async (inputs, params) => {
    const method = params.method || "normal";
    const lambda = Number(params.regularization) || 0;

    // 提取输入数据
    let xData: number[][];
    let yData: number[];

    // 处理 X 数据
    const xInput = inputs.xData;
    if (!xInput) {
      throw new Error("缺少 X 数据输入");
    }
    if (Array.isArray(xInput)) {
      // 如果是一维数组，转换为二维
      if (typeof xInput[0] === "number") {
        xData = xInput.map((x: number) => [x]);
      } else {
        xData = xInput as number[][];
      }
    } else if (xInput.data) {
      xData = xInput.data;
    } else {
      throw new Error("无效的 X 数据格式");
    }

    // 处理 Y 数据
    const yInput = inputs.yData;
    if (!yInput) {
      throw new Error("缺少 Y 数据输入");
    }
    if (Array.isArray(yInput)) {
      yData = yInput as number[];
    } else if (yInput.data) {
      yData = Array.isArray(yInput.data[0]) ? yInput.data.map((row: number[]) => row[0]) : yInput.data;
    } else {
      throw new Error("无效的 Y 数据格式");
    }

    // 验证数据维度
    if (xData.length !== yData.length) {
      throw new Error(`X 和 Y 数据长度不匹配: ${xData.length} vs ${yData.length}`);
    }

    const n = xData.length;
    const m = xData[0].length;

    // 添加截距项（第一列全为1）
    const X = xData.map((row) => [1, ...row]);

    // 转换为 mathjs 矩阵
    const XMatrix = math.matrix(X);
    const yVector = math.matrix(yData);

    // 计算系数 β = (X^T X + λI)^(-1) X^T y
    let coefficients: number[];

    try {
      const XT = math.transpose(XMatrix);
      const XTX = math.multiply(XT, XMatrix) as math.Matrix;

      // 添加正则化项
      if (lambda > 0) {
        const I = math.identity(m + 1) as math.Matrix;
        const regularization = math.multiply(lambda, I) as math.Matrix;
        const XTXReg = math.add(XTX, regularization) as math.Matrix;
        const XTXInv = math.inv(XTXReg) as math.Matrix;
        const XTy = math.multiply(XT, yVector) as math.Matrix;
        const beta = math.multiply(XTXInv, XTy) as math.Matrix;
        coefficients = beta.toArray() as number[];
      } else {
        const XTXInv = math.inv(XTX) as math.Matrix;
        const XTy = math.multiply(XT, yVector) as math.Matrix;
        const beta = math.multiply(XTXInv, XTy) as math.Matrix;
        coefficients = beta.toArray() as number[];
      }
    } catch (error) {
      throw new Error(`最小二乘法求解失败: ${error instanceof Error ? error.message : String(error)}`);
    }

    // 计算预测值
    const predictions = X.map((row) =>
      row.reduce((sum, x, i) => sum + x * coefficients[i], 0)
    );

    // 计算残差
    const residuals = yData.map((y, i) => y - predictions[i]);

    // 计算 R²
    const yMean = yData.reduce((sum, y) => sum + y, 0) / n;
    const ssTot = yData.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0);
    const ssRes = residuals.reduce((sum, r) => sum + r * r, 0);
    const rSquared = 1 - ssRes / ssTot;

    // 计算均方误差
    const mse = ssRes / n;

    // 计算均方根误差
    const rmse = Math.sqrt(mse);

    return {
      coefficients,
      predictions,
      residuals,
      rSquared,
      mse,
      rmse,
      method,
      visualization: {
        type: "regression",
        data: {
          xData,
          yData,
          predictions,
          coefficients,
          residuals,
          rSquared,
        },
      },
    };
  },
};
