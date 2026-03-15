import type { ParameterValues } from "./parameterConfig";

/**
 * Node execution status
 */
export type NodeStatus = "idle" | "running" | "success" | "error";

/**
 * Workflow execution status
 */
export type WorkflowExecutionStatus =
  | "idle"
  | "running"
  | "paused"
  | "completed"
  | "error";

/**
 * Dataset data structure
 */
export interface DatasetData {
  type: "csv" | "json" | "manual";
  data: any[][]; // 2D array
  headers?: string[];
  metadata?: {
    rows: number;
    columns: number;
    fileName?: string;
  };
}

/**
 * Node in the workflow canvas
 */
export interface WorkflowNode {
  id: string; // Unique node ID
  type: "algorithm" | "dataset" | "oscilloscope"; // Node type
  position: { x: number; y: number }; // Position on canvas
  data: {
    algorithmKey?: string; // Reference to AlgorithmNode key
    label: string; // Display label
    parameters?: ParameterValues; // Node-specific parameter values
    result?: any; // Computation result
    status?: NodeStatus; // Execution status
    error?: string; // Error message if status is 'error'
    datasetData?: DatasetData; // Dataset data for dataset nodes
  };
}

/**
 * Edge connecting two nodes in the workflow
 */
export interface WorkflowEdge {
  id: string; // Unique edge ID
  source: string; // Source node ID
  target: string; // Target node ID
  sourceHandle: string; // Output port ID
  targetHandle: string; // Input port ID
  animated?: boolean; // For execution visualization
}

/**
 * Complete workflow definition
 */
export interface Workflow {
  id: string; // Unique workflow ID
  name: string; // Workflow name
  description: string; // Workflow description
  nodes: WorkflowNode[]; // All nodes in the workflow
  edges: WorkflowEdge[]; // All edges in the workflow
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

/**
 * Validation error for a workflow
 */
export interface ValidationError {
  nodeId?: string; // Node ID if error is node-specific
  edgeId?: string; // Edge ID if error is edge-specific
  message: string; // Error message
  type: "error" | "warning"; // Severity
}

/**
 * Workflow execution result
 */
export interface WorkflowExecutionResult {
  workflowId: string;
  executionId: string;
  startTime: string;
  endTime?: string;
  status: WorkflowExecutionStatus;
  nodeResults: Record<string, any>; // nodeId -> result
  errors: Record<string, string>; // nodeId -> error message
}
