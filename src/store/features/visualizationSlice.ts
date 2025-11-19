import type { ParameterValues } from "@/types/parameterConfig";
import type { ComputationResult } from "@/types/computationResult";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 1. 定义 Slice 的 State 类型
export interface VisualizationState {
  selectedScenarioKey: string | null; // 当前选择的场景
  appliedParams: ParameterValues | null; // 已应用的参数
  data: ComputationResult | null; // 计算结果
  status: "idle" | "loading" | "succeeded" | "failed"; // 计算状态
  error: string | null; // 错误信息
}

// 2. 定义初始状态
const initialState: VisualizationState = {
  selectedScenarioKey: null,
  appliedParams: null,
  data: null,
  status: "idle",
  error: null,
};

// 3. 创建一个异步 Thunk 来执行计算
export const runComputation = createAsyncThunk<
  ComputationResult, // 成功返回的数据类型
  { scenarioKey: string; params: ParameterValues } // 传入的参数类型
>("visualization/runComputation", async ({ scenarioKey, params }) => {
  // 动态导入场景配置（避免循环依赖）
  const { scenarios } = await import("@/config/scenarios");

  // 找到对应的场景
  const scenario = scenarios.find((s) => s.key === scenarioKey);
  if (!scenario) {
    throw new Error(`场景 "${scenarioKey}" 未找到`);
  }

  // 执行计算
  console.log(`开始计算场景 "${scenario.name}"，参数:`, params);
  const result = await scenario.compute(params);
  console.log("计算完成，结果:", result);

  return result;
});

// 4. 创建 Slice
export const visualizationSlice = createSlice({
  name: "visualization",
  initialState,
  reducers: {
    // 设置当前选择的场景
    setSelectedScenario: (state, action) => {
      state.selectedScenarioKey = action.payload;
      // 切换场景时重置计算结果
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
    // 重置可视化状态
    resetVisualization: (state) => {
      state.appliedParams = null;
      state.data = null;
      state.status = "idle";
      state.error = null;
    },
  },
  // extraReducers 用于处理异步 Thunk 的不同状态
  extraReducers: (builder) => {
    builder
      .addCase(runComputation.pending, (state, action) => {
        state.status = "loading";
        state.selectedScenarioKey = action.meta.arg.scenarioKey;
        state.appliedParams = action.meta.arg.params;
        state.error = null;
      })
      .addCase(runComputation.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(runComputation.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "计算失败";
      });
  },
});

export const { setSelectedScenario, resetVisualization } =
  visualizationSlice.actions;

export default visualizationSlice.reducer;
