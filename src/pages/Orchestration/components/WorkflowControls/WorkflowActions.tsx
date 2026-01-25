import React, { useState } from "react";
import { Button, Space, Modal, List, message, Popconfirm } from "antd";
import {
  SaveOutlined,
  FolderOpenOutlined,
  FileAddOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  saveWorkflow,
  loadWorkflow,
  createNewWorkflow,
  deleteWorkflow,
} from "@/store/features/orchestrationSlice";
import type { Workflow } from "@/types/workflow";
import styles from "./WorkflowActions.module.css";

/**
 * WorkflowActions Component
 * Save, load, and create new workflows
 */
export const WorkflowActions: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentWorkflow, savedWorkflows } = useAppSelector(
    (state) => state.orchestration
  );
  const [loadModalVisible, setLoadModalVisible] = useState(false);

  // Save workflow
  const handleSave = () => {
    if (!currentWorkflow) {
      message.warning("No workflow to save");
      return;
    }

    dispatch(saveWorkflow());
    message.success(`Workflow "${currentWorkflow.name}" saved successfully!`);
  };

  // Load workflow
  const handleLoad = (workflowId: string) => {
    dispatch(loadWorkflow(workflowId));
    setLoadModalVisible(false);
    message.success("Workflow loaded successfully!");
  };

  // Delete workflow
  const handleDelete = (workflowId: string, workflowName: string) => {
    dispatch(deleteWorkflow(workflowId));
    message.success(`Workflow "${workflowName}" deleted`);
  };

  // Create new workflow
  const handleNew = () => {
    if (currentWorkflow && currentWorkflow.nodes.length > 0) {
      Modal.confirm({
        title: "Create New Workflow",
        content: "You have unsaved changes. Are you sure you want to create a new workflow?",
        onOk: () => {
          dispatch(createNewWorkflow({ name: "New Workflow" }));
          message.success("New workflow created");
        },
      });
    } else {
      dispatch(createNewWorkflow({ name: "New Workflow" }));
      message.success("New workflow created");
    }
  };

  return (
    <>
      <Space size="small">
        <Button
          icon={<FileAddOutlined />}
          onClick={handleNew}
        >
          New
        </Button>

        <Button
          icon={<SaveOutlined />}
          onClick={handleSave}
          disabled={!currentWorkflow}
        >
          Save
        </Button>

        <Button
          icon={<FolderOpenOutlined />}
          onClick={() => setLoadModalVisible(true)}
        >
          Load
        </Button>
      </Space>

      {/* Load Workflow Modal */}
      <Modal
        title="Load Workflow"
        open={loadModalVisible}
        onCancel={() => setLoadModalVisible(false)}
        footer={null}
        width={600}
      >
        {savedWorkflows.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No saved workflows found</p>
          </div>
        ) : (
          <List
            dataSource={savedWorkflows}
            renderItem={(workflow: Workflow) => (
              <List.Item
                key={workflow.id}
                actions={[
                  <Button
                    type="link"
                    onClick={() => handleLoad(workflow.id)}
                  >
                    Load
                  </Button>,
                  <Popconfirm
                    title="Delete this workflow?"
                    onConfirm={() => handleDelete(workflow.id, workflow.name)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  title={workflow.name}
                  description={`${workflow.nodes.length} nodes • Updated: ${new Date(
                    workflow.updatedAt
                  ).toLocaleString()}`}
                />
              </List.Item>
            )}
          />
        )}
      </Modal>
    </>
  );
};
