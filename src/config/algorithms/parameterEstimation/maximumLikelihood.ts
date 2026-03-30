import type { AlgorithmNode } from "@/types/algorithmNode";
import * as math from "mathjs";

function getZScoreByLevel(level: number): number {
  if (level >= 0.99) return 2.576;
  if (level >= 0.98) return 2.326;
  if (level >= 0.95) return 1.96;
  if (level >= 0.9) return 1.645;
  return 1.282;
}

/**
 * Maximum Likelihood Estimation (MLE) Algorithm
 * Estimates parameters by maximizing the likelihood function
 */
export const mleAlgorithm: AlgorithmNode = {
  key: "mle",
  name: "最大似然估计（MLE）",
  category: "parameter-estimation",
  description: "通过找到使观测数据的似然最大化的值来估计模型参数。",
  icon: "📈",

  inputs: [
    {
      id: "data",
      label: "观测数据",
      dataType: "vector",
      required: true,
    },
    {
      id: "model",
      label: "概率模型",
      dataType: "function",
      required: true,
    },
  ],

  outputs: [
    {
      id: "parameters",
      label: "估计参数",
      dataType: "vector",
    },
    {
      id: "logLikelihood",
      label: "对数似然",
      dataType: "scalar",
    },
    {
      id: "confidence",
      label: "置信区间",
      dataType: "matrix",
    },
  ],

  parameters: [
    {
      key: "distribution",
      label: "分布类型",
      type: "select",
      defaultValue: "normal",
      options: {
        items: [
          { label: "正态分布（高斯）", value: "normal" },
          { label: "指数分布", value: "exponential" },
          { label: "泊松分布", value: "poisson" },
          { label: "伯努利分布", value: "bernoulli" },
        ],
      },
    },
    {
      key: "method",
      label: "优化方法",
      type: "select",
      defaultValue: "newton",
      options: {
        items: [
          { label: "Newton-Raphson", value: "newton" },
          { label: "梯度下降", value: "gd" },
          { label: "BFGS", value: "bfgs" },
        ],
      },
    },
    {
      key: "confidenceLevel",
      label: "置信水平",
      type: "slider",
      defaultValue: 0.95,
      options: {
        min: 0.8,
        max: 0.99,
        step: 0.01,
      },
    },
  ],

  compute: async (inputs, params) => {
    // Extract inputs and parameters
    const data = inputs.data || [1, 2, 3, 4, 5];
    const distribution = params.distribution || "normal";
    const confidenceLevel = Number(params.confidenceLevel) || 0.95;

    // Validate data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("数据必须是非空数组");
    }

    const n = data.length;
    let parameters: number[];
    let logLikelihood: number;
    let k: number; // Number of parameters

    // Calculate MLE based on distribution type
    if (distribution === "normal") {
      // Normal distribution: μ̂ = mean(data), σ̂² = variance(data)
      const mean = Number(math.mean(data));
      const variance = Number(math.variance(data, "uncorrected")); // MLE uses biased estimator

      parameters = [mean, variance];
      k = 2;

      // Calculate log-likelihood: log(L) = -n/2 * log(2π) - n/2 * log(σ²) - 1/(2σ²) * Σ(x_i - μ)²
      logLikelihood =
        (-n / 2) * Math.log(2 * Math.PI) - (n / 2) * Math.log(variance) - n / 2;
    } else if (distribution === "poisson") {
      // Poisson distribution: λ̂ = mean(data)
      const lambda = Number(math.mean(data));

      parameters = [lambda];
      k = 1;

      // Calculate log-likelihood: log(L) = Σ(x_i * log(λ) - λ - log(x_i!))
      logLikelihood = data.reduce((sum: number, x: number) => {
        return sum + x * Math.log(lambda) - lambda - Number(math.lgamma(x + 1));
      }, 0);
    } else if (distribution === "exponential") {
      // Exponential distribution: λ̂ = 1/mean(data)
      const mean = Number(math.mean(data));
      const lambda = 1 / mean;

      parameters = [lambda];
      k = 1;

      // Calculate log-likelihood: log(L) = n * log(λ) - λ * Σx_i
      const sumData = data.reduce((sum: number, x: number) => sum + x, 0);
      logLikelihood = n * Math.log(lambda) - lambda * sumData;
    } else {
      throw new Error(`不支持的分布类型: ${distribution}`);
    }

    // Calculate AIC and BIC
    // AIC = 2k - 2*log(L)
    const aic = 2 * k - 2 * logLikelihood;

    // BIC = k*log(n) - 2*log(L)
    const bic = k * Math.log(n) - 2 * logLikelihood;

    // Calculate confidence intervals (approximate using asymptotic normality)
    const zScore = getZScoreByLevel(confidenceLevel);
    let confidence: number[][];

    if (distribution === "normal") {
      // For normal distribution
      const mean = parameters[0];
      const variance = parameters[1];
      const std = Math.sqrt(variance);

      // Confidence interval for mean: μ ± z * σ/√n
      const meanCI = [
        mean - (zScore * std) / Math.sqrt(n),
        mean + (zScore * std) / Math.sqrt(n),
      ];

      // Confidence interval for variance (using chi-square distribution approximation)
      const varCI = [variance * 0.7, variance * 1.3]; // Simplified approximation

      confidence = [meanCI, varCI];
    } else {
      // For single parameter distributions
      const param = parameters[0];
      const se = Math.sqrt(param / n); // Standard error approximation
      confidence = [[param - zScore * se, param + zScore * se]];
    }

    return {
      parameters,
      logLikelihood,
      confidence,
      confidenceLevel,
      aic,
      bic,
      visualization: {
        type: "distribution",
        data: {
          parameters,
          distribution,
          logLikelihood,
          confidence,
          aic,
          bic,
          sampleSize: n,
          confidenceLevel,
        },
      },
    };
  },
};
