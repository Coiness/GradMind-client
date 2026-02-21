import type { AlgorithmNode } from "@/types/algorithmNode";
import * as math from "mathjs";

type EigenPair = {
  value: number;
  vector: number[];
};

function toFiniteNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (value && typeof value === "object" && "re" in value) {
    return Number((value as { re: unknown }).re);
  }
  return Number(value);
}

function toNumberVector(value: unknown): number[] {
  if (Array.isArray(value)) {
    if (value.length > 0 && Array.isArray(value[0])) {
      return (value as unknown[]).map((item) =>
        toFiniteNumber(Array.isArray(item) ? (item as unknown[])[0] : item),
      );
    }
    return (value as unknown[]).map((item) => toFiniteNumber(item));
  }

  if (value && typeof value === "object" && "toArray" in value) {
    return toNumberVector((value as { toArray: () => unknown }).toArray());
  }

  return [toFiniteNumber(value)];
}

function toNumberMatrix(value: unknown): number[][] {
  if (Array.isArray(value)) {
    if (value.length === 0) return [];
    if (Array.isArray(value[0])) {
      return (value as unknown[]).map((row) =>
        (row as unknown[]).map((item) => toFiniteNumber(item)),
      );
    }
    return (value as unknown[]).map((item) => [toFiniteNumber(item)]);
  }

  if (value && typeof value === "object" && "toArray" in value) {
    return toNumberMatrix((value as { toArray: () => unknown }).toArray());
  }

  throw new Error("无法将值转换为二维矩阵");
}

function transposeMatrix(matrix: number[][]): number[][] {
  if (matrix.length === 0) return [];
  return matrix[0].map((_, columnIndex) =>
    matrix.map((row) => row[columnIndex] ?? 0),
  );
}

function extractEigenPairs(eigenResult: {
  values: unknown;
  eigenvectors?: unknown;
  vectors?: unknown;
}): EigenPair[] {
  if (Array.isArray(eigenResult.eigenvectors)) {
    return eigenResult.eigenvectors.map((entry) => ({
      value: toFiniteNumber((entry as { value?: unknown }).value),
      vector: toNumberVector((entry as { vector?: unknown }).vector ?? []),
    }));
  }

  const values = toNumberVector(eigenResult.values);
  const eigenVectorMatrix = toNumberMatrix(
    eigenResult.vectors ?? eigenResult.eigenvectors,
  );

  return values.map((value, index) => ({
    value,
    vector: eigenVectorMatrix.map((row) => row[index] ?? 0),
  }));
}

/**
 * Singular Value Decomposition (SVD) Algorithm
 * Decomposes a matrix into U, Σ, and V^T
 */
export const svdAlgorithm: AlgorithmNode = {
  key: "svd",
  name: "SVD（奇异值分解）",
  category: "data-reduction",
  description:
    "将矩阵 A 分解为三个矩阵：A = UΣV^T，其中 U 和 V 是正交矩阵，Σ 是奇异值的对角矩阵。",
  icon: "📊",

  inputs: [
    {
      id: "matrix",
      label: "输入矩阵",
      dataType: "matrix",
      required: true,
    },
  ],

  outputs: [
    {
      id: "u",
      label: "U 矩阵",
      dataType: "matrix",
    },
    {
      id: "sigma",
      label: "Σ（奇异值）",
      dataType: "vector",
    },
    {
      id: "vt",
      label: "V^T 矩阵",
      dataType: "matrix",
    },
  ],

  parameters: [
    {
      key: "fullMatrices",
      label: "完整矩阵",
      type: "select",
      defaultValue: "false",
      options: {
        items: [
          { label: "是（完整 U 和 V）", value: "true" },
          { label: "否（经济型）", value: "false" },
        ],
      },
    },
  ],

  compute: async (inputs, params) => {
    const fullMatrices = params.fullMatrices === "true";

    const matrixInput = inputs.matrix;
    if (!matrixInput) {
      throw new Error("缺少输入矩阵");
    }

    let matrix: number[][];
    if (Array.isArray(matrixInput)) {
      matrix = matrixInput as number[][];
    } else if (matrixInput.data) {
      matrix = matrixInput.data;
    } else {
      throw new Error("无效的矩阵格式");
    }

    if (matrix.length === 0 || matrix[0].length === 0) {
      throw new Error("矩阵不能为空");
    }

    try {
      const A = math.matrix(matrix);
      const m = matrix.length;
      const n = matrix[0].length;

      const AT = math.transpose(A);
      const ATA = math.multiply(AT, A);
      const AAT = math.multiply(A, AT);

      const useAAT = m <= n;
      const eigenResult = math.eigs(
        useAAT ? (AAT as math.Matrix) : (ATA as math.Matrix),
      ) as {
        values: unknown;
        eigenvectors?: unknown;
        vectors?: unknown;
      };

      const sortedEigenPairs = extractEigenPairs(eigenResult)
        .map((pair) => ({
          value: Math.max(0, pair.value),
          vector: pair.vector,
        }))
        .sort((a, b) => b.value - a.value);

      if (sortedEigenPairs.length === 0) {
        throw new Error("SVD 特征分解结果为空");
      }

      const sigma = sortedEigenPairs.map((pair) => Math.sqrt(pair.value));
      const tolerance = 1e-10;
      const k = Math.min(m, n, sigma.length);

      let u: number[][];
      let v: number[][];

      if (useAAT) {
        const uVectors = sortedEigenPairs.map((pair) => pair.vector);
        u = transposeMatrix(uVectors);

        const vColumns: number[][] = [];
        for (let index = 0; index < k; index++) {
          if (sigma[index] > tolerance) {
            const uCol = u.map((row) => row[index] ?? 0);
            const avCol = toNumberVector(math.multiply(AT, uCol));
            vColumns.push(avCol.map((value) => value / sigma[index]));
          } else {
            vColumns.push(new Array(n).fill(0));
          }
        }
        v = transposeMatrix(vColumns);
      } else {
        const vVectors = sortedEigenPairs.map((pair) => pair.vector);
        v = transposeMatrix(vVectors);

        const uColumns: number[][] = [];
        for (let index = 0; index < k; index++) {
          if (sigma[index] > tolerance) {
            const vCol = v.map((row) => row[index] ?? 0);
            const auCol = toNumberVector(math.multiply(A, vCol));
            uColumns.push(auCol.map((value) => value / sigma[index]));
          } else {
            uColumns.push(new Array(m).fill(0));
          }
        }
        u = transposeMatrix(uColumns);
      }

      let truncatedSigma = sigma.slice(0, k);
      if (!fullMatrices) {
        u = u.map((row) => row.slice(0, k));
        v = v.map((row) => row.slice(0, k));
      } else {
        truncatedSigma = sigma;
      }

      const vt = transposeMatrix(v);
      const rank = truncatedSigma.filter((value) => Math.abs(value) > tolerance).length;
      const nonZeroSigma = truncatedSigma.filter((value) => Math.abs(value) > tolerance);
      const conditionNumber =
        nonZeroSigma.length > 0
          ? Math.max(...nonZeroSigma) / Math.min(...nonZeroSigma)
          : Infinity;

      return {
        u,
        sigma: truncatedSigma,
        vt,
        v,
        rank,
        conditionNumber,
        visualization: {
          type: "matrix",
          data: {
            u,
            sigma: truncatedSigma,
            vt,
            rank,
          },
        },
      };
    } catch (error) {
      throw new Error(
        `SVD 分解失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};
