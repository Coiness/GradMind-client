import React from "react";
import { Button, Space, Badge, message } from "antd";
import {
  PlayCircleOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  executeWorkflow,
  resetExecution,
  setValidationErrors,
} from "@/store/features/orchestrationSlice";

/**
 * ExecutionControls Component
 * Controls for executing, validating, and resetting workflows
 */
export const ExecutionControls: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    currentWorkflow,
    executionStatus,
    validationErrors,
    algorithmLibrary,
  } = useAppSelector((state) => state.orchestration);

  const isExecuting = executionStatus === "running";
  const hasErrors = validationErrors.length > 0;

  // Validate workflow
  const handleValidate = async () => {
    if (!currentWorkflow) {
      message.warning("没有可验证的工作流");
      return;
    }

    try {
      // Import validation utilities
      const { validateWorkflow } =
        await import("@/pages/Orchestration/utils/workflowValidator");

      const errors = validateWorkflow(currentWorkflow, algorithmLibrary);
      dispatch(setValidationErrors(errors));

      if (errors.length === 0) {
        message.success("工作流验证通过！");
      } else {
        const errorCount = errors.filter((e) => e.type === "error").length;
        const warningCount = errors.filter((e) => e.type === "warning").length;
        message.warning(
          `验证发现 ${errorCount} 个错误和 ${warningCount} 个警告`,
        );
      }
    } catch (error) {
      message.error("验证失败");
      console.error("Validation error:", error);
    }
  };

  // Execute workflow
  const handleExecute = async () => {
    console.log("🎯 [ExecutionControls] Execute button clicked");
    if (!currentWorkflow) {
      message.warning("没有可执行的工作流");
      return;
    }

    console.log("📋 [ExecutionControls] Current workflow:", currentWorkflow);

    // Validate first
    try {
      const { validateWorkflow } =
        await import("@/pages/Orchestration/utils/workflowValidator");

      const errors = validateWorkflow(currentWorkflow, algorithmLibrary);
      dispatch(setValidationErrors(errors));

      const criticalErrors = errors.filter((e) => e.type === "error");
      if (criticalErrors.length > 0) {
        message.error(`无法执行：工作流有 ${criticalErrors.length} 个错误`);
        console.error(
          "❌ [ExecutionControls] Validation errors:",
          criticalErrors,
        );
        return;
      }

      console.log(
        "✅ [ExecutionControls] Validation passed, dispatching executeWorkflow",
      );
      // Execute
      const result = await dispatch(executeWorkflow()).unwrap();
      console.log(
        "🎉 [ExecutionControls] Execution completed successfully:",
        result,
      );
      message.success("工作流执行成功！");
    } catch (error: any) {
      console.error("❌ [ExecutionControls] Execution failed:", error);
      message.error(`执行失败：${error.message || "未知错误"}`);
    }
  };

  // Reset execution
  const handleReset = () => {
    dispatch(resetExecution());
    message.info("执行状态已重置");
  };

  return (
    <Space size="small">
      <Button
        type="primary"
        icon={<PlayCircleOutlined />}
        onClick={handleExecute}
        loading={isExecuting}
        disabled={!currentWorkflow || isExecuting}
      >
        执行
      </Button>

      <Badge count={hasErrors ? validationErrors.length : 0} offset={[5, 0]}>
        <Button
          icon={<CheckCircleOutlined />}
          onClick={handleValidate}
          disabled={!currentWorkflow}
        >
          验证
        </Button>
      </Badge>

      <Button
        icon={<ReloadOutlined />}
        onClick={handleReset}
        disabled={!currentWorkflow || executionStatus === "idle"}
      >
        重置
      </Button>
    </Space>
  );
};
