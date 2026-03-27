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

// 生成房屋面积与价格数据（教学用线性回归场景，约500条）
const generateHousePriceData = (): number[][] => {
  const data: number[][] = [];
  // 模拟500套房屋的面积（平米）与价格（万元）
  for (let i = 0; i < 500; i++) {
    const area = 50 + Math.random() * 150; // 面积 50-200平米
    // 价格 = 面积 * 3 + 基础价格 + 随机波动（考虑面积越大，价格波动可能越大）
    const price = 50 + area * 3 + (Math.random() - 0.5) * area * 0.8;
    data.push([Math.round(area * 10) / 10, Math.round(price * 10) / 10]);
  }
  // 按面积排序，使连线更清晰
  return data.sort((a, b) => a[0] - b[0]);
};

// 生成抛物线轨迹数据（教学用多项式拟合场景，约500条）
const generateProjectileData = (): number[][] => {
  const data: number[][] = [];
  // 模拟抛体运动轨迹，x为水平距离，y为高度
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * 100; // 水平距离 0-100米
    // 顶点在 x=50，y=80 的开口向下的抛物线
    const y = -0.032 * Math.pow(x - 50, 2) + 80 + (Math.random() - 0.5) * 5;
    data.push([Math.round(x * 10) / 10, Math.max(0, Math.round(y * 10) / 10)]); // 高度不为负
  }
  return data.sort((a, b) => a[0] - b[0]);
};

// 生成学生成绩数据（教学用聚类场景，双簇，约500条）
const generateStudentScoresData = (): number[][] => {
  const data: number[][] = [];
  // 偏文科学生（文科成绩高，理科成绩一般）
  for (let i = 0; i < 250; i++) {
    data.push([
      Math.min(100, Math.max(0, Math.round(85 + (Math.random() - 0.5) * 20))), // 语文/英语成绩
      Math.min(100, Math.max(0, Math.round(60 + (Math.random() - 0.5) * 30)))  // 数学/理综成绩
    ]);
  }
  // 偏理科学生（理科成绩高，文科成绩一般）
  for (let i = 0; i < 250; i++) {
    data.push([
      Math.min(100, Math.max(0, Math.round(65 + (Math.random() - 0.5) * 25))), // 语文/英语成绩
      Math.min(100, Math.max(0, Math.round(90 + (Math.random() - 0.5) * 15)))  // 数学/理综成绩
    ]);
  }
  return data;
};

// 生成多维水果属性数据（教学用高维/PCA降维场景，约500条）
const generateFruitPropertiesData = (): number[][] => {
  const data: number[][] = [];
  // 模拟500个水果的10个特征：重量, 体积, 甜度, 酸度, 硬度, 红色度, 绿色度, 黄色度, 水分, 价格
  for (let i = 0; i < 500; i++) {
    const size = Math.random() * 10;
    const colorType = Math.random();
    const row = [
      Math.round((size * 10 + 50 + (Math.random() - 0.5) * 20) * 10) / 10, // 重量
      Math.round((size * 12 + 40 + (Math.random() - 0.5) * 15) * 10) / 10, // 体积(与重量高度相关)
      Math.round((Math.random() * 10) * 10) / 10, // 甜度
      Math.round((Math.random() * 5) * 10) / 10, // 酸度
      Math.round((Math.random() * 8) * 10) / 10, // 硬度
      Math.round((colorType < 0.3 ? 8 : Math.random() * 3) * 10) / 10, // 红色度
      Math.round((colorType > 0.3 && colorType < 0.6 ? 8 : Math.random() * 3) * 10) / 10, // 绿色度
      Math.round((colorType > 0.6 ? 8 : Math.random() * 3) * 10) / 10, // 黄色度
      Math.round((80 + (Math.random() - 0.5) * 15) * 10) / 10, // 水分
      Math.round((size * 2 + 5 + (Math.random() - 0.5) * 3) * 10) / 10, // 价格
    ];
    data.push(row);
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

// 生成混合动植物分类数据（教学用多分类/异常检测场景，约600条）
const generateSpeciesClassificationData = (): number[][] => {
  const centers = [
    [10, 15], // 类别A：小型动物（低体重，低高度）
    [20, 80], // 类别B：高瘦植物（低体重，高高度）
    [80, 20], // 类别C：扁平植物（高体重，低高度）
    [90, 90]  // 类别D：大型动物（高体重，高高度）
  ];
  const data: number[][] = [];
  centers.forEach(([cx, cy]) => {
    for (let i = 0; i < 150; i++) {
      data.push([
        Math.max(0, Math.round((cx + (Math.random() - 0.5) * 20) * 10) / 10),
        Math.max(0, Math.round((cy + (Math.random() - 0.5) * 20) * 10) / 10)
      ]);
    }
  });
  return data;
};

// 生成商场客流量突变数据（教学用异常检测/突变数据，约500条）
const generateMallTrafficData = (): number[][] => {
  const data: number[][] = [];
  // 模拟正常客流
  for (let i = 0; i < 200; i++) {
    const time = i;
    const traffic = Math.round(50 + 20 * Math.sin(time * Math.PI / 24) + (Math.random() - 0.5) * 10);
    data.push([time, Math.max(0, traffic)]);
  }
  // 模拟节假日/促销突发高客流
  for (let i = 200; i < 300; i++) {
    const time = i;
    const traffic = Math.round(150 + 30 * Math.sin(time * Math.PI / 24) + (Math.random() - 0.5) * 30);
    data.push([time, Math.max(0, traffic)]);
  }
  // 恢复正常客流
  for (let i = 300; i < 500; i++) {
    const time = i;
    const traffic = Math.round(50 + 20 * Math.sin(time * Math.PI / 24) + (Math.random() - 0.5) * 10);
    data.push([time, Math.max(0, traffic)]);
  }
  return data;
};

// 生成圆形分布数据（教学用分类场景，约500条）
const generateCircleData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 500; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const radius = 5 + (Math.random() - 0.5) * 1.5;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    data.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
  }
  return data;
};

