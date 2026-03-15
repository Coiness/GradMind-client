import React, { useEffect } from "react";
import { Layout, Empty } from "antd";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  loadAlgorithmLibrary,
  loadSavedWorkflows,
  createNewWorkflow,
  loadTemplates,
} from "@/store/features/orchestrationSlice";
import { AlgorithmLibrary } from "./components/AlgorithmLibrary";
import { WorkflowCanvasWithProvider } from "./components/WorkflowCanvas";
import { NodeInspector } from "./components/NodeInspector";
import { WorkflowControls } from "./components/WorkflowControls";
import styles from "./index.module.css";

const { Sider, Content } = Layout;

const OrchestrationPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentWorkflow } = useAppSelector((state) => state.orchestration);

  useEffect(() => {
    dispatch(loadAlgorithmLibrary());
    dispatch(loadSavedWorkflows());
    dispatch(loadTemplates());
    if (!currentWorkflow) {
      dispatch(createNewWorkflow({ name: "新建工作流" }));
    }
  }, [dispatch]);

  return (
    <Layout className={styles.orchestrationPage}>
      <Sider width={300} className={styles.leftPanel} theme="light">
        <AlgorithmLibrary />
      </Sider>

      <Content className={styles.centerPanel}>
        <WorkflowControls />
        <div className={styles.canvasArea}>
          {currentWorkflow ? (
            <WorkflowCanvasWithProvider />
          ) : (
            <div className={styles.emptyState}>
              <Empty description="未加载工作流。创建一个新工作流以开始。" />
            </div>
          )}
        </div>
      </Content>

      <Sider width={300} className={styles.rightPanel} theme="light">
        <NodeInspector />
      </Sider>
    </Layout>
  );
};

export default OrchestrationPage;
