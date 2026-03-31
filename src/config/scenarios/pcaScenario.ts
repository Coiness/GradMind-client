import type { Scenario } from "@/types/scenarioConfig";
import { presetDatasets } from "@/config/presetDatasets";
import { pcaAlgorithm } from "@/config/algorithms/dataReduction/pca";
import { pcaBridge } from "./pcaBridge";

// 生成 4 维高斯数据
function generate4DGaussianData(samples: number): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < samples; i++) {
    const row: number[] = [];
    for (let j = 0; j < 4; j++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      row.push(z * (j === 3 ? 2 : 1)); // 第 4 维变化更明显
    }
    data.push(row);
  }
  return data;
}

const pcaScenario: Scenario = {
  key: "pca",
  name: "PCA 降维",
  description: "主成分分析，将高维数据投影到低维空间",
  visualizationType: "pca-scatter",
  realtimeMode: true,
  bridgeConfig: pcaBridge,
  parameterConfig: [
    {
      key: "datasetType",
      label: "数据集",
      type: "select",
      defaultValue: "fruit",
      options: {
        items: [
          { label: "水果多维特征", value: "fruit" },
          { label: "随机高斯数据", value: "random" },
        ],
      },
    },
    {
      key: "nComponents",
      label: "主成分数量",
      type: "slider",
      defaultValue: 4,
      options: { min: 1, max: 4, step: 1 },
    },
  ],
  compute: async (params) => {
    const datasetType = params.datasetType as string;
    const nComponents = params.nComponents as number;
    const startTime = Date.now();

    // 使用 4 维数据
    const data = generate4DGaussianData(150);

    // 调用 PCA 算法
    const result = await pcaAlgorithm.compute(
      { dataset: data },
      { nComponents: 4, center: "true" },
    );

    const transformed = result.transformed as number[][];
    const originalData = data;

    const computationTime = Date.now() - startTime;

    return {
      ...result,
      computationTime,
      visualization: {
        type: "pca-scatter" as const,
        points: transformed,
        originalData,
        nComponents,
        variance: result.variance as number[],
        explainedVariance: result.explainedVariance as number[],
        cumulativeVariance: result.cumulativeVariance as number[],
      },
    };
  },
  resultTransformer: (result) => {
    const explainedVariance = result?.explainedVariance as number[] | undefined;
    const cumulativeVariance = result?.cumulativeVariance as
      | number[]
      | undefined;
    return [
      { label: "计算耗时", value: result?.computationTime, unit: "ms" },
      {
        label: "PC1 解释方差",
        value: explainedVariance?.[0]
          ? `${(explainedVariance[0] * 100).toFixed(1)}%`
          : "-",
      },
      {
        label: "累积方差",
        value: cumulativeVariance?.[1]
          ? `${(cumulativeVariance[1] * 100).toFixed(1)}%`
          : "-",
      },
    ];
  },
};

export default pcaScenario;
