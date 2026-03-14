import React, { useEffect, useState } from "react";
import { Tabs, Badge } from "antd";
import {
  BarChartOutlined,
  UpOutlined,
  DownOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "@/store/hooks";
import ScatterChart from "./charts/ScatterChart";
import ConvergenceChart from "./charts/ConvergenceChart";
import RegressionChart from "./charts/RegressionChart";
import MatrixView from "./charts/MatrixView";
import styles from "./index.module.css";

/** 根据 visualization.type 渲染对应图表 */
function renderChart(result: Record<string, unknown>): React.ReactNode {
  const viz = result?.visualization as
    | { type: string; data: Record<string, unknown> }
    | undefined;

  if (!viz) {
    return (
      <pre className={styles.rawResult}>
        {JSON.stringify(result, null, 2)}
      </pre>
    );
  }

  switch (viz.type) {
    case "scatter":
      return <ScatterChart data={viz.data as Parameters<typeof ScatterChart>[0]["data"]} />;
    case "convergence":
      return <ConvergenceChart data={viz.data as Parameters<typeof ConvergenceChart>[0]["data"]} />;
    case "regression":
      return <RegressionChart data={viz.data as Parameters<typeof RegressionChart>[0]["data"]} />;
    case "matrix":
      return <MatrixView data={viz.data as Parameters<typeof MatrixView>[0]["data"]} />;
    default:
      return (
        <pre className={styles.rawResult}>
          {JSON.stringify(result, null, 2)}
        </pre>
      );
  }
}

/**
 * ResultPanel
 * 画布下方可折叠的结果面板，执行完成后自动展开
 */
const ResultPanel: React.FC = () => {
  const { executionStatus, executionResults, currentWorkflow } = useAppSelector(
    (state) => state.orchestration,
  );

  const [collapsed, setCollapsed] = useState(true);

  // 执行完成后自动展开
  useEffect(() => {
    if (executionStatus === "completed") {
      setCollapsed(false);
    }
  }, [executionStatus]);

  // 找出所有有 visualization 结果的算法节点
  const visualizableNodes = (currentWorkflow?.nodes ?? []).filter((node) => {
    if (node.type !== "algorithm") return false;
    const result = executionResults[node.id];
    return result?.visualization != null;
  });

  const hasResults = visualizableNodes.length > 0;

  const tabItems = visualizableNodes.map((node) => ({
    key: node.id,
    label: node.data.label,
    children: (
      <div style={{ height: "100%" }}>
        {renderChart(executionResults[node.id])}
      </div>
    ),
  }));

  return (
    <div
      className={`${styles.resultPanel} ${collapsed ? styles.collapsed : styles.expanded}`}
    >
      {/* 标题栏（点击折叠/展开） */}
      <div className={styles.header} onClick={() => setCollapsed((c) => !c)}>
        <div className={styles.headerLeft}>
          <BarChartOutlined />
          执行结果
          {hasResults && (
            <Badge
              count={visualizableNodes.length}
              style={{ backgroundColor: "#52c41a" }}
            />
          )}
          {executionStatus === "completed" && (
            <CheckCircleOutlined style={{ color: "#52c41a", fontSize: 14 }} />
          )}
        </div>
        <div className={styles.headerRight}>
          {collapsed ? "展开" : "收起"}
          {collapsed ? (
            <UpOutlined style={{ fontSize: 11 }} />
          ) : (
            <DownOutlined style={{ fontSize: 11 }} />
          )}
        </div>
      </div>

      {/* 内容区（折叠时隐藏） */}
      {!collapsed && (
        <div className={styles.body}>
          {hasResults ? (
            <Tabs
              items={tabItems}
              size="small"
              style={{ height: "100%" }}
              tabBarStyle={{ marginBottom: 4 }}
              renderTabBar={(props, DefaultTabBar) => (
                <DefaultTabBar {...props} style={{ marginBottom: 4 }} />
              )}
            />
          ) : (
            <div className={styles.emptyHint}>
              {executionStatus === "running"
                ? "正在执行..."
                : executionStatus === "error"
                ? "执行出错，请检查节点配置"
                : "执行工作流后，图表将在此处显示"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResultPanel;
