import type { AlgorithmNode, AlgorithmCategoryInfo } from "@/types/algorithmNode";

// Data Reduction
import { svdAlgorithm } from "./dataReduction/svd";
import { pcaAlgorithm } from "./dataReduction/pca";

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
 * All available algorithms (12 total)
 */
export const algorithms: AlgorithmNode[] = [
  // Data Reduction (2)
  svdAlgorithm,
  pcaAlgorithm,

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
    name: "Data Reduction",
    description: "Dimensionality reduction and matrix decomposition techniques",
    icon: "📊",
  },
  {
    key: "analytical-optimization",
    name: "Analytical Optimization",
    description: "Closed-form solutions and analytical methods",
    icon: "∇",
  },
  {
    key: "numerical-optimization",
    name: "Numerical Optimization",
    description: "Iterative optimization algorithms",
    icon: "🔄",
  },
  {
    key: "parameter-estimation",
    name: "Parameter Estimation",
    description: "Statistical parameter estimation methods",
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
