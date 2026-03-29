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

// 生成多维水果属性数据（教学用高维/PCA降维/K-Means场景，约500条）
const generateFruitPropertiesData = (): number[][] => {
  const data: number[][] = [];
  // 模拟500个水果的10个特征：重量, 体积, 甜度, 酸度, 硬度, 红色度, 绿色度, 黄色度, 水分, 价格
  // 故意分成3个明显的簇（苹果、香蕉、葡萄）以保证降维后可视化效果好
  
  // 簇1：苹果 (大, 甜, 红, 硬)
  for (let i = 0; i < 170; i++) {
    const size = 6 + Math.random() * 2;
    data.push([
      Math.round((size * 15 + (Math.random() - 0.5) * 10) * 10) / 10, // 重量
      Math.round((size * 14 + (Math.random() - 0.5) * 10) * 10) / 10, // 体积
      Math.round((7 + Math.random() * 2) * 10) / 10, // 甜度
      Math.round((2 + Math.random() * 1) * 10) / 10, // 酸度
      Math.round((8 + Math.random() * 2) * 10) / 10, // 硬度
      Math.round((8 + Math.random() * 2) * 10) / 10, // 红色度(高)
      Math.round((2 + Math.random() * 2) * 10) / 10, // 绿色度
      Math.round((1 + Math.random() * 2) * 10) / 10, // 黄色度
      Math.round((85 + Math.random() * 5) * 10) / 10, // 水分
      Math.round((10 + Math.random() * 5) * 10) / 10, // 价格
    ]);
  }
  
  // 簇2：香蕉 (中等, 甜, 黄, 软)
  for (let i = 0; i < 170; i++) {
    const size = 4 + Math.random() * 2;
    data.push([
      Math.round((size * 10 + (Math.random() - 0.5) * 5) * 10) / 10, // 重量
      Math.round((size * 12 + (Math.random() - 0.5) * 5) * 10) / 10, // 体积
      Math.round((8 + Math.random() * 2) * 10) / 10, // 甜度
      Math.round((1 + Math.random() * 1) * 10) / 10, // 酸度
      Math.round((3 + Math.random() * 2) * 10) / 10, // 硬度(软)
      Math.round((1 + Math.random() * 2) * 10) / 10, // 红色度
      Math.round((3 + Math.random() * 2) * 10) / 10, // 绿色度
      Math.round((9 + Math.random() * 1) * 10) / 10, // 黄色度(高)
      Math.round((70 + Math.random() * 5) * 10) / 10, // 水分
      Math.round((5 + Math.random() * 3) * 10) / 10, // 价格
    ]);
  }
  
  // 簇3：葡萄 (小, 酸甜, 绿/紫, 中硬, 高水分)
  for (let i = 0; i < 160; i++) {
    const size = 1 + Math.random() * 1;
    data.push([
      Math.round((size * 5 + (Math.random() - 0.5) * 2) * 10) / 10, // 重量
      Math.round((size * 5 + (Math.random() - 0.5) * 2) * 10) / 10, // 体积
      Math.round((6 + Math.random() * 3) * 10) / 10, // 甜度
      Math.round((4 + Math.random() * 2) * 10) / 10, // 酸度
      Math.round((5 + Math.random() * 2) * 10) / 10, // 硬度
      Math.round((4 + Math.random() * 4) * 10) / 10, // 红色度(紫葡萄有红)
      Math.round((7 + Math.random() * 3) * 10) / 10, // 绿色度(绿葡萄)
      Math.round((1 + Math.random() * 2) * 10) / 10, // 黄色度
      Math.round((92 + Math.random() * 5) * 10) / 10, // 水分(高)
      Math.round((15 + Math.random() * 8) * 10) / 10, // 价格
    ]);
  }
  
  // 打乱数组顺序
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }
  
  return data;
};

