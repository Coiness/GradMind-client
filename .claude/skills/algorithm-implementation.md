# Algorithm Implementation Guide

## Overview
This guide explains how to implement new algorithm modules for the GradMind workflow builder.

## Algorithm Structure

Every algorithm must implement the `AlgorithmNode` interface:

```typescript
interface AlgorithmNode {
  key: string;                    // Unique identifier
  name: string;                   // Display name
  category: AlgorithmCategory;    // Category for organization
  description: string;            // What the algorithm does
  icon?: string;                  // Optional emoji or icon
  inputs: AlgorithmInput[];       // Input ports
  outputs: AlgorithmOutput[];     // Output ports
  parameters: ParameterConfig[];  // Configurable parameters
  compute: (inputs, params) => Promise<any>;  // Computation function
}
```

## Step-by-Step Implementation

### 1. Choose a Category
```typescript
type AlgorithmCategory =
  | "data-reduction"
  | "analytical-optimization"
  | "numerical-optimization"
  | "parameter-estimation";
```

### 2. Define Inputs and Outputs
```typescript
inputs: [
  {
    id: "matrix",              // Unique ID for this input
    label: "Input Matrix",     // Display label
    dataType: "matrix",        // Data type
    required: true,            // Is this input required?
  },
  {
    id: "vector",
    label: "Initial Vector",
    dataType: "vector",
    required: false,
  },
],

outputs: [
  {
    id: "result",
    label: "Optimized Result",
    dataType: "vector",
  },
  {
    id: "convergence",
    label: "Convergence History",
    dataType: "matrix",
  },
],
```

**Available Data Types:**
- `matrix`: 2D array of numbers
- `vector`: 1D array of numbers
- `scalar`: Single number
- `function`: Mathematical function
- `model`: Trained model object
- `dataset`: Raw dataset

### 3. Define Parameters
```typescript
parameters: [
  // Slider parameter
  {
    key: "learningRate",
    label: "Learning Rate",
    type: "slider",
    defaultValue: 0.01,
    options: {
      min: 0.0001,
      max: 1,
      step: 0.001,
    },
  },

  // Number input
  {
    key: "tolerance",
    label: "Tolerance",
    type: "number",
    defaultValue: 1e-6,
    options: {
      min: 1e-10,
      max: 1e-2,
      step: 1e-7,
    },
  },

  // Select dropdown
  {
    key: "method",
    label: "Optimization Method",
    type: "select",
    defaultValue: "adam",
    options: {
      items: [
        { label: "Adam", value: "adam" },
        { label: "SGD", value: "sgd" },
        { label: "RMSprop", value: "rmsprop" },
      ],
    },
  },
],
```

### 4. Implement Compute Function
```typescript
compute: async (inputs, params) => {
  // 1. Extract inputs
  const matrix = inputs.matrix;
  const initialPoint = inputs.initialPoint || [0, 0];

  // 2. Extract parameters
  const learningRate = Number(params.learningRate) || 0.01;
  const maxIterations = Number(params.maxIterations) || 100;

  // 3. Perform computation
  // For MVP, use mock data
  await new Promise((resolve) => setTimeout(resolve, 500));

  const result = performOptimization(matrix, initialPoint, learningRate);

  // 4. Return results
  return {
    // Output values (match output IDs)
    result: result.optimizedPoint,
    convergence: result.history,

    // Optional: visualization data
    visualization: {
      type: "convergence",  // chart type
      data: {
        history: result.history,
        finalValue: result.optimizedPoint,
      },
    },
  };
},
```

## Complete Example

```typescript
// src/config/algorithms/numericalOptimization/newtonMethod.ts
import type { AlgorithmNode } from "@/types/algorithmNode";

export const newtonMethodAlgorithm: AlgorithmNode = {
  key: "newton-method",
  name: "Newton's Method",
  category: "numerical-optimization",
  description:
    "Second-order optimization using Newton's method with Hessian matrix",
  icon: "🎯",

  inputs: [
    {
      id: "function",
      label: "Objective Function",
      dataType: "function",
      required: true,
    },
    {
      id: "gradient",
      label: "Gradient Function",
      dataType: "function",
      required: false,
    },
    {
      id: "hessian",
      label: "Hessian Matrix",
      dataType: "matrix",
      required: false,
    },
    {
      id: "initialPoint",
      label: "Initial Point",
      dataType: "vector",
      required: true,
    },
  ],

  outputs: [
    {
      id: "solution",
      label: "Optimal Point",
      dataType: "vector",
    },
    {
      id: "objectiveValue",
      label: "Final Objective Value",
      dataType: "scalar",
    },
    {
      id: "history",
      label: "Convergence History",
      dataType: "matrix",
    },
  ],

  parameters: [
    {
      key: "maxIterations",
      label: "Max Iterations",
      type: "slider",
      defaultValue: 50,
      options: {
        min: 10,
        max: 500,
        step: 10,
      },
    },
    {
      key: "tolerance",
      label: "Convergence Tolerance",
      type: "number",
      defaultValue: 1e-6,
      options: {
        min: 1e-10,
        max: 1e-2,
        step: 1e-7,
      },
    },
    {
      key: "lineSearch",
      label: "Line Search Method",
      type: "select",
      defaultValue: "backtracking",
      options: {
        items: [
          { label: "Backtracking", value: "backtracking" },
          { label: "Exact", value: "exact" },
          { label: "None", value: "none" },
        ],
      },
    },
  ],

  compute: async (inputs, params) => {
    const initialPoint = inputs.initialPoint || [0, 0];
    const maxIterations = Number(params.maxIterations) || 50;
    const tolerance = Number(params.tolerance) || 1e-6;

    // Simulate Newton's method
    await new Promise((resolve) => setTimeout(resolve, 700));

    const history = [];
    let point = [...initialPoint];

    for (let i = 0; i < Math.min(maxIterations, 30); i++) {
      const objectiveValue = point.reduce(
        (sum: number, x: number) => sum + x * x,
        0
      );
      history.push([...point, objectiveValue]);

      // Newton step (simplified)
      point = point.map((x: number) => x * 0.5);

      if (Math.abs(objectiveValue) < tolerance) break;
    }

    const solution = point;
    const objectiveValue = solution.reduce(
      (sum: number, x: number) => sum + x * x,
      0
    );

    return {
      solution,
      objectiveValue,
      history,
      visualization: {
        type: "convergence",
        data: {
          history,
          solution,
          iterations: history.length,
          method: "Newton",
        },
      },
    };
  },
};
```

