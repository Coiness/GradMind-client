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
      id: "dataset",
      label: "输入数据集",
      dataType: "matrix",
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
    {
      key: "targetColumn",
      label: "目标列索引 (0起,-1为最后一列)",
      type: "number",
      defaultValue: -1,
      options: {
        min: -1,
        max: 10,
        step: 1,
      },
    },
  ],

  compute: async (inputs, params) => {
    const method = params.method || "normal";
    const lambda = Number(params.regularization) || 0;
    const targetColParam = Number(params.targetColumn);
    const targetColumn = isNaN(targetColParam) ? -1 : targetColParam;

    // 提取输入数据
    let rawData: number[][];

    const datasetInput = inputs.dataset;
    if (!datasetInput) {
      throw new Error("缺少数据集输入");
    }

    if (Array.isArray(datasetInput)) {
      if (typeof datasetInput[0] === "number") {
        throw new Error("数据集必须是二维矩阵");
      }
      rawData = datasetInput as number[][];
    } else if (datasetInput.data && Array.isArray(datasetInput.data)) {
      rawData = datasetInput.data;
    } else {
      throw new Error("无效的数据集格式");
    }

    if (rawData.length === 0 || rawData[0].length < 2) {
      throw new Error("数据集至少需要两列（特征和目标）");
    }

    const n = rawData.length;
    const m = rawData[0].length;

    // 确定目标列索引
    const yCol = targetColumn < 0 ? m - 1 : Math.min(targetColumn, m - 1);

    // 分离 X 和 Y
    const xData: number[][] = [];
    const yData: number[] = [];

    for (let i = 0; i < n; i++) {
      const row = rawData[i];
      yData.push(row[yCol]);

      const xRow = [];
      for (let j = 0; j < m; j++) {
        if (j !== yCol) {
          xRow.push(row[j]);
        }
      }
      xData.push(xRow);
    }

    // 验证数据维度
    if (xData.length !== yData.length) {
      throw new Error(
        `X 和 Y 数据长度不匹配: ${xData.length} vs ${yData.length}`,
      );
    }

    const numFeatures = xData[0].length;

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
        const I = math.identity(numFeatures + 1) as math.Matrix;
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
      throw new Error(
        `最小二乘法求解失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    // 计算预测值
    const predictions = X.map((row) =>
      row.reduce((sum, x, i) => sum + x * coefficients[i], 0),
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
