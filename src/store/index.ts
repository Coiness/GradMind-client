import { configureStore } from "@reduxjs/toolkit";
import VisualizationSlice from "./features/visualizationSlice";
import OrchestrationSlice from "./features/orchestrationSlice";

export const store = configureStore({
  reducer: {
    // 在这里注册你所有的 slice
    visualization: VisualizationSlice,
    orchestration: OrchestrationSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // 忽略 algorithmLibrary 的序列化检查，因为它包含 compute 函数
        ignoredPaths: ["orchestration.algorithmLibrary"],
        // 忽略这些 action types 的序列化检查
        ignoredActions: ["orchestration/loadAlgorithmLibrary/fulfilled"],
      },
    }),
});

// 从 store 本身推断出 `RootState` 和 `AppDispatch` 类型
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
