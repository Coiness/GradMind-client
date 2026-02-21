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
 * Principal Component Analysis (PCA) Algorithm
 * Reduces dimensionality by finding principal components
 */
export const pcaAlgorithm: AlgorithmNode = {
  key: "pca",
  name: "PCA（主成分分析）",
  category: "data-reduction",
  description: "通过将数据投影到主成分（最大方差方向）来降低数据的维度。",
  icon: "📉",

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
      id: "components",
      label: "主成分",
      dataType: "matrix",
    },
    {
      id: "variance",
      label: "解释方差",
      dataType: "vector",
    },
    {
      id: "transformed",
      label: "转换后的数据",
      dataType: "matrix",
    },
  ],

  parameters: [
    {
      key: "nComponents",
      label: "成分数量",
      type: "slider",
      defaultValue: 2,
      options: {
        min: 1,
        max: 10,
        step: 1,
      },
    },
    {
      key: "center",
      label: "数据中心化",
      type: "select",
      defaultValue: "true",
      options: {
        items: [
          { label: "是", value: "true" },
          { label: "否", value: "false" },
        ],
      },
    },
  ],

  compute: async (inputs, params) => {
    const nComponents = Number(params.nComponents) || 2;
    const center = params.center !== "false";

    const datasetInput = inputs.dataset;
    if (!datasetInput) {
      throw new Error("缺少输入数据集");
    }

    let data: number[][];
    if (Array.isArray(datasetInput)) {
      data = datasetInput as number[][];
    } else if (datasetInput.data) {
      data = datasetInput.data;
    } else {
      throw new Error("无效的数据集格式");
    }

    if (data.length === 0 || data[0].length === 0) {
      throw new Error("数据集不能为空");
    }

    const n = data.length;
    const m = data[0].length;
    const k = Math.min(nComponents, m);

    try {
      let X = math.matrix(data);

      let mean: number[] = [];
      if (center) {
        mean = [];
        for (let column = 0; column < m; column++) {
          let sum = 0;
          for (let row = 0; row < n; row++) {
            sum += data[row][column];
          }
          mean.push(sum / n);
        }

        const centeredData = data.map((row) =>
          row.map((value, column) => value - mean[column]),
        );
        X = math.matrix(centeredData);
      }

      const XT = math.transpose(X);
      const cov = math.multiply(XT, X);
      const covMatrix = math.divide(cov, n - 1);

      const eigenPairs = extractEigenPairs(
        math.eigs(covMatrix as math.Matrix) as {
          values: unknown;
          eigenvectors?: unknown;
          vectors?: unknown;
        },
      )
        .map((pair) => ({
          value: Math.abs(pair.value),
          vector: pair.vector,
        }))
        .sort((a, b) => b.value - a.value);

      if (eigenPairs.length === 0) {
        throw new Error("PCA 特征分解结果为空");
      }

      const selectedComponents = eigenPairs.slice(0, k);
      const components = selectedComponents.map((pair) => pair.vector);
      const variance = selectedComponents.map((pair) => pair.value);

      const totalVariance = eigenPairs.reduce((sum, pair) => sum + pair.value, 0);
      const explainedVariance = variance.map((value) =>
        totalVariance > 0 ? value / totalVariance : 0,
      );
      const cumulativeVariance = explainedVariance.reduce<number[]>(
        (accumulator, value, index) => {
          accumulator.push((accumulator[index - 1] || 0) + value);
          return accumulator;
        },
        [],
      );

      const componentsMatrix = math.matrix(transposeMatrix(components));
      const transformed = math.multiply(X, componentsMatrix);
      const transformedData = toNumberMatrix(transformed);

      return {
        components,
        variance,
        explainedVariance,
        cumulativeVariance,
        transformed: transformedData,
        mean: center ? mean : undefined,
        nComponents: k,
        visualization: {
          type: "scatter",
          data: {
            points: transformedData,
            variance,
            explainedVariance,
            cumulativeVariance,
          },
        },
      };
    } catch (error) {
      throw new Error(
        `PCA 计算失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  },
};
