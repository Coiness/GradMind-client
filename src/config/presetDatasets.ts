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

// 生成服务器内存泄漏趋势数据（线性回归场景）
const generateMemoryLeakData = (): number[][] => {
  const data: number[][] = [];
  // 模拟24小时内的内存使用量(GB)，基础16GB，每小时泄漏0.2GB，带随机波动
  for (let i = 0; i < 24; i++) {
    const hour = i;
    const memory = 16 + 0.2 * hour + (Math.random() - 0.5) * 1.5;
    data.push([hour, Math.max(0, memory)]); // 内存不能为负
  }
  return data;
};

// 生成设备CPU负载曲线数据（多项式/非线性场景）
const generateCpuLoadData = (): number[][] => {
  const data: number[][] = [];
  // 模拟一天中CPU负载的二次曲线：早晚低，中午高
  for (let i = 0; i < 24; i++) {
    const hour = i;
    // 顶点在 x=12，y=85 的开口向下的抛物线
    const load = -0.5 * Math.pow(hour - 12, 2) + 85 + (Math.random() - 0.5) * 10;
    data.push([hour, Math.max(0, Math.min(100, load))]); // 限制在0-100%
  }
  return data;
};

// 生成网络流量突变数据（聚类/异常检测场景）
const generateNetworkTrafficData = (): number[][] => {
  const data: number[][] = [];
  // 模拟正常流量簇
  for (let i = 0; i < 30; i++) {
    const time = i;
    const traffic = 20 + (Math.random() - 0.5) * 10;
    data.push([time, traffic]);
  }
  // 模拟突发流量簇（如DDoS攻击）
  for (let i = 30; i < 40; i++) {
    const time = i;
    const traffic = 80 + (Math.random() - 0.5) * 20;
    data.push([time, traffic]);
  }
  // 恢复正常流量簇
  for (let i = 40; i < 50; i++) {
    const time = i;
    const traffic = 20 + (Math.random() - 0.5) * 10;
    data.push([time, traffic]);
  }
  return data;
};

// 生成系统资源多维监控数据（高维/PCA降维场景）
const generateSystemResourceData = (): number[][] => {
  const data: number[][] = [];
  // 模拟50个时间点的10维系统资源指标：CPU, 内存, 磁盘IO, 网络收, 网络发, 进程数, 线程数, 句柄数, TCP连接, 错误率
  for (let i = 0; i < 50; i++) {
    // 构造一些相关性（如CPU高时内存通常也高，网络发和收相关等）
    const baseLoad = Math.random() * 10;
    const baseNet = Math.random() * 8;
    const row = [
      baseLoad + (Math.random() - 0.5), // CPU
      baseLoad * 0.8 + 2 + (Math.random() - 0.5), // 内存
      baseLoad * 0.5 + (Math.random() - 0.5), // 磁盘IO
      baseNet + (Math.random() - 0.5), // 网络收
      baseNet * 0.9 + (Math.random() - 0.5), // 网络发
      100 + baseLoad * 5 + (Math.random() - 0.5) * 10, // 进程数
      1000 + baseLoad * 50 + (Math.random() - 0.5) * 50, // 线程数
      5000 + baseLoad * 200 + (Math.random() - 0.5) * 200, // 句柄数
      baseNet * 20 + (Math.random() - 0.5) * 10, // TCP连接
      Math.max(0, baseLoad * 0.1 - 0.5 + Math.random() * 0.2), // 错误率
    ];
    data.push(row);
  }
  return data;
};

// 生成业务指标周期性波动数据（正弦波/时序预测场景）
const generateBusinessMetricData = (): number[][] => {
  const data: number[][] = [];
  // 模拟电商平台的日活跃用户数(DAU)波动：存在周周期性（周末高）和日周期性（晚上高）
  for (let i = 0; i < 40; i++) {
    const time = i * 0.3; // 缩放时间轴
    const dau = 50 + 15 * Math.sin(time) + 5 * Math.sin(time / 7) + (Math.random() - 0.5) * 3;
    data.push([time, Math.max(0, dau)]);
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
    id: "memory-leak-data",
    name: "内存泄漏趋势",
    description: "服务器24小时内存监控，缓慢上升趋势(用于线性回归)",
    icon: "📈",
    dimensions: "24×2",
    datasetData: {
      type: "manual",
      data: generateMemoryLeakData(),
      headers: ["Hour", "Memory(GB)"],
      metadata: { rows: 24, columns: 2 },
    },
  },
  {
    id: "cpu-load-data",
    name: "CPU负载曲线",
    description: "设备一天内CPU使用率，呈现抛物线趋势(用于多项式拟合)",
    icon: "📊",
    dimensions: "24×2",
    datasetData: {
      type: "manual",
      data: generateCpuLoadData(),
      headers: ["Hour", "CPU_Usage(%)"],
      metadata: { rows: 24, columns: 2 },
    },
  },
  {
    id: "user-behavior-data",
    name: "用户行为聚类",
    description: "活跃用户与流失用户双特征分布(用于PCA/聚类分析)",
    icon: "🎯",
    dimensions: "50×2",
    datasetData: {
      type: "manual",
      data: generateUserBehaviorData(),
      headers: ["Visit_Frequency", "Stay_Duration(min)"],
      metadata: { rows: 50, columns: 2 },
    },
  },
  {
    id: "system-resource-data",
    name: "系统多维指标",
    description: "10个维度的系统运行状态监控数据(用于降维分析)",
    icon: "🔢",
    dimensions: "50×10",
    datasetData: {
      type: "manual",
      data: generateSystemResourceData(),
      headers: ["CPU", "Mem", "IO", "NetIn", "NetOut", "Procs", "Thds", "FDs", "TCP", "ErrRate"],
      metadata: { rows: 50, columns: 10 },
    },
  },
  {
    id: "business-metric-data",
    name: "业务周期波动",
    description: "电商日活(DAU)的周期性波动数据(用于时序分析)",
    icon: "〰️",
    dimensions: "40×2",
    datasetData: {
      type: "manual",
      data: generateBusinessMetricData(),
      headers: ["Time", "DAU(k)"],
      metadata: { rows: 40, columns: 2 },
    },
  },
  {
    id: "system-anomaly-data",
    name: "系统异常状态",
    description: "4种不同系统负载状态的数据簇(用于异常检测)",
    icon: "⭕",
    dimensions: "60×2",
    datasetData: {
      type: "manual",
      data: generateSystemAnomalyData(),
      headers: ["CPU_Load", "IO_Load"],
      metadata: { rows: 60, columns: 2 },
    },
  },
  {
    id: "network-traffic-data",
    name: "网络流量突变",
    description: "网络带宽使用率时序数据，包含突发高峰",
    icon: "⚡",
    dimensions: "50×2",
    datasetData: {
      type: "manual",
      data: generateNetworkTrafficData(),
      headers: ["Time", "Bandwidth(Mbps)"],
      metadata: { rows: 50, columns: 2 },
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
