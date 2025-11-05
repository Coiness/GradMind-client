import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

// 1. 定义 state 的类型
export interface VisualizationState {
  value: number;
}

// 2. 定义初始状态
const initialState: VisualizationState = {
  value: 0,
};

// 3. 创建 Slice
export const VisualizationSlice = createSlice({
  name: "VisualizationSlice",
  initialState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

// 4. 导出 actions
export const { increment, decrement, incrementByAmount } =
  VisualizationSlice.actions;

// 5. 导出 reducer
export default VisualizationSlice.reducer;
