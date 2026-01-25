# Workflow Builder Architecture

## Overview
The GradMind Workflow Builder is a drag-and-drop visual programming interface for constructing mathematical algorithm pipelines. It uses ReactFlow for the canvas and Redux Toolkit for state management.

## Key Components

### 1. Algorithm Library (`src/config/algorithms/`)
- **Location**: `src/config/algorithms/index.ts`
- **Purpose**: Defines all 12 available algorithm modules
- **Categories**:
  - Data Reduction: SVD, PCA
  - Analytical Optimization: Gradient, Hessian, Lagrange, Least Squares
  - Numerical Optimization: GD, Mini-batch GD, Advanced Optimizer, Neural Network
  - Parameter Estimation: MLE, MAP

**Adding a new algorithm:**
```typescript
// src/config/algorithms/yourCategory/yourAlgorithm.ts
import type { AlgorithmNode } from "@/types/algorithmNode";

export const yourAlgorithm: AlgorithmNode = {
  key: "your-algorithm",
  name: "Your Algorithm Name",
  category: "numerical-optimization",
  description: "What your algorithm does",
  icon: "🔧",

  inputs: [
    {
      id: "input1",
      label: "Input Label",
      dataType: "matrix",
      required: true,
    },
  ],

  outputs: [
    {
      id: "output1",
      label: "Output Label",
      dataType: "vector",
    },
  ],

  parameters: [
    {
      key: "param1",
      label: "Parameter 1",
      type: "slider",
      defaultValue: 10,
      options: { min: 1, max: 100, step: 1 },
    },
  ],

  compute: async (inputs, params) => {
    // Your computation logic here
    return {
      output1: result,
      visualization: {
        type: "chart",
        data: chartData,
      },
    };
  },
};
```

Then register it in `src/config/algorithms/index.ts`:
```typescript
import { yourAlgorithm } from "./yourCategory/yourAlgorithm";

export const algorithms: AlgorithmNode[] = [
  // ... existing algorithms
  yourAlgorithm,
];
```

### 2. Redux State (`src/store/features/orchestrationSlice.ts`)

**Key State:**
- `algorithmLibrary`: All available algorithms
- `currentWorkflow`: The workflow being edited
- `savedWorkflows`: Workflows saved to localStorage
- `templates`: Pre-built workflow templates
- `executionStatus`: Current execution state
- `executionResults`: Results from each node

**Key Actions:**
- `createNewWorkflow()`: Create a new empty workflow
- `addNode()`: Add an algorithm node to the canvas
- `addEdge()`: Connect two nodes
- `executeWorkflow()`: Run the workflow
- `saveWorkflow()`: Save to localStorage
- `loadTemplate()`: Load a pre-built template

### 3. UI Components

**AlgorithmLibrary** (`src/pages/Orchestration/components/AlgorithmLibrary/`)
- Left panel showing draggable algorithm cards
- Organized by category with search functionality
- Drag-and-drop to canvas

**WorkflowCanvas** (`src/pages/Orchestration/components/WorkflowCanvas/`)
- ReactFlow-based canvas for building workflows
- Custom node types: `AlgorithmNode`, `DatasetNode`
- Handles node connections with type validation

**NodeInspector** (Placeholder in main page)
- Right panel for viewing/editing selected node
- Shows algorithm details and parameters
- Displays execution results

### 4. Execution Engine (`src/pages/Orchestration/utils/`)

**workflowValidator.ts**
- Validates workflow before execution
- Checks for cycles, disconnected nodes, type mismatches

**topologicalSort.ts**
- Determines execution order using Kahn's algorithm
- Ensures dependencies are executed first

**workflowExecutor.ts**
- Executes nodes in topological order
- Passes outputs to connected inputs
- Handles errors gracefully

## Workflow Data Model

```typescript
interface Workflow {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: string;
  updatedAt: string;
}

interface WorkflowNode {
  id: string;
  type: "algorithm" | "dataset";
  position: { x: number; y: number };
  data: {
    algorithmKey?: string;
    label: string;
    parameters?: ParameterValues;
    result?: any;
    status?: "idle" | "running" | "success" | "error";
    error?: string;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  animated?: boolean;
}
```

## Common Tasks

### Creating a Workflow Template
Edit `src/config/workflows/index.ts`:
```typescript
{
  id: "template-my-workflow",
  name: "My Workflow",
  description: "Description of what it does",
  nodes: [
    {
      id: "node-1",
      type: "algorithm",
      position: { x: 100, y: 200 },
      data: {
        algorithmKey: "gradient-descent",
        label: "Gradient Descent",
        parameters: { learningRate: 0.01 },
        status: "idle",
      },
    },
  ],
  edges: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}
```

### Debugging Workflow Execution
1. Check Redux DevTools for state changes
2. Look at browser console for execution logs
3. Validate workflow structure using `validateWorkflow()`
4. Check node status in `currentWorkflow.nodes[].data.status`

## File Structure
```
src/
├── config/
│   ├── algorithms/          # Algorithm definitions
│   │   ├── dataReduction/
│   │   ├── analyticalOptimization/
│   │   ├── numericalOptimization/
│   │   └── parameterEstimation/
│   └── workflows/           # Workflow templates
├── pages/
│   └── Orchestration/
│       ├── components/
│       │   ├── AlgorithmLibrary/
│       │   └── WorkflowCanvas/
│       └── utils/           # Execution engine
├── store/
│   └── features/
│       └── orchestrationSlice.ts
└── types/
    ├── algorithmNode.ts
    └── workflow.ts
```

## Best Practices
1. Always validate workflows before execution
2. Use mock data for algorithm compute functions during development
3. Keep algorithm compute functions async for future API integration
4. Store workflows in localStorage for persistence
5. Use TypeScript types for type safety
6. Follow existing naming conventions for consistency
