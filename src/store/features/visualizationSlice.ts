import type { ParameterValues } from "@/types";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

// 假设这是你的计算结果的数据结构
export interface VisualizationData {
  computationTime: number;
  finalLoss: number;
  // ... 其他图表需要的数据
}

// 1. 定义 Slice 的 State 类型
export interface VisualizationState {
  appliedParams: ParameterValues | null; // 已应用的参数
  data: VisualizationData | null; // 计算结果
  status: "idle" | "loading" | "succeeded" | "failed"; // 计算状态
  error: string | null; // 错误信息
}

// 2. 定义初始状态
const initialState: VisualizationState = {
  appliedParams: null,
  data: null,
  status: "idle",
  error: null,
};

// 3. 创建一个异步 Thunk 来模拟计算过程
export const runComputation = createAsyncThunk<
  VisualizationData, // 成功返回的数据类型
  { params: ParameterValues } // 传入的参数类型
>("visualization/runComputation", async ({ params }) => {
  // --- 这里是你的计算逻辑 ---
  // 为了演示，我们模拟一个2秒的异步计算
  console.log("开始计算，参数:", params);
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 模拟计算成功，返回一个结果
  const result: VisualizationData = {
    computationTime: 2000,
    finalLoss: Math.random(),
  };
  console.log("计算完成，结果:", result);
  return result;
  // 如果计算失败，可以 throw new Error('计算失败');
});

// 4. 创建 Slice
export const visualizationSlice = createSlice({
  name: "visualization",
  initialState,
  reducers: {
    // 这里可以放一些同步的 reducer，比如重置状态
    resetVisualization: (state) => {
      state.status = "idle";
      state.data = null;
      state.error = null;
      state.appliedParams = null;
    },
  },
  // extraReducers 用于处理异步 Thunk 的不同状态
  extraReducers: (builder) => {
    builder
      .addCase(runComputation.pending, (state, action) => {
        state.status = "loading";
        // 当计算开始时，我们将应用的参数存入 state
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

export const { resetVisualization } = visualizationSlice.actions;

export default visualizationSlice.reducer;
