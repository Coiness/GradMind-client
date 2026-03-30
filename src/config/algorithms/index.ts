import type {
  AlgorithmNode,
  AlgorithmCategoryInfo,
} from "@/types/algorithmNode";

// Data Reduction
import { svdAlgorithm } from "./dataReduction/svd";
import { pcaAlgorithm } from "./dataReduction/pca";
import { kMeansAlgorithm } from "./dataReduction/kMeans";
import { imageReconstructionAlgorithm } from "./dataReduction/imageReconstruction";
import { matrixToImageAlgorithm } from "./dataReduction/matrixToImage";

// Analytical Optimization
import { gradientAlgorithm } from "./analyticalOptimization/gradientComputation";
import { hessianAlgorithm } from "./analyticalOptimization/hessianMatrix";
import { lagrangeAlgorithm } from "./analyticalOptimization/lagrangeMultiplier";
import { leastSquaresAlgorithm } from "./analyticalOptimization/leastSquares";

// Numerical Optimization
import { gradientDescentAlgorithm } from "./numericalOptimization/gradientDescent";
import { miniBatchGDAlgorithm } from "./numericalOptimization/miniBatchGD";
import { advancedOptimizerAlgorithm } from "./numericalOptimization/advancedOptimizer";
import { neuralNetworkAlgorithm } from "./numericalOptimization/neuralNetwork";

// Parameter Estimation
import { mleAlgorithm } from "./parameterEstimation/maximumLikelihood";
import { mapAlgorithm } from "./parameterEstimation/maximumAPosteriori";

/**
 * All available algorithms (13 total)
 */
export const algorithms: AlgorithmNode[] = [
  // Data Reduction (5)
  svdAlgorithm,
  pcaAlgorithm,
  kMeansAlgorithm,
  imageReconstructionAlgorithm,
  matrixToImageAlgorithm,

  // Analytical Optimization (4)
  gradientAlgorithm,
  hessianAlgorithm,
  lagrangeAlgorithm,
  leastSquaresAlgorithm,

  // Numerical Optimization (4)
  gradientDescentAlgorithm,
  miniBatchGDAlgorithm,
  advancedOptimizerAlgorithm,
  neuralNetworkAlgorithm,

  // Parameter Estimation (2)
  mleAlgorithm,
  mapAlgorithm,
];

/**
 * Category metadata for organizing the algorithm library
 */
export const categories: AlgorithmCategoryInfo[] = [
  {
    key: "data-reduction",
    name: "数据降维",
    description: "降维和矩阵分解技术",
    icon: "📊",
  },
  {
    key: "analytical-optimization",
    name: "解析优化",
    description: "闭式解和解析方法",
    icon: "∇",
  },
  {
    key: "numerical-optimization",
    name: "数值优化",
    description: "迭代优化算法",
    icon: "🔄",
  },
  {
    key: "parameter-estimation",
    name: "参数估计",
    description: "统计参数估计方法",
    icon: "📈",
  },
];

/**
 * Get algorithms by category
 */
export function getAlgorithmsByCategory(category: string): AlgorithmNode[] {
  return algorithms.filter((algo) => algo.category === category);
}

/**
 * Get algorithm by key
 */
export function getAlgorithmByKey(key: string): AlgorithmNode | undefined {
  return algorithms.find((algo) => algo.key === key);
}
