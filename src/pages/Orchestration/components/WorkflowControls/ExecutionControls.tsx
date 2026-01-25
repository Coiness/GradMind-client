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
  const { currentWorkflow, executionStatus, validationErrors, algorithmLibrary } =
    useAppSelector((state) => state.orchestration);

  const isExecuting = executionStatus === "running";
  const hasErrors = validationErrors.length > 0;

  // Validate workflow
  const handleValidate = async () => {
    if (!currentWorkflow) {
      message.warning("No workflow to validate");
      return;
    }

    try {
      // Import validation utilities
      const { validateWorkflow } = await import(
        "@/pages/Orchestration/utils/workflowValidator"
      );

      const errors = validateWorkflow(currentWorkflow, algorithmLibrary);
      dispatch(setValidationErrors(errors));

      if (errors.length === 0) {
        message.success("Workflow is valid!");
      } else {
        const errorCount = errors.filter((e) => e.type === "error").length;
        const warningCount = errors.filter((e) => e.type === "warning").length;
        message.warning(
          `Validation found ${errorCount} error(s) and ${warningCount} warning(s)`
        );
      }
    } catch (error) {
      message.error("Validation failed");
      console.error("Validation error:", error);
    }
  };

  // Execute workflow
  const handleExecute = async () => {
    if (!currentWorkflow) {
      message.warning("No workflow to execute");
      return;
    }

    // Validate first
    try {
      const { validateWorkflow } = await import(
        "@/pages/Orchestration/utils/workflowValidator"
      );

      const errors = validateWorkflow(currentWorkflow, algorithmLibrary);
      dispatch(setValidationErrors(errors));

      const criticalErrors = errors.filter((e) => e.type === "error");
      if (criticalErrors.length > 0) {
        message.error(
          `Cannot execute: workflow has ${criticalErrors.length} error(s)`
        );
        return;
      }

      // Execute
      await dispatch(executeWorkflow()).unwrap();
      message.success("Workflow executed successfully!");
    } catch (error: any) {
      message.error(`Execution failed: ${error.message || "Unknown error"}`);
      console.error("Execution error:", error);
    }
  };

  // Reset execution
  const handleReset = () => {
    dispatch(resetExecution());
    message.info("Execution state reset");
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
        Execute
      </Button>

      <Badge count={hasErrors ? validationErrors.length : 0} offset={[5, 0]}>
        <Button
          icon={<CheckCircleOutlined />}
          onClick={handleValidate}
          disabled={!currentWorkflow}
        >
          Validate
        </Button>
      </Badge>

      <Button
        icon={<ReloadOutlined />}
        onClick={handleReset}
        disabled={!currentWorkflow || executionStatus === "idle"}
      >
        Reset
      </Button>
    </Space>
  );
};
