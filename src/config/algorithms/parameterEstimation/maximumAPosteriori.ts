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
 * Maximum A Posteriori (MAP) Estimation Algorithm
 * Estimates parameters using Bayesian inference with prior knowledge
 */
export const mapAlgorithm: AlgorithmNode = {
  key: "map",
  name: "最大后验估计（MAP）",
  category: "parameter-estimation",
  description:
    "通过最大化后验概率来估计模型参数，通过贝叶斯推断结合先验知识。",
  icon: "🎯",

  inputs: [
    {
      id: "data",
      label: "观测数据",
      dataType: "vector",
      required: true,
    },
    {
      id: "prior",
      label: "先验参数",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "parameters",
      label: "MAP 估计",
      dataType: "vector",
    },
    {
      id: "posteriorMean",
      label: "后验均值",
      dataType: "scalar",
    },
    {
      id: "posteriorVariance",
      label: "后验方差",
      dataType: "scalar",
    },
    {
      id: "logPosterior",
      label: "对数后验概率",
      dataType: "scalar",
    },
    {
      id: "credibleInterval",
      label: "可信区间",
      dataType: "matrix",
    },
  ],

  parameters: [
    {
      key: "priorType",
      label: "先验分布",
      type: "select",
      defaultValue: "normal",
      options: {
        items: [
          { label: "正态分布（高斯）", value: "normal" },
          { label: "均匀分布", value: "uniform" },
          { label: "Gamma 分布", value: "gamma" },
          { label: "Beta 分布", value: "beta" },
        ],
      },
    },
    {
      key: "priorStrength",
      label: "先验强度",
      type: "slider",
      defaultValue: 1,
      options: {
        min: 0.1,
        max: 10,
        step: 0.1,
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
          { label: "梯度上升", value: "gradient" },
          { label: "MCMC 采样", value: "mcmc" },
        ],
      },
    },
    {
      key: "credibleLevel",
      label: "可信区间水平",
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
    const prior = inputs.prior || [0, 1]; // Default: μ0 = 0, σ0² = 1
    const priorType = params.priorType || "normal";
    const credibleLevel = Number(params.credibleLevel) || 0.95;

    // Validate data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("数据必须是非空数组");
    }

    if (!Array.isArray(prior) || prior.length < 2) {
      throw new Error("先验参数必须包含至少两个值 [μ0, σ0²]");
    }

    const n = data.length;
    const xBar = math.mean(data); // Sample mean

    // For normal distribution with conjugate prior
    // Prior: μ ~ N(μ0, σ0²)
    // Likelihood: x_i ~ N(μ, σ²)
    // Posterior: μ ~ N(μ_n, σ_n²)

    // Extract prior parameters
    const mu0 = prior[0]; // Prior mean
    const sigma0Sq = prior[1]; // Prior variance
    const sigmaSq = prior[2] || 1; // Known variance of likelihood (default to 1)

    // Calculate posterior parameters
    // μ_n = (σ²*μ0 + n*σ0²*x̄) / (σ² + n*σ0²)
    const posteriorMean = (sigmaSq * mu0 + n * sigma0Sq * xBar) / (sigmaSq + n * sigma0Sq);

    // σ_n² = (σ²*σ0²) / (σ² + n*σ0²)
    const posteriorVariance = (sigmaSq * sigma0Sq) / (sigmaSq + n * sigma0Sq);
    const posteriorStd = Math.sqrt(posteriorVariance);

    // MAP estimate (for normal distribution, MAP = posterior mean)
    const mapEstimate = posteriorMean;
    const parameters = [mapEstimate];

    // Calculate log posterior probability
    // log p(μ|x) = log p(x|μ) + log p(μ) - log p(x)
    // We'll calculate the unnormalized log posterior (without the normalizing constant)

    // Log likelihood: log p(x|μ) = -n/2 * log(2π) - n/2 * log(σ²) - 1/(2σ²) * Σ(x_i - μ)²
    const sumSquaredDiff = data.reduce((sum: number, x: number) => {
      return sum + Math.pow(x - mapEstimate, 2);
    }, 0);
    const logLikelihood = -n / 2 * Math.log(2 * Math.PI) - n / 2 * Math.log(sigmaSq) - sumSquaredDiff / (2 * sigmaSq);

    // Log prior: log p(μ) = -1/2 * log(2π) - 1/2 * log(σ0²) - 1/(2σ0²) * (μ - μ0)²
    const logPrior = -0.5 * Math.log(2 * Math.PI) - 0.5 * Math.log(sigma0Sq) - Math.pow(mapEstimate - mu0, 2) / (2 * sigma0Sq);

    // Log posterior (unnormalized)
    const logPosterior = logLikelihood + logPrior;

    // Calculate credible interval
    // For normal posterior, credible interval is: μ_n ± z * σ_n
    const zScore = getZScoreByLevel(credibleLevel);
    const credibleInterval = [
      [posteriorMean - zScore * posteriorStd, posteriorMean + zScore * posteriorStd]
    ];

    // Calculate additional statistics
    const priorInfluence = Math.abs(posteriorMean - xBar) / (Math.abs(posteriorMean) + 1e-10);
    const effectiveSampleSize = sigmaSq / posteriorVariance;

    return {
      parameters,
      posteriorMean,
      posteriorVariance,
      logPosterior,
      credibleInterval,
      credibleLevel,
      visualization: {
        type: "bayesian",
        data: {
          parameters,
          posteriorMean,
          posteriorVariance,
          logPosterior,
          credibleInterval,
          priorType,
          priorParameters: {
            mu0,
            sigma0Sq,
            sigmaSq,
          },
          sampleMean: xBar,
          sampleSize: n,
          priorInfluence,
          effectiveSampleSize,
          credibleLevel,
        },
      },
    };
  },
};
