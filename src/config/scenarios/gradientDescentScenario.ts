import type { Scenario } from "@/types/scenarioConfig";
import type { Point3D } from "@/types/computationResult";
import { gradientDescentBridge } from "./gradientDescentBridge";

// 目标函数定义
const objectiveFunctions = {
  bowl: {
    name: "碗状函数 (x²+y²)",
    func: (x: number, y: number) => x * x + y * y,
    gradient: (x: number, y: number) => ({ dx: 2 * x, dy: 2 * y }),
  },
  saddle: {
    name: "马鞍面 (x²-y²)",
    func: (x: number, y: number) => x * x - y * y,
    gradient: (x: number, y: number) => ({ dx: 2 * x, dy: -2 * y }),
  },
  rosenbrock: {
    name: "Rosenbrock 函数",
    func: (x: number, y: number) => (1 - x) ** 2 + 100 * (y - x ** 2) ** 2,
    gradient: (x: number, y: number) => ({
      dx: -2 * (1 - x) - 400 * x * (y - x ** 2),
      dy: 200 * (y - x ** 2),
    }),
  },
};

// 生成 3D 曲面数据
function generateSurfaceData(
  funcType: keyof typeof objectiveFunctions,
  range: { xMin: number; xMax: number; yMin: number; yMax: number },
  resolution = 50,
): Point3D[] {
  const { func } = objectiveFunctions[funcType];
  const { xMin, xMax, yMin, yMax } = range;
  const data: Point3D[] = [];

  const xStep = (xMax - xMin) / resolution;
  const yStep = (yMax - yMin) / resolution;

  for (let i = 0; i <= resolution; i++) {
    for (let j = 0; j <= resolution; j++) {
      const x = xMin + i * xStep;
      const y = yMin + j * yStep;
      let z = func(x, y);

      // Rosenbrock 函数使用对数缩放
      if (funcType === "rosenbrock") {
        z = Math.log(1 + z);
      }

      data.push({ x, y, z });
    }
  }

  return data;
}

// 梯度下降场景的实现
const gradientDescentScenario: Scenario = {
  key: "gradient-descent",
  name: "梯度下降",
  description: "演示梯度下降算法如何优化损失函数",
  visualizationType: "gradient-descent-3d",
  realtimeMode: true,
  bridgeConfig: gradientDescentBridge,
  parameterConfig: [
    {
      key: "functionType",
      label: "目标函数",
      type: "select",
      defaultValue: "bowl",
      options: {
        items: [
          { label: "碗状函数 (x²+y²)", value: "bowl" },
          { label: "马鞍面 (x²-y²)", value: "saddle" },
          { label: "Rosenbrock 函数", value: "rosenbrock" },
        ],
      },
    },
    {
      key: "learningRate",
      label: "学习率",
      type: "slider",
      defaultValue: 0.1,
      options: { min: 0.01, max: 1, step: 0.01 },
    },
    {
      key: "x0",
      label: "初始点 X",
      type: "number",
      defaultValue: 1.5,
      options: { min: -10, max: 10, step: 0.1 },
    },
    {
      key: "y0",
      label: "初始点 Y",
      type: "number",
      defaultValue: 1.5,
      options: { min: -10, max: 10, step: 0.1 },
    },
    {
      key: "maxIterations",
      label: "最大迭代次数",
      type: "slider",
      defaultValue: 50,
      options: { min: 10, max: 200, step: 10 },
    },
  ],
  compute: async (params) => {
    const funcType = params.functionType as keyof typeof objectiveFunctions;
    const learningRate = params.learningRate as number;
    const x0 = params.x0 as number;
    const y0 = params.y0 as number;
    const maxIterations = params.maxIterations as number;

    const { func, gradient } = objectiveFunctions[funcType];
    const startTime = Date.now();

    // 梯度下降迭代
    let x = x0;
    let y = y0;
    const pathPoints: Point3D[] = [];

    for (let i = 0; i < maxIterations; i++) {
      const z = func(x, y);
      pathPoints.push({ x, y, z });

      const grad = gradient(x, y);
      x -= learningRate * grad.dx;
      y -= learningRate * grad.dy;

      // 防止数值溢出
      if (!isFinite(x) || !isFinite(y)) break;
    }

    const computationTime = Date.now() - startTime;
    const finalLoss = func(x, y);

    // 根据函数类型调整范围
    const range = funcType === "rosenbrock"
      ? { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }
      : { xMin: -5, xMax: 5, yMin: -5, yMax: 5 };

    const surfaceData = generateSurfaceData(funcType, range);

    return {
      computationTime,
      finalLoss,
      iterations: pathPoints.length,
      visualization: {
        type: "gradient-descent-3d" as const,
        functionType: funcType,
        surfaceData,
        pathPoints,
        range,
      },
    };
  },
  resultTransformer: (result) => [
    { label: "计算耗时", value: result?.computationTime, unit: "ms" },
    { label: "最终损失", value: result?.finalLoss?.toFixed(6) },
    { label: "迭代次数", value: result?.iterations },
  ],
};

export default gradientDescentScenario;
