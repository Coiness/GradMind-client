import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AlgorithmNode } from "@/types/algorithmNode";
import type {
  Workflow,
  WorkflowNode,
  WorkflowEdge,
  WorkflowExecutionStatus,
  ValidationError,
} from "@/types/workflow";
import type { ParameterValues } from "@/types/parameterConfig";

/**
 * Orchestration slice state
 */
export interface OrchestrationState {
  // Algorithm library (12 modules)
  algorithmLibrary: AlgorithmNode[];

  // Current workflow being edited
  currentWorkflow: Workflow | null;

  // Saved workflows in localStorage
  savedWorkflows: Workflow[];

  // Workflow templates
  templates: Workflow[];

  // Execution state
  executionStatus: WorkflowExecutionStatus;
  executionResults: Record<string, any>; // nodeId -> result
  executionOrder: string[]; // Topologically sorted node IDs
  currentExecutingNodeId: string | null;

  // UI state
  selectedNodeId: string | null;
  validationErrors: ValidationError[];

  // Status
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

/**
 * Initial state
 */
const initialState: OrchestrationState = {
  algorithmLibrary: [],
  currentWorkflow: null,
  savedWorkflows: [],
  templates: [],
  executionStatus: "idle",
  executionResults: {},
  executionOrder: [],
  currentExecutingNodeId: null,
  selectedNodeId: null,
  validationErrors: [],
  status: "idle",
  error: null,
};

/**
 * Async thunk to load algorithm library
 */
export const loadAlgorithmLibrary = createAsyncThunk(
  "orchestration/loadAlgorithmLibrary",
  async () => {
    const { algorithms } = await import("@/config/algorithms");
    return algorithms;
  },
);

/**
 * Async thunk to load workflow templates
 */
export const loadTemplates = createAsyncThunk(
  "orchestration/loadTemplates",
  async () => {
    const { templates } = await import("@/config/workflows");
    return templates;
  },
);

/**
 * Async thunk to execute workflow
 */
export const executeWorkflow = createAsyncThunk(
  "orchestration/executeWorkflow",
  async (_, { getState }) => {
    console.log("🚀 [executeWorkflow] Starting workflow execution");
    const state = getState() as { orchestration: OrchestrationState };
    const { currentWorkflow, algorithmLibrary } = state.orchestration;

    if (!currentWorkflow) {
      throw new Error("No workflow to execute");
    }

    console.log("📊 [executeWorkflow] Workflow:", {
      id: currentWorkflow.id,
      name: currentWorkflow.name,
      nodes: currentWorkflow.nodes.length,
      edges: currentWorkflow.edges.length,
    });

    // Import execution utilities
    const { executeWorkflowEngine } = await import(
      "@/pages/Orchestration/utils/workflowExecutor"
    );

    // Execute the workflow
    const results = await executeWorkflowEngine(
      currentWorkflow,
      algorithmLibrary,
    );

    console.log("✅ [executeWorkflow] Execution completed, results:", results);
    return results;
  },
);

/**
 * Orchestration slice
 */
export const orchestrationSlice = createSlice({
  name: "orchestration",
  initialState,
  reducers: {
    // Create a new workflow
    createNewWorkflow: (state, action: PayloadAction<{ name: string }>) => {
      const newWorkflow: Workflow = {
        id: `workflow-${Date.now()}`,
        name: action.payload.name,
        description: "",
        nodes: [],
        edges: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.currentWorkflow = newWorkflow;
      state.selectedNodeId = null;
      state.validationErrors = [];
      state.executionResults = {};
      state.executionStatus = "idle";
    },

    // Load a workflow
    loadWorkflow: (state, action: PayloadAction<string>) => {
      const workflow = state.savedWorkflows.find(
        (w) => w.id === action.payload,
      );
      if (workflow) {
        state.currentWorkflow = workflow;
        state.selectedNodeId = null;
        state.validationErrors = [];
        state.executionResults = {};
        state.executionStatus = "idle";
      }
    },

    // Save current workflow
    saveWorkflow: (state) => {
      if (!state.currentWorkflow) return;

      state.currentWorkflow.updatedAt = new Date().toISOString();

      const existingIndex = state.savedWorkflows.findIndex(
        (w) => w.id === state.currentWorkflow!.id,
      );

      if (existingIndex >= 0) {
        state.savedWorkflows[existingIndex] = state.currentWorkflow;
      } else {
        state.savedWorkflows.push(state.currentWorkflow);
      }

      // Persist to localStorage
      try {
        localStorage.setItem(
          "gradmind-workflows",
          JSON.stringify(state.savedWorkflows),
        );
      } catch (error) {
        console.error("Failed to save workflows to localStorage:", error);
      }
    },

    // Delete a workflow
    deleteWorkflow: (state, action: PayloadAction<string>) => {
      state.savedWorkflows = state.savedWorkflows.filter(
        (w) => w.id !== action.payload,
      );

      // Persist to localStorage
      try {
        localStorage.setItem(
          "gradmind-workflows",
          JSON.stringify(state.savedWorkflows),
        );
      } catch (error) {
        console.error("Failed to save workflows to localStorage:", error);
      }

      // If deleted workflow was current, clear it
      if (state.currentWorkflow?.id === action.payload) {
        state.currentWorkflow = null;
      }
    },

    // Load workflows from localStorage
    loadSavedWorkflows: (state) => {
      try {
        const saved = localStorage.getItem("gradmind-workflows");
        if (saved) {
          state.savedWorkflows = JSON.parse(saved);
        }
      } catch (error) {
        console.error("Failed to load workflows from localStorage:", error);
      }
    },

    // Add a node to the workflow
    addNode: (
      state,
      action: PayloadAction<{
        algorithmKey: string;
        position: { x: number; y: number };
      }>,
    ) => {
      if (!state.currentWorkflow) return;

      const algorithm = state.algorithmLibrary.find(
        (a) => a.key === action.payload.algorithmKey,
      );
      if (!algorithm) return;

      const newNode: WorkflowNode = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "algorithm",
        position: action.payload.position,
        data: {
          algorithmKey: algorithm.key,
          label: algorithm.name,
          parameters: {},
          status: "idle",
        },
      };

      state.currentWorkflow.nodes.push(newNode);
      state.currentWorkflow.updatedAt = new Date().toISOString();
    },

    // Add a dataset node to the workflow
    addDatasetNode: (
      state,
      action: PayloadAction<{
        position: { x: number; y: number };
        datasetData: any;
        label?: string;
      }>,
    ) => {
      if (!state.currentWorkflow) return;

      const newNode: WorkflowNode = {
        id: `dataset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "dataset",
        position: action.payload.position,
        data: {
          label: action.payload.label || "Dataset",
          datasetData: action.payload.datasetData,
          status: "idle",
        },
      };

      state.currentWorkflow.nodes.push(newNode);
      state.currentWorkflow.updatedAt = new Date().toISOString();
    },

    // Add an oscilloscope node to the workflow
    addOscilloscopeNode: (
      state,
      action: PayloadAction<{ position: { x: number; y: number }; label?: string }>,
    ) => {
      if (!state.currentWorkflow) return;

      const newNode: WorkflowNode = {
        id: `osc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "oscilloscope",
        position: action.payload.position,
        data: {
          label: action.payload.label || "示波器",
          status: "idle",
        },
      };

      state.currentWorkflow.nodes.push(newNode);
      state.currentWorkflow.updatedAt = new Date().toISOString();
    },

    // Remove a node from the workflow
    removeNode: (state, action: PayloadAction<string>) => {
      if (!state.currentWorkflow) return;

      const nodeId = action.payload;

      // Remove the node
      state.currentWorkflow.nodes = state.currentWorkflow.nodes.filter(
        (n) => n.id !== nodeId,
      );

      // Remove connected edges
      state.currentWorkflow.edges = state.currentWorkflow.edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      );

      // Clear selection if deleted node was selected
      if (state.selectedNodeId === nodeId) {
        state.selectedNodeId = null;
      }

      state.currentWorkflow.updatedAt = new Date().toISOString();
    },

    // Update node position
    updateNodePosition: (
      state,
      action: PayloadAction<{ nodeId: string; position: { x: number; y: number } }>,
    ) => {
      if (!state.currentWorkflow) return;

      const node = state.currentWorkflow.nodes.find(
        (n) => n.id === action.payload.nodeId,
      );
      if (node) {
        node.position = action.payload.position;
        state.currentWorkflow.updatedAt = new Date().toISOString();
      }
    },

    // Update node parameters
    updateNodeParameters: (
      state,
      action: PayloadAction<{ nodeId: string; parameters: ParameterValues }>,
    ) => {
      if (!state.currentWorkflow) return;

      const node = state.currentWorkflow.nodes.find(
        (n) => n.id === action.payload.nodeId,
      );
      if (node) {
        node.data.parameters = action.payload.parameters;
        state.currentWorkflow.updatedAt = new Date().toISOString();
      }
    },

    // Add an edge to the workflow
    addEdge: (state, action: PayloadAction<WorkflowEdge>) => {
      if (!state.currentWorkflow) return;

      // Check if edge already exists
      const exists = state.currentWorkflow.edges.some(
        (e) =>
          e.source === action.payload.source &&
          e.target === action.payload.target &&
          e.sourceHandle === action.payload.sourceHandle &&
          e.targetHandle === action.payload.targetHandle,
      );

      if (!exists) {
        state.currentWorkflow.edges.push(action.payload);
        state.currentWorkflow.updatedAt = new Date().toISOString();
      }
    },

    // Remove an edge from the workflow
    removeEdge: (state, action: PayloadAction<string>) => {
      if (!state.currentWorkflow) return;

      state.currentWorkflow.edges = state.currentWorkflow.edges.filter(
        (e) => e.id !== action.payload,
      );
      state.currentWorkflow.updatedAt = new Date().toISOString();
    },

    // Set selected node
    setSelectedNode: (state, action: PayloadAction<string | null>) => {
      state.selectedNodeId = action.payload;
    },

    // Set validation errors
    setValidationErrors: (state, action: PayloadAction<ValidationError[]>) => {
      state.validationErrors = action.payload;
    },

    // Reset execution state
    resetExecution: (state) => {
      state.executionStatus = "idle";
      state.executionResults = {};
      state.executionOrder = [];
      state.currentExecutingNodeId = null;

      // Reset node statuses
      if (state.currentWorkflow) {
        state.currentWorkflow.nodes.forEach((node) => {
          node.data.status = "idle";
          node.data.error = undefined;
        });
      }
    },

    // Update node status during execution
    updateNodeStatus: (
      state,
      action: PayloadAction<{ nodeId: string; status: "idle" | "running" | "success" | "error"; error?: string }>,
    ) => {
      if (!state.currentWorkflow) return;

      const node = state.currentWorkflow.nodes.find(
        (n) => n.id === action.payload.nodeId,
      );
      if (node) {
        node.data.status = action.payload.status;
        if (action.payload.error) {
          node.data.error = action.payload.error;
        }
      }
    },

    // Load a template
    loadTemplate: (state, action: PayloadAction<string>) => {
      const template = state.templates.find((t) => t.id === action.payload);
      if (template) {
        // Create a new workflow from the template
        const newWorkflow: Workflow = {
          ...template,
          id: `workflow-${Date.now()}`,
          name: `${template.name} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.currentWorkflow = newWorkflow;
        state.selectedNodeId = null;
        state.validationErrors = [];
        state.executionResults = {};
        state.executionStatus = "idle";
      }
    },

    // Update workflow metadata (name, description)
    updateWorkflowMetadata: (
      state,
      action: PayloadAction<{ name?: string; description?: string }>
    ) => {
      if (!state.currentWorkflow) return;

      if (action.payload.name !== undefined) {
        state.currentWorkflow.name = action.payload.name;
      }
      if (action.payload.description !== undefined) {
        state.currentWorkflow.description = action.payload.description;
      }
      state.currentWorkflow.updatedAt = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    // Load algorithm library
    builder
      .addCase(loadAlgorithmLibrary.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadAlgorithmLibrary.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.algorithmLibrary = action.payload;
      })
      .addCase(loadAlgorithmLibrary.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load algorithm library";
      });

    // Load templates
    builder
      .addCase(loadTemplates.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadTemplates.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.templates = action.payload;
      })
      .addCase(loadTemplates.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load templates";
      });

    // Execute workflow
    builder
      .addCase(executeWorkflow.pending, (state) => {
        console.log("⏳ [Redux] executeWorkflow.pending");
        state.executionStatus = "running";
        state.executionResults = {};
      })
      .addCase(executeWorkflow.fulfilled, (state, action) => {
        console.log("✅ [Redux] executeWorkflow.fulfilled, payload:", action.payload);
        state.executionStatus = "completed";
        state.executionResults = action.payload;

        // Update node results
        if (state.currentWorkflow) {
          state.currentWorkflow.nodes.forEach((node) => {
            if (action.payload[node.id]) {
              console.log(`📝 [Redux] Updating node ${node.id} with result:`, action.payload[node.id]);
              node.data.result = action.payload[node.id];
              node.data.status = "success";
            }
          });
        }
        console.log("🔄 [Redux] State after update:", {
          executionStatus: state.executionStatus,
          executionResults: state.executionResults,
          nodeStatuses: state.currentWorkflow?.nodes.map(n => ({ id: n.id, status: n.data.status })),
        });
      })
      .addCase(executeWorkflow.rejected, (state, action) => {
        console.error("❌ [Redux] executeWorkflow.rejected:", action.error);
        state.executionStatus = "error";
        state.error = action.error.message || "Workflow execution failed";
      });
  },
});

export const {
  createNewWorkflow,
  loadWorkflow,
  saveWorkflow,
  deleteWorkflow,
  loadSavedWorkflows,
  addNode,
  addDatasetNode,
  addOscilloscopeNode,
  removeNode,
  updateNodePosition,
  updateNodeParameters,
  addEdge,
  removeEdge,
  setSelectedNode,
  setValidationErrors,
  resetExecution,
  updateNodeStatus,
  loadTemplate,
  updateWorkflowMetadata,
} = orchestrationSlice.actions;

export default orchestrationSlice.reducer;
