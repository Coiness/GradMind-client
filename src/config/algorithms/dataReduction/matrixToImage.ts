import type { AlgorithmNode } from "@/types/algorithmNode";

export const matrixToImageAlgorithm: AlgorithmNode = {
  key: "matrix-to-image",
  name: "矩阵转图像",
  category: "data-reduction",
  description: "将二维矩阵数据转换为图像格式，以便在示波器中进行可视化渲染。",
  icon: "🖼️",
  inputs: [
    { id: "matrix", label: "输入矩阵", dataType: "matrix", required: true },
  ],
  outputs: [
    { id: "image", label: "图像数据", dataType: "matrix" },
  ],
  parameters: [
    {
      key: "normalize",
      label: "自动归一化(0-255)",
      type: "select",
      defaultValue: "true",
      options: {
        items: [
          { label: "是", value: "true" },
          { label: "否 (裁剪到0-255)", value: "false" }
        ]
      }
    }
  ],
  compute: async (inputs, params) => {
    const matrix = inputs.matrix as number[][];
    if (!matrix || !Array.isArray(matrix) || matrix.length === 0 || !Array.isArray(matrix[0]) || !matrix[0].length) {
      throw new Error("无效的输入矩阵");
    }

    const height = matrix.length;
    const width = matrix[0].length;
    const normalize = params.normalize === "true";

    let processedMatrix = matrix;

    if (normalize) {
      let min = Infinity;
      let max = -Infinity;
      for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
          if (matrix[i][j] < min) min = matrix[i][j];
          if (matrix[i][j] > max) max = matrix[i][j];
        }
      }
      const range = max - min === 0 ? 1 : max - min;
      
      processedMatrix = matrix.map(row => 
        row.map(val => Math.round(((val - min) / range) * 255))
      );
    } else {
      processedMatrix = matrix.map(row => 
        row.map(val => Math.max(0, Math.min(255, Math.round(val))))
      );
    }

    return {
      image: processedMatrix,
      visualization: {
        type: "image",
        data: {
          matrix: processedMatrix,
          width,
          height,
        },
      },
    };
  },
};
