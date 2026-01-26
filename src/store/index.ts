import { configureStore } from "@reduxjs/toolkit";
import VisualizationSlice from "./features/visualizationSlice";

export const store = configureStore({
  reducer: {
    // 在这里注册你所有的 slice
    visualization: VisualizationSlice,
  },
});

// 从 store 本身推断出 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
