import React, { useState } from "react";
import { Input, Typography } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateWorkflowMetadata } from "@/store/features/orchestrationSlice";
import styles from "./WorkflowNameEditor.module.css";

const { Title } = Typography;

/**
 * WorkflowNameEditor Component
 * Inline editable workflow name
 */
export const WorkflowNameEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentWorkflow } = useAppSelector((state) => state.orchestration);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const handleStartEdit = () => {
    if (currentWorkflow) {
      setEditValue(currentWorkflow.name);
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (currentWorkflow && editValue.trim()) {
      dispatch(updateWorkflowMetadata({ name: editValue.trim() }));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue("");
  };

  if (!currentWorkflow) {
    return null;
  }

  if (isEditing) {
    return (
      <Input
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onPressEnter={handleSave}
        onBlur={handleSave}
        autoFocus
        className={styles.nameInput}
      />
    );
  }

  return (
    <div className={styles.nameEditor} onClick={handleStartEdit}>
      <Title level={5} className={styles.workflowName}>
        {currentWorkflow.name}
      </Title>
      <EditOutlined className={styles.editIcon} />
    </div>
  );
};
