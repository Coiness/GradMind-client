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
      message.warning("没有可保存的工作流");
      return;
    }

    dispatch(saveWorkflow());
    message.success(`工作流 "${currentWorkflow.name}" 保存成功！`);
  };

  // Load workflow
  const handleLoad = (workflowId: string) => {
    dispatch(loadWorkflow(workflowId));
    setLoadModalVisible(false);
    message.success("工作流加载成功！");
  };

  // Delete workflow
  const handleDelete = (workflowId: string, workflowName: string) => {
    dispatch(deleteWorkflow(workflowId));
    message.success(`工作流 "${workflowName}" 已删除`);
  };

  // Create new workflow
  const handleNew = () => {
    if (currentWorkflow && currentWorkflow.nodes.length > 0) {
      Modal.confirm({
        title: "创建新工作流",
        content: "您有未保存的更改。确定要创建新工作流吗？",
        onOk: () => {
          dispatch(createNewWorkflow({ name: "新建工作流" }));
          message.success("新工作流已创建");
        },
      });
    } else {
      dispatch(createNewWorkflow({ name: "新建工作流" }));
      message.success("新工作流已创建");
    }
  };

  return (
    <>
      <Space size="small">
        <Button
          icon={<FileAddOutlined />}
          onClick={handleNew}
        >
          新建
        </Button>

        <Button
          icon={<SaveOutlined />}
          onClick={handleSave}
          disabled={!currentWorkflow}
        >
          保存
        </Button>

        <Button
          icon={<FolderOpenOutlined />}
          onClick={() => setLoadModalVisible(true)}
        >
          加载
        </Button>
      </Space>

      {/* Load Workflow Modal */}
      <Modal
        title="加载工作流"
        open={loadModalVisible}
        onCancel={() => setLoadModalVisible(false)}
        footer={null}
        width={600}
      >
        {savedWorkflows.length === 0 ? (
          <div className={styles.emptyState}>
            <p>未找到已保存的工作流</p>
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
                    加载
                  </Button>,
                  <Popconfirm
                    title="删除此工作流？"
                    onConfirm={() => handleDelete(workflow.id, workflow.name)}
                    okText="是"
                    cancelText="否"
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
                  description={`${workflow.nodes.length} 个节点 • 更新时间: ${new Date(
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
