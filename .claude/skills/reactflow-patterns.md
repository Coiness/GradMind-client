# ReactFlow Integration Patterns

## Overview
ReactFlow is used for the visual workflow canvas. This guide covers common patterns and best practices.

## Basic Setup

### 1. ReactFlow Provider
Always wrap your canvas in `ReactFlowProvider`:
```typescript
import { ReactFlowProvider } from "reactflow";

export const WorkflowCanvasWithProvider = () => {
  return (
    <ReactFlowProvider>
      <WorkflowCanvas />
    </ReactFlowProvider>
  );
};
```

### 2. Custom Node Types
Define custom node components:
```typescript
import { memo } from "react";
import type { NodeProps } from "reactflow";
import { Handle, Position } from "reactflow";

export const CustomNode = memo(({ data, selected }: NodeProps) => {
  return (
    <div className={selected ? "selected" : ""}>
      <Handle type="target" position={Position.Left} id="input" />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Right} id="output" />
    </div>
  );
});
```

Register node types:
```typescript
const nodeTypes = {
  algorithm: AlgorithmNode,
  dataset: DatasetNode,
};

<ReactFlow nodeTypes={nodeTypes} ... />
```

### 3. State Management with Redux
Sync ReactFlow state with Redux:
```typescript
const [nodes, setNodes, onNodesChange] = useNodesState([]);
const [edges, setEdges, onEdgesChange] = useEdgesState([]);

// Sync with Redux
useEffect(() => {
  if (currentWorkflow) {
    setNodes(currentWorkflow.nodes);
    setEdges(currentWorkflow.edges);
  }
}, [currentWorkflow]);
```

## Common Patterns

### Drag and Drop from External Source
```typescript
const onDrop = useCallback((event: DragEvent) => {
  event.preventDefault();

  const algorithmKey = event.dataTransfer.getData("algorithmKey");
  const reactFlowBounds = wrapperRef.current.getBoundingClientRect();

  const position = {
    x: event.clientX - reactFlowBounds.left,
    y: event.clientY - reactFlowBounds.top,
  };

  dispatch(addNode({ algorithmKey, position }));
}, [dispatch]);

const onDragOver = useCallback((event: DragEvent) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
}, []);

<div ref={wrapperRef} onDrop={onDrop} onDragOver={onDragOver}>
  <ReactFlow ... />
</div>
```

### Multiple Handles per Node
```typescript
// Input handles
{algorithm.inputs.map((input, index) => (
  <Handle
    key={input.id}
    type="target"
    position={Position.Left}
    id={input.id}
    style={{
      top: `${((index + 1) * 100) / (algorithm.inputs.length + 1)}%`,
    }}
  />
))}

// Output handles
{algorithm.outputs.map((output, index) => (
  <Handle
    key={output.id}
    type="source"
    position={Position.Right}
    id={output.id}
    style={{
      top: `${((index + 1) * 100) / (algorithm.outputs.length + 1)}%`,
    }}
  />
))}
```

### Connection Validation
```typescript
const isValidConnection = useCallback((connection: Connection) => {
  // Get source and target nodes
  const sourceNode = nodes.find(n => n.id === connection.source);
  const targetNode = nodes.find(n => n.id === connection.target);

  // Validate data types match
  const sourceOutput = getOutputType(sourceNode, connection.sourceHandle);
  const targetInput = getInputType(targetNode, connection.targetHandle);

  return sourceOutput === targetInput;
}, [nodes]);

<ReactFlow isValidConnection={isValidConnection} ... />
```

### Node Selection
```typescript
const onNodeClick = useCallback(
  (_event: React.MouseEvent, node: Node) => {
    dispatch(setSelectedNode(node.id));
  },
  [dispatch]
);

const onPaneClick = useCallback(() => {
  dispatch(setSelectedNode(null));
}, [dispatch]);

<ReactFlow
  onNodeClick={onNodeClick}
  onPaneClick={onPaneClick}
  ...
/>
```

### Node Deletion
```typescript
const onNodesDelete = useCallback(
  (deleted: Node[]) => {
    deleted.forEach((node) => {
      dispatch(removeNode(node.id));
    });
  },
  [dispatch]
);

<ReactFlow onNodesDelete={onNodesDelete} ... />
```

## Styling

### Custom Node Styles
```css
.algorithmNode {
  position: relative;
  min-width: 200px;
}

.algorithmNode.selected .card {
  box-shadow: 0 0 0 2px #1890ff;
}

.handle {
  width: 10px;
  height: 10px;
  border: 2px solid #fff;
}
```

### Edge Styles
```typescript
const edgeOptions = {
  animated: true,
  style: { stroke: '#1890ff', strokeWidth: 2 },
};

<ReactFlow defaultEdgeOptions={edgeOptions} ... />
```

## Performance Optimization

### 1. Memo Custom Nodes
Always wrap custom nodes in `memo`:
```typescript
export const AlgorithmNode = memo(({ data, selected }: NodeProps) => {
  // ...
});
```

### 2. Use Node Internals
For large workflows, use `useStore` to access only needed data:
```typescript
import { useStore } from "reactflow";

const selectedNode = useStore((state) =>
  state.nodes.find(n => n.id === selectedNodeId)
);
```

### 3. Lazy Load Node Content
```typescript
const NodeContent = lazy(() => import("./NodeContent"));

export const AlgorithmNode = memo(({ data }: NodeProps) => {
  return (
    <Suspense fallback={<Spinner />}>
      <NodeContent data={data} />
    </Suspense>
  );
});
```

## Common Issues

### Issue: Nodes not updating
**Solution**: Ensure you're using `setNodes` from `useNodesState`:
```typescript
const [nodes, setNodes, onNodesChange] = useNodesState([]);

// Update nodes
setNodes((nds) =>
  nds.map((node) =>
    node.id === nodeId
      ? { ...node, data: { ...node.data, status: "success" } }
      : node
  )
);
```

### Issue: Drag and drop not working
**Solution**: Check `onDragOver` prevents default:
```typescript
const onDragOver = useCallback((event: DragEvent) => {
  event.preventDefault(); // Required!
  event.dataTransfer.dropEffect = "copy";
}, []);
```

### Issue: Handles not connecting
**Solution**: Ensure handle IDs are unique and match edge handles:
```typescript
<Handle id="unique-input-id" type="target" ... />

// Edge must reference the same ID
edge.targetHandle === "unique-input-id"
```

## Resources
- [ReactFlow Documentation](https://reactflow.dev/)
- [ReactFlow Examples](https://reactflow.dev/examples)
- [Custom Nodes Guide](https://reactflow.dev/learn/customization/custom-nodes)