// 生成螺旋分布数据（教学用复杂分类场景，约500条）
const generateSpiralData = (): number[][] => {
  const data: number[][] = [];
  for (let i = 0; i < 500; i++) {
    const angle = (i / 500) * 6 * Math.PI; // 3圈
    const radius = i * 0.02 + (Math.random() - 0.5) * 0.5;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    data.push([Math.round(x * 100) / 100, Math.round(y * 100) / 100]);
  }
  return data;
};

// 生成网格坐标数据（教学用空间变换场景，约500条）
const generateGridData = (): number[][] => {
  const data: number[][] = [];
  // 25x20 网格 = 500点
  for (let i = 0; i < 25; i++) {
    for (let j = 0; j < 20; j++) {
      data.push([i, j, Math.round(Math.sin(i * 0.2) * Math.cos(j * 0.2) * 100) / 100]);
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
    id: "house-price-data",
    name: "房屋价格与面积",
    description: "500套房屋的面积与价格数据，呈现明显的线性正相关趋势，适合用于演示简单线性回归。",
    icon: "🏠",
    dimensions: "500×2",
    datasetData: {
      type: "manual",
      data: generateHousePriceData(),
      headers: ["房屋面积(平米)", "房屋价格(万元)"],
      metadata: { rows: 500, columns: 2 },
    },
  },
  {
    id: "projectile-motion-data",
    name: "抛物体运动轨迹",
    description: "记录了500个抛物体在空中的飞行轨迹（水平距离与高度），呈完美抛物线，适合多项式回归拟合。",
    icon: "⚾",
    dimensions: "500×2",
    datasetData: {
      type: "manual",
      data: generateProjectileData(),
      headers: ["水平距离(米)", "飞行高度(米)"],
      metadata: { rows: 500, columns: 2 },
    },
  },
  {
    id: "student-scores-data",
    name: "文理科学生成绩分布",
    description: "500名学生的文科（语文/英语）与理科（数学/理综）成绩对比，明显分为偏文和偏理两个群体，适合K-Means聚类教学。",
    icon: "🎓",
    dimensions: "500×2",
    datasetData: {
      type: "manual",
      data: generateStudentScoresData(),
      headers: ["文科综合成绩", "理科综合成绩"],
      metadata: { rows: 500, columns: 2 },
    },
  },
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
  {
    id: "species-classification-data",
    name: "动植物多类别分布",
    description: "包含4种不同动植物（如高瘦植物、大型动物等）的体重与高度数据，共600条，适合多分类算法教学。",
    icon: "🌿",
    dimensions: "600×2",
    datasetData: {
      type: "manual",
      data: generateSpeciesClassificationData(),
      headers: ["样本体重(kg)", "样本高度(cm)"],
      metadata: { rows: 600, columns: 2 },
    },
  },
  {
    id: "mall-traffic-data",
    name: "商场客流量统计",
    description: "商场500个时间段的客流量数据，包含日常波动以及节假日带来的突发客流高峰，适合异常检测分析。",
    icon: "🚶",
    dimensions: "500×2",
    datasetData: {
      type: "manual",
      data: generateMallTrafficData(),
      headers: ["监测时段", "客流量(人次)"],
      metadata: { rows: 500, columns: 2 },
    },
  },
  {
    id: "circle-distribution-data",
    name: "环形分布坐标",
    description: "500个呈现环形分布的二维坐标点，适合演示非线性分类器（如SVM的核函数技巧）的分类效果。",
    icon: "⭕",
    dimensions: "500×2",
    datasetData: {
      type: "manual",
      data: generateCircleData(),
      headers: ["横坐标X", "纵坐标Y"],
      metadata: { rows: 500, columns: 2 },
    },
  },
  {
    id: "spiral-distribution-data",
    name: "螺旋分布坐标",
    description: "500个呈现螺旋形上升的二维坐标点，属于复杂的非线性分布数据集，对分类算法是很好的挑战。",
    icon: "🌀",
    dimensions: "500×2",
    datasetData: {
      type: "manual",
      data: generateSpiralData(),
      headers: ["横坐标X", "纵坐标Y"],
      metadata: { rows: 500, columns: 2 },
    },
  },
  {
    id: "grid-coordinate-data",
    name: "网格波浪坐标数据",
    description: "由500个点组成的25×20网格，Z轴受到正弦余弦波函数影响，形成波浪起伏的三维曲面，适合空间数据可视化。",
    icon: "🔲",
    dimensions: "500×3",
    datasetData: {
      type: "manual",
      data: generateGridData(),
      headers: ["网格X", "网格Y", "波浪高度Z"],
      metadata: { rows: 500, columns: 3 },
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
