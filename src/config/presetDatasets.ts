import type { DatasetData } from "@/types/workflow";
import { defaultImageBase64 } from "./presetImage";

export interface PresetDataset {
  id: string;
  name: string;
  description: string;
  icon: string;
  dimensions: string;
  datasetData: DatasetData;
}

// 生成线性回归数据
const generateLinearData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 20; i++) {
    const x = i;
    const y = 2 * x + 1 + (Math.random() - 0.5) * 4;
    data.push([x, y]);
  }
  return data;
};

// 生成多项式数据
const generatePolynomialData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 30; i++) {
    const x = (i - 15) / 3;
    const y = 0.5 * x * x - 2 * x + 3 + (Math.random() - 0.5) * 2;
    data.push([x, y]);
  }
  return data;
};

// 生成双簇数据
const generateTwoClusterData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 25; i++) {
    const x = 2 + (Math.random() - 0.5) * 2;
    const y = 3 + (Math.random() - 0.5) * 2;
    data.push([x, y]);
  }
  for (let i = 0; i < 25; i++) {
    const x = 8 + (Math.random() - 0.5) * 2;
    const y = 7 + (Math.random() - 0.5) * 2;
    data.push([x, y]);
  }
  return data;
};

// 生成高维数据
const generateHighDimData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 50; i++) {
    const row = Array.from({ length: 10 }, () => Math.random() * 10);
    data.push(row);
  }
  return data;
};

// 生成正弦波数据
const generateSineWaveData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 40; i++) {
    const x = i * 0.3;
    const y = Math.sin(x) + (Math.random() - 0.5) * 0.2;
    data.push([x, y]);
  }
  return data;
};

// 生成圆形数据
const generateCircleData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 50; i++) {
    const angle = (i / 50) * 2 * Math.PI;
    const radius = 5 + (Math.random() - 0.5) * 0.5;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    data.push([x, y]);
  }
  return data;
};

// 生成螺旋数据
const generateSpiralData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 60; i++) {
    const angle = (i / 60) * 4 * Math.PI;
    const radius = i * 0.1;
    const x = radius * Math.cos(angle) + (Math.random() - 0.5) * 0.2;
    const y = radius * Math.sin(angle) + (Math.random() - 0.5) * 0.2;
    data.push([x, y]);
  }
  return data;
};

// 生成网格数据
const generateGridData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 10; i++) {
    for (let j = 0; j < 10; j++) {
      data.push([i, j, Math.sin(i * 0.5) * Math.cos(j * 0.5)]);
    }
  }
  return data;
};

// 用于存放异步解析后的图片数据集
export let imageDatasetData: DatasetData | null = null;

// 异步解析图片并生成灰度矩阵
export const initImageDataset = async (): Promise<DatasetData> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // 为防止预设图片过大，限制最大尺寸
      const maxSize = 256; 
      let width = img.width, height = img.height;
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = Math.round((height / width) * maxSize);
          width = maxSize;
        } else {
          width = Math.round((width / height) * maxSize);
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, width, height);

      const imageData = ctx.getImageData(0, 0, width, height);
      const grayMatrix: number[][] = [];
      for (let y = 0; y < height; y++) {
        const row: number[] = [];
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const gray = 0.299 * imageData.data[i] + 0.587 * imageData.data[i+1] + 0.114 * imageData.data[i+2];
          row.push(Math.round(gray));
        }
        grayMatrix.push(row);
      }

      const dataset: DatasetData = {
        type: 'image',
        data: grayMatrix,
        headers: ['pixel'],
        metadata: {
          rows: height,
          columns: width,
          fileName: 'example_image.png',
          imageWidth: width,
          imageHeight: height,
          imageFormat: 'image/png'
        }
      };
      
      imageDatasetData = dataset;
      resolve(dataset);
    };
    img.src = defaultImageBase64;
  });
};

export const presetDatasets: PresetDataset[] = [
  {
    id: "linear-data",
    name: "线性回归数据",
    description: "20个点，y=2x+1+噪声",
    icon: "📈",
    dimensions: "20×2",
    datasetData: {
      type: "manual",
      data: generateLinearData(),
      headers: ["x", "y"],
      metadata: { rows: 20, columns: 2 },
    },
  },
  {
    id: "polynomial-data",
    name: "多项式数据",
    description: "30个点，二次曲线+噪声",
    icon: "📊",
    dimensions: "30×2",
    datasetData: {
      type: "manual",
      data: generatePolynomialData(),
      headers: ["x", "y"],
      metadata: { rows: 30, columns: 2 },
    },
  },
  {
    id: "two-cluster-data",
    name: "双簇数据",
    description: "50个点，两个聚类中心",
    icon: "🎯",
    dimensions: "50×2",
    datasetData: {
      type: "manual",
      data: generateTwoClusterData(),
      headers: ["x", "y"],
      metadata: { rows: 50, columns: 2 },
    },
  },
  {
    id: "high-dim-data",
    name: "高维数据",
    description: "50个样本，10个特征",
    icon: "🔢",
    dimensions: "50×10",
    datasetData: {
      type: "manual",
      data: generateHighDimData(),
      headers: Array.from({ length: 10 }, (_, i) => `f${i + 1}`),
      metadata: { rows: 50, columns: 10 },
    },
  },
  {
    id: "sine-wave-data",
    name: "正弦波数据",
    description: "40个点，sin(x)+噪声",
    icon: "〰️",
    dimensions: "40×2",
    datasetData: {
      type: "manual",
      data: generateSineWaveData(),
      headers: ["x", "y"],
      metadata: { rows: 40, columns: 2 },
    },
  },
  {
    id: "circle-data",
    name: "圆形数据",
    description: "50个点，圆形分布",
    icon: "⭕",
    dimensions: "50×2",
    datasetData: {
      type: "manual",
      data: generateCircleData(),
      headers: ["x", "y"],
      metadata: { rows: 50, columns: 2 },
    },
  },
  {
    id: "spiral-data",
    name: "螺旋数据",
    description: "60个点，螺旋形分布",
    icon: "🌀",
    dimensions: "60×2",
    datasetData: {
      type: "manual",
      data: generateSpiralData(),
      headers: ["x", "y"],
      metadata: { rows: 60, columns: 2 },
    },
  },
  {
    id: "grid-data",
    name: "网格数据",
    description: "100个点，10×10网格",
    icon: "🔲",
    dimensions: "100×3",
    datasetData: {
      type: "manual",
      data: generateGridData(),
      headers: ["x", "y", "z"],
      metadata: { rows: 100, columns: 3 },
    },
  },
  // 示例图片占位符，实际数据在组件挂载后由 initImageDataset 填充
  {
    id: "example-image",
    name: "示例图片",
    description: "一张用于测试的单通道灰度图片",
    icon: "🖼️",
    dimensions: "256×256",
    datasetData: {
      type: "image",
      data: [[0]], // 占位
      headers: ["pixel"],
      metadata: { rows: 1, columns: 1 },
    },
  },
];
