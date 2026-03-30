import type { AlgorithmNode } from "@/types/algorithmNode";

export const imageReconstructionAlgorithm: AlgorithmNode = {
  key: "image-reconstruction",
  name: "图像重建",
  category: "data-reduction",
  description: "从SVD分解结果重建图像（可调整保留的奇异值数量）",
  inputs: [
    { id: "u", label: "U 矩阵", dataType: "matrix", required: true },
    { id: "s", label: "Σ（奇异值）", dataType: "vector", required: true },
    { id: "v", label: "V 矩阵", dataType: "matrix", required: true },
  ],
  outputs: [{ id: "reconstructed", label: "重建图像", dataType: "matrix" }],
  parameters: [
    {
      key: "numComponents",
      label: "保留奇异值数量",
      type: "slider",
      defaultValue: 10,
      options: { min: 1, max: 100, step: 1 },
    },
  ],
  compute: async (inputs, params) => {
    const U = inputs.u as number[][];
    const S = inputs.s as number[];
    const V = inputs.v as number[][];
    const k = Number(params.numComponents) || 10;

    const m = U.length,
      n = V.length; // 注意 V 的维度，V 是 n x n
    const reconstructed: number[][] = Array(m)
      .fill(0)
      .map(() => Array(n).fill(0));

    // A = U * S * V^T
    // 重建时，需要取 V 的转置（即第 j 列对应原来的 V 的第 j 行）
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let sum = 0;
        for (let r = 0; r < Math.min(k, S.length); r++) {
          sum += U[i][r] * S[r] * V[j][r]; // 注意这里是 V[j][r] 而不是 V[r][j]
        }
        reconstructed[i][j] = Math.max(0, Math.min(255, Math.round(sum)));
      }
    }

    return {
      reconstructed,
      visualization: {
        type: "image",
        data: {
          matrix: reconstructed,
          width: n,
          height: m,
        },
      },
    };
  },
};
