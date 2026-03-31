import type { Scenario } from "@/types/scenarioConfig";
import { pcaAlgorithm } from "@/config/algorithms/dataReduction/pca";
import { pcaBridge } from "./pcaBridge";

// 生成 4 维高斯数据
function generate4DGaussianData(samples: number): number[][] {
  const data: number[][] = [];

  for (let i = 0; i < samples; i++) {
    // 生成基础高斯随机数
    const gaussianRandom = () => {
      const u1 = Math.random();
      const u2 = Math.random();
      return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    };

    // 生成 4 个独立的基础变量
    const base1 = gaussianRandom();
    const base2 = gaussianRandom();
    const base3 = gaussianRandom();
    const base4 = gaussianRandom();

    // 前 3 维：使用不同的线性组合，确保主成分方向分散
    const x = base1 * 1.5 + base2 * 0.3;
    const y = base2 * 1.2 + base3 * 0.5;
    const z = base3 * 1.0 + base1 * 0.2 + base4 * 0.3;

    // 第 4 维：独立生成，变化更明显
    const color = base4 * 2.0 + base1 * 0.2;

    data.push([x, y, z, color]);
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
      key: "nComponents",
      label: "主成分数量",
      type: "slider",
      defaultValue: 4,
      options: { min: 1, max: 4, step: 1 },
    },
  ],
  compute: async (params) => {
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
        components: result.components as number[][],
        mean: result.mean as number[],
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
