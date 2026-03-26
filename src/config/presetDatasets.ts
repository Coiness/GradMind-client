import type { DatasetData } from "@/types/workflow";

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
];
