import type { AlgorithmNode } from "@/types/algorithmNode";

export const kMeansAlgorithm: AlgorithmNode = {
  key: "kmeans",
  name: "K-Means 聚类",
  description: "将数据点划分到K个簇中。支持普通数值数据的散点聚类，以及图像的灰度智能分割（自动输出多张分层图像）。",
  category: "data-reduction",
  
  inputs: [
    {
      id: "dataset",
      label: "输入数据",
      dataType: "matrix",
      required: true,
    },
  ],
  
  outputs: [
    {
      id: "labels",
      label: "簇标签",
      dataType: "vector",
    },
    {
      id: "centroids",
      label: "簇中心",
      dataType: "matrix",
    },
    {
      id: "clusteredImages",
      label: "分割图像",
      dataType: "matrix",
    },
    {
      id: "visualization",
      label: "可视化数据",
      dataType: "dataset",
    },
  ],
  
  parameters: [
    {
      key: "k",
      label: "聚类数 (K)",
      type: "number",
      defaultValue: 3,
      options: { min: 2, max: 10, step: 1 },
    },
    {
      key: "maxIterations",
      label: "最大迭代次数",
      type: "number",
      defaultValue: 100,
      options: { min: 10, max: 500, step: 10 },
    },
    {
      key: "isImage",
      label: "作为图像处理",
      type: "boolean",
      defaultValue: true,
    },
  ],

  compute: async (inputs, params) => {
    let dataMatrix: number[][];
    let isImage = params.isImage !== false; // 默认作为图像处理，除非显式关闭
    let imgWidth = 0;
    let imgHeight = 0;

    const inputData = inputs.dataset;
    if (!inputData) throw new Error("缺少输入数据");

    // 智能识别输入类型：普通数据 vs 图像数据
    if (typeof inputData === "object" && !Array.isArray(inputData) && inputData.data) {
      if (inputData.type === "image" || (inputData.metadata && inputData.metadata.fileName)) {
        isImage = true;
        dataMatrix = inputData.data as number[][];
      } else {
        dataMatrix = inputData.data as number[][];
      }
    } else if (Array.isArray(inputData)) {
      dataMatrix = inputData as number[][];
    } else {
      throw new Error("无效的数据格式");
    }

    if (isImage) {
      imgHeight = dataMatrix.length;
      imgWidth = dataMatrix[0]?.length || 0;
    }

    if (dataMatrix.length === 0 || dataMatrix[0].length === 0) {
      throw new Error("输入矩阵为空");
    }

    const k = Number(params.k) || 3;
    const maxIterations = Number(params.maxIterations) || 100;

    // ---------------------------------------------------------
    // 准备聚类特征
    // ---------------------------------------------------------
    let features: number[][] = [];
    
    if (isImage) {
      // 图像：展平为 1D 数组（特征是单一的灰度值）
      for (let i = 0; i < imgHeight; i++) {
        for (let j = 0; j < imgWidth; j++) {
          features.push([dataMatrix[i][j]]);
        }
      }
    } else {
      // 普通数据：特征就是原数据的深拷贝，防止污染上游数据！
      features = dataMatrix.map(row => [...row]);
    }

    const nSamples = features.length;
    const nFeatures = features[0].length;

    // ---------------------------------------------------------
    // 初始化质心 (K-Means++ 简化版：随机选取K个点)
    // ---------------------------------------------------------
    let centroids: number[][] = [];
    const usedIndices = new Set<number>();
    
    // 确保有足够的点可以作为质心
    const actualK = Math.min(k, nSamples);
    
    while (centroids.length < actualK) {
      const idx = Math.floor(Math.random() * nSamples);
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx);
        centroids.push([...features[idx]]);
      }
    }

    // ---------------------------------------------------------
    // 迭代过程
    // ---------------------------------------------------------
    let labels = new Array(nSamples).fill(0);
    let iteration = 0;
    let changed = true;

    // 修复：确保至少执行1次迭代，即使 maxIterations 被设置为非常小的值（比如0或1）
    // 为了防止浏览器卡死，这里做一个简单的 Mini-batch 或者直接限制大图的迭代次数
    const actualMaxIters = Math.max(1, isImage ? Math.min(maxIterations, 30) : maxIterations); 

    while (changed && iteration < actualMaxIters) {
      changed = false;
      const newCentroids = Array(actualK).fill(0).map(() => new Array(nFeatures).fill(0));
      const counts = new Array(actualK).fill(0);

      // 步骤1：分配点到最近的质心
      for (let i = 0; i < nSamples; i++) {
        let minDist = Infinity;
        let bestCluster = 0;
        
        for (let j = 0; j < actualK; j++) {
          let distSq = 0;
          for (let f = 0; f < nFeatures; f++) {
            const diff = features[i][f] - centroids[j][f];
            distSq += diff * diff;
          }
          if (distSq < minDist) {
            minDist = distSq;
            bestCluster = j;
          }
        }
        
        if (labels[i] !== bestCluster) {
          labels[i] = bestCluster;
          changed = true;
        }
        
        // 累加计算新质心
        for (let f = 0; f < nFeatures; f++) {
          newCentroids[bestCluster][f] += features[i][f];
        }
        counts[bestCluster]++;
      }

      // 步骤2：更新质心
      for (let j = 0; j < actualK; j++) {
        if (counts[j] > 0) {
          for (let f = 0; f < nFeatures; f++) {
            centroids[j][f] = newCentroids[j][f] / counts[j];
          }
        }
      }
      
      iteration++;
      
      // 让出线程（非阻塞机制），但为了算法纯粹性，这里仅在图像过大时让出
      if (isImage && iteration % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    // ---------------------------------------------------------
    // 构造输出与可视化大礼包
    // ---------------------------------------------------------
    if (isImage) {
      // 图像分割大礼包
      const clusteredImages: number[][][] = [];
      
      // 生成 K 张独立的图片，属于该簇的保留原灰度（或质心灰度），不属于的变黑
      for (let clusterIdx = 0; clusterIdx < actualK; clusterIdx++) {
        const img: number[][] = Array(imgHeight).fill(0).map(() => Array(imgWidth).fill(0));
        let flatIdx = 0;
        for (let i = 0; i < imgHeight; i++) {
          for (let j = 0; j < imgWidth; j++) {
            if (labels[flatIdx] === clusterIdx) {
              img[i][j] = dataMatrix[i][j]; // 保留原色
            } else {
              img[i][j] = 0; // 黑色背景
            }
            flatIdx++;
          }
        }
        clusteredImages.push(img);
      }

      // 为了兼容现有示波器的单图逻辑，主图展示带有“灰度分层（质心颜色）”的合成图
      const mainImage: number[][] = Array(imgHeight).fill(0).map(() => Array(imgWidth).fill(0));
      let flatIdx = 0;
      for (let i = 0; i < imgHeight; i++) {
        for (let j = 0; j < imgWidth; j++) {
          mainImage[i][j] = centroids[labels[flatIdx]][0]; // 使用簇的平均灰度涂色
          flatIdx++;
        }
      }

      return {
        labels,
        centroids,
        clusteredImages,
        visualization: {
          type: "image-collection", // 这是一个新的复合类型，我们需要升级示波器支持
          data: {
            mainImage: mainImage, // 整体分层效果图
            layers: clusteredImages, // K个独立图层
            width: imgWidth,
            height: imgHeight
          }
        }
      };

    } else {
      // 普通数据散点聚类大礼包
      // 修复：确保 points 能够映射回原始数据集的坐标，而不是被污染的 features
      const points = features.map((row, i) => [
        row[0] ?? 0, 
        row.length > 1 ? row[1] : 0, 
        labels[i] ?? 0
      ]);

      return {
        labels,
        centroids,
        visualization: {
          type: "scatter-clusters", // 通知示波器按簇染色
          data: {
            points: points, // [x, y, clusterId]
            centroids: centroids.map(c => [c[0] ?? 0, c.length > 1 ? c[1] : 0])
          }
        }
      };
    }
  },
};