### 5. Register the Algorithm
Add to `src/config/algorithms/index.ts`:
```typescript
import { newtonMethodAlgorithm } from "./numericalOptimization/newtonMethod";

export const algorithms: AlgorithmNode[] = [
  // ... existing algorithms
  newtonMethodAlgorithm,
];
```

## Testing Your Algorithm

### 1. Unit Test the Compute Function
```typescript
import { newtonMethodAlgorithm } from "./newtonMethod";

test("Newton method converges", async () => {
  const result = await newtonMethodAlgorithm.compute(
    { initialPoint: [5, 5] },
    { maxIterations: 100, tolerance: 1e-6 }
  );

  expect(result.solution).toBeDefined();
  expect(result.objectiveValue).toBeLessThan(0.01);
});
```

### 2. Test in the UI
1. Start the dev server: `npm run dev`
2. Navigate to `/orchestration`
3. Drag your algorithm onto the canvas
4. Connect it to other nodes
5. Check parameter panel works
6. Execute the workflow

## Best Practices

### 1. Input Validation
```typescript
compute: async (inputs, params) => {
  // Validate required inputs
  if (!inputs.matrix) {
    throw new Error("Input matrix is required");
  }

  // Validate parameter ranges
  const lr = Number(params.learningRate);
  if (lr <= 0 || lr > 1) {
    throw new Error("Learning rate must be between 0 and 1");
  }

  // ... rest of computation
},
```

### 2. Error Handling
```typescript
compute: async (inputs, params) => {
  try {
    const result = performComputation(inputs, params);
    return result;
  } catch (error) {
    console.error("Algorithm error:", error);
    throw new Error(`Computation failed: ${error.message}`);
  }
},
```

### 3. Progress Reporting (Future)
```typescript
compute: async (inputs, params, onProgress) => {
  for (let i = 0; i < maxIterations; i++) {
    // Perform iteration
    const result = iterate();

    // Report progress (if callback provided)
    if (onProgress) {
      onProgress({
        iteration: i,
        total: maxIterations,
        currentValue: result.value,
      });
    }
  }
},
```

### 4. Visualization Data
Return structured data for visualization:
```typescript
return {
  // Algorithm outputs
  solution: optimizedPoint,

  // Visualization data
  visualization: {
    type: "convergence",  // or "scatter", "heatmap", "line", etc.
    data: {
      // Data specific to visualization type
      history: convergenceHistory,
      labels: ["Iteration", "Objective Value"],
    },
  },
};
```

## Common Patterns

### Iterative Algorithms
```typescript
compute: async (inputs, params) => {
  let state = initializeState(inputs);
  const history = [];

  for (let iter = 0; iter < maxIterations; iter++) {
    state = updateState(state, params);
    history.push(state.value);

    if (hasConverged(state, tolerance)) break;
  }

  return { solution: state.point, history };
},
```

### Matrix Operations
```typescript
// For MVP, use simple JavaScript
function matrixMultiply(A: number[][], B: number[][]): number[][] {
  // Implementation
}

// For production, use a library like math.js
import { multiply } from "mathjs";
const result = multiply(A, B);
```

### Async Operations
```typescript
compute: async (inputs, params) => {
  // Simulate async computation
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Or call an API
  const response = await fetch("/api/compute", {
    method: "POST",
    body: JSON.stringify({ inputs, params }),
  });

  return await response.json();
},
```

## Troubleshooting

### Algorithm not appearing in library
- Check it's exported in `src/config/algorithms/index.ts`
- Verify the category matches one of the 4 valid categories
- Check for TypeScript errors

### Connections not working
- Ensure input/output IDs are unique
- Verify data types are compatible
- Check required inputs are marked correctly

### Compute function errors
- Add try-catch blocks
- Log inputs and params for debugging
- Test with mock data first
- Check async/await usage

## Resources
- Type definitions: `src/types/algorithmNode.ts`
- Existing algorithms: `src/config/algorithms/`
- Parameter types: `src/types/parameterConfig.ts`
