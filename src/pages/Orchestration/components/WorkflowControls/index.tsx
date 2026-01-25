import React, { useState } from "react";
import { Space, Button } from "antd";
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
 */
export const WorkflowControls: React.FC = () => {
  const [datasetModalVisible, setDatasetModalVisible] = useState(false);

  return (
    <>
      <div className={styles.workflowControls}>
        <div className={styles.leftSection}>
          <WorkflowNameEditor />
        </div>
        <div className={styles.centerSection}>
          <Space size="middle">
            <ExecutionControls />
            <WorkflowActions />
            <TemplateSelector />
            <Button
              icon={<DatabaseOutlined />}
              onClick={() => setDatasetModalVisible(true)}
            >
              Add Dataset
            </Button>
          </Space>
        </div>
      </div>

      <DatasetManager
        visible={datasetModalVisible}
        onClose={() => setDatasetModalVisible(false)}
      />
    </>
  );
};
