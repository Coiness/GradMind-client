import type { ParameterConfig, ParameterValues } from "./parameterConfig";

/**
 * Algorithm categories for the workflow builder
 */
export type AlgorithmCategory =
  | "data-reduction" // SVD, PCA
  | "analytical-optimization" // Gradient, Hessian, Lagrange, Least Squares
  | "numerical-optimization" // GD, Mini-batch GD, Advanced optimizers, NN
  | "parameter-estimation"; // MLE, MAP

/**
 * Data types that can flow between algorithm nodes
 */
export type DataType =
  | "matrix"
  | "vector"
  | "scalar"
  | "function"
  | "model"
  | "dataset";

/**
 * Input port definition for an algorithm node
 */
export interface AlgorithmInput {
  id: string; // e.g., 'matrix', 'vector', 'function'
  label: string; // Display name
  dataType: DataType;
  required: boolean;
}

/**
 * Output port definition for an algorithm node
 */
export interface AlgorithmOutput {
  id: string;
  label: string;
  dataType: DataType;
}

/**
 * Algorithm node definition - represents a computational module
 */
export interface AlgorithmNode {
  key: string; // Unique identifier, e.g., 'svd', 'pca', 'gradient-descent'
  name: string; // Display name
  category: AlgorithmCategory;
  description: string;
  icon?: string; // Optional icon name or emoji

  // Input/output schema for validation
  inputs: AlgorithmInput[];
  outputs: AlgorithmOutput[];

  // Algorithm-specific parameters
  parameters: ParameterConfig[];

  // Computation function
  compute: (
    inputs: Record<string, any>,
    params: ParameterValues,
  ) => Promise<any>;
}

/**
 * Category metadata for organizing algorithms in the library
 */
export interface AlgorithmCategoryInfo {
  key: AlgorithmCategory;
  name: string;
  description: string;
  icon?: string;
}
