import React, { useState } from "react";
import { Space, Button, Divider } from "antd";
import { DatabaseOutlined } from "@ant-design/icons";
import { WorkflowNameEditor } from "./WorkflowNameEditor";
import { ExecutionControls } from "./ExecutionControls";
import { WorkflowActions } from "./WorkflowActions";
import { TemplateSelector } from "./TemplateSelector";
import { DatasetManager } from "../DatasetManager";
import styles from "./index.module.css";

/**
 * WorkflowControls Component
 * Top toolbar for workflow execution, validation, save/load, and template management
 * 两行布局：第一行执行控制，第二行工作流管理+模板
 */
export const WorkflowControls: React.FC = () => {
  const [datasetModalVisible, setDatasetModalVisible] = useState(false);

  return (
    <>
      <div className={styles.workflowControls}>
        {/* 第一行：工作流名称 + 执行控制 */}
        <div className={styles.row}>
          <div className={styles.nameSection}>
            <WorkflowNameEditor />
          </div>
          <div className={styles.execSection}>
            <ExecutionControls />
          </div>
        </div>

        {/* 分隔线 */}
        <Divider style={{ margin: "6px 0" }} />

        {/* 第二行：工作流操作 + 模板选择 + 数据集 */}
        <div className={styles.row}>
          <div className={styles.actionsSection}>
            <Space size="small" wrap>
              <WorkflowActions />
              <Divider type="vertical" />
              <TemplateSelector />
              <Button
                icon={<DatabaseOutlined />}
                onClick={() => setDatasetModalVisible(true)}
              >
                添加数据集
              </Button>
            </Space>
          </div>
        </div>
      </div>

      <DatasetManager
        visible={datasetModalVisible}
        onClose={() => setDatasetModalVisible(false)}
      />
    </>
  );
};