// 生成混合二维散点数据（专门用于K-Means聚类教学，一开始混在一起，聚类后能分开）
const generateMixedClusterData = (): number[][] => {
  const data: number[][] = [];
  // 回退到更杂乱的版本：簇中心靠得很近，且方差很大，使其在二维平面上看起来像一团完全混合的数据
  // 簇1中心 (40, 40)
  for (let i = 0; i < 150; i++) {
    data.push([
      Math.round((40 + (Math.random() + Math.random() + Math.random() - 1.5) * 20) * 10) / 10,
      Math.round((40 + (Math.random() + Math.random() + Math.random() - 1.5) * 20) * 10) / 10
    ]);
  }
  // 簇2中心 (60, 60)
  for (let i = 0; i < 150; i++) {
    data.push([
      Math.round((60 + (Math.random() + Math.random() + Math.random() - 1.5) * 20) * 10) / 10,
      Math.round((60 + (Math.random() + Math.random() + Math.random() - 1.5) * 20) * 10) / 10
    ]);
  }
  // 簇3中心 (40, 70)
  for (let i = 0; i < 150; i++) {
    data.push([
      Math.round((40 + (Math.random() + Math.random() + Math.random() - 1.5) * 20) * 10) / 10,
      Math.round((70 + (Math.random() + Math.random() + Math.random() - 1.5) * 20) * 10) / 10
    ]);
  }
  
  // 彻底打乱数组顺序，让画图时颜色混杂
  for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
  }
  
  return data;
};

// 生成每日气温波动数据（教学用正弦波/时序场景，约500条）
const generateTemperatureData = (): number[][] => {
  const data: number[][] = [];
  // 模拟大约20天（每小时一个点，共480点）的气温波动
  for (let i = 0; i < 500; i++) {
    const hour = i;
    // 基础温度15度，日振幅8度，周期24小时，加上长周期的天气变化
    const temp = 15 + 8 * Math.sin((hour - 8) * Math.PI / 12) + 5 * Math.sin(hour * Math.PI / 240) + (Math.random() - 0.5) * 2;
    data.push([hour, Math.round(temp * 10) / 10]);
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
    id: "fruit-properties-data",
    name: "水果多维特征数据",
    description: "包含500个水果样本的10个维度特征（重量、甜度、颜色等），适合用于演示PCA主成分分析等高维降维算法。",
    icon: "🍎",
    dimensions: "500×10",
    datasetData: {
      type: "manual",
      data: generateFruitPropertiesData(),
      headers: ["重量(g)", "体积(cm³)", "甜度", "酸度", "硬度", "红色度", "绿色度", "黄色度", "水分(%)", "价格(元)"],
      metadata: { rows: 500, columns: 10 },
    },
  },
  {
    id: "mixed-cluster-data",
    name: "混合二维散点数据",
    description: "450个在二维平面上相互交叠的坐标点，肉眼难以区分边界，是演示K-Means等聚类算法如何寻找潜在规律的绝佳素材。",
    icon: "🎯",
    dimensions: "450×2",
    datasetData: {
      type: "manual",
      data: generateMixedClusterData(),
      headers: ["横坐标X", "纵坐标Y"],
      metadata: { rows: 450, columns: 2 },
    },
  },
  {
    id: "temperature-fluctuation-data",
    name: "连续气温波动记录",
    description: "连续500小时的气温变化记录，呈现出明显的日夜周期性波动规律，适合时间序列分析。",
    icon: "🌡️",
    dimensions: "500×2",
    datasetData: {
      type: "manual",
      data: generateTemperatureData(),
      headers: ["记录时间(小时)", "环境温度(℃)"],
      metadata: { rows: 500, columns: 2 },
    },
  },
  // 示例图片占位符，实际数据在组件挂载后由 initImageDataset 填充
  {
    id: "example-image",
    name: "示例教学图片",
    description: "一张用于图像处理与矩阵转换演示的单通道灰度图片。",
    icon: "🖼️",
    dimensions: "256×256",
    datasetData: {
      type: "image",
      data: [[0]], // 占位
      headers: ["像素灰度值"],
      metadata: { rows: 1, columns: 1 },
    },
  },
];
