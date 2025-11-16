import React, { memo } from "react";
import type { FC, ReactNode } from "react";
import type { ParameterConfig, ParameterValues } from "@/types/parameterConfig";
import { ParameterPanel } from "@/components/ParameterPanel";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { runComputation } from "@/store/features/visualizationSlice";

interface IProps {
  children?: ReactNode;
}

const VisualizationPage: FC<IProps> = () => {
  // 1. 从 Redux store 中获取状态
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.visualization.status);

  const gradientDescentConfig: ParameterConfig[] = [
    // ... (你的配置数组保持不变)
    {
      key: "learningRate",
      label: "初始学习率 (Learning Rate)",
      type: "slider",
      defaultValue: 0.1,
      options: { min: 0.01, max: 1, step: 0.01 },
    },
    {
      key: "iterations",
      label: "迭代次数 (Iterations)",
      type: "number",
      defaultValue: 100,
      options: { min: 10, max: 1000, step: 10 },
    },
    {
      key: "optimizer",
      label: "优化器 (Optimizer)",
      type: "select",
      defaultValue: "sgd",
      options: {
        items: [
          { label: "SGD", value: "sgd" },
          { label: "Adam", value: "adam" },
          { label: "RMSprop", value: "rmsprop" },
        ],
      },
    },
  ];

  // 2. 回调函数现在会 dispatch 一个 action
  const handleApplyParams = (values: ParameterValues) => {
    dispatch(runComputation({ params: values }));
  };

  return (
    <div style={{ padding: "20px", width: "300px" }}>
      {/* 3. 将计算状态传递给 ParameterPanel，用于显示 loading */}
      <ParameterPanel
        config={gradientDescentConfig}
        onApply={handleApplyParams}
        isLoading={status === "loading"}
      />
    </div>
  );
};

export default memo(VisualizationPage);
