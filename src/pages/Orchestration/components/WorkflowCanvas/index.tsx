import React, { useCallback, useRef } from "react";
import type { DragEvent } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
} from "reactflow";
import type { Node, Edge, Connection } from "reactflow";
import "reactflow/dist/style.css";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addNode,
  removeNode,
  updateNodePosition,
  addEdge as addEdgeAction,
  removeEdge,
  setSelectedNode,
  addOscilloscopeNode,
  addDatasetNode,
} from "@/store/features/orchestrationSlice";
import { getAlgorithmByKey } from "@/config/algorithms";
import { AlgorithmNode } from "./nodes/AlgorithmNode";
import { DatasetNode } from "./nodes/DatasetNode";
import { OscilloscopeNode } from "./nodes/OscilloscopeNode";
import styles from "./index.module.css";

// Define custom node types
const nodeTypes = {
  algorithm: AlgorithmNode,
  dataset: DatasetNode,
  oscilloscope: OscilloscopeNode,
};

/**
 * Workflow Canvas Component (Center Panel)
 * ReactFlow-based drag-and-drop workflow builder
 */
export const WorkflowCanvas: React.FC = () => {
  const dispatch = useAppDispatch();
  const { currentWorkflow, selectedNodeId } = useAppSelector(
    (state) => state.orchestration,
  );

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    currentWorkflow?.nodes || [],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    currentWorkflow?.edges || [],
  );

  // Sync nodes and edges with Redux state
  React.useEffect(() => {
    if (currentWorkflow) {
      setNodes(currentWorkflow.nodes);
      setEdges(currentWorkflow.edges);
    }
  }, [currentWorkflow, setNodes, setEdges]);

  // Handle node connection
  const onConnect = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return;

      const newEdge = {
        id: `edge-${Date.now()}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || "",
        targetHandle: connection.targetHandle || "",
        animated: false,
      };

      setEdges((eds) => addEdge(connection, eds));
      dispatch(addEdgeAction(newEdge));
    },
    [dispatch, setEdges],
  );

  // Handle node drag end (update position in Redux)
  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      dispatch(
        updateNodePosition({
          nodeId: node.id,
          position: node.position,
        }),
      );
    },
    [dispatch],
  );

  // Handle node selection
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      dispatch(setSelectedNode(node.id));
    },
    [dispatch],
  );

  // Handle pane click (deselect)
  const onPaneClick = useCallback(() => {
    dispatch(setSelectedNode(null));
  }, [dispatch]);

  // Handle node deletion
  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      deleted.forEach((node) => {
        dispatch(removeNode(node.id));
      });
    },
    [dispatch],
  );

  // Handle edge deletion
  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      deleted.forEach((edge) => {
        dispatch(removeEdge(edge.id));
      });
    },
    [dispatch],
  );

  // Handle drop from algorithm library
  const onDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();
      if (!reactFlowWrapper.current) return;

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const position = {
        x: event.clientX - reactFlowBounds.left - 100,
        y: event.clientY - reactFlowBounds.top - 50,
      };

      const nodeType = event.dataTransfer.getData("nodeType");

      // 示波器节点
      if (nodeType === "oscilloscope") {
        dispatch(addOscilloscopeNode({ position }));
        return;
      }

      // 数据集节点
      if (nodeType === "dataset") {
        const datasetDataStr = event.dataTransfer.getData("datasetData");
        const label = event.dataTransfer.getData("label") || "数据集";
        if (datasetDataStr) {
          try {
            const datasetData = JSON.parse(datasetDataStr);
            dispatch(
              addDatasetNode({
                position,
                label,
                datasetData,
              }),
            );
          } catch (e) {
            console.error("无法解析数据集数据:", e);
          }
          return;
        }
      }

      // 算法节点
      const algorithmKey = event.dataTransfer.getData("algorithmKey");
      if (!algorithmKey) return;
      const algorithm = getAlgorithmByKey(algorithmKey);
      if (!algorithm) return;
      dispatch(addNode({ algorithmKey, position }));
    },
    [dispatch],
  );

  const onDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }, []);

  return (
    <div className={styles.workflowCanvas} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.id === selectedNodeId) return "#1890ff";
            return node.type === "dataset" ? "#52c41a" : "#d9d9d9";
          }}
          maskColor="rgba(0, 0, 0, 0.1)"
        />
      </ReactFlow>
    </div>
  );
};

/**
 * Workflow Canvas with ReactFlow Provider
 */
export const WorkflowCanvasWithProvider: React.FC = () => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
};
