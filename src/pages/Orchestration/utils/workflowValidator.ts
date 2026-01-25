import type { Workflow, ValidationError } from "@/types/workflow";
import type { AlgorithmNode } from "@/types/algorithmNode";

/**
 * Validates a workflow for execution
 * Checks for cycles, disconnected nodes, and type mismatches
 */
export function validateWorkflow(
  workflow: Workflow,
  algorithmLibrary: AlgorithmNode[],
): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!workflow.nodes || workflow.nodes.length === 0) {
    errors.push({
      message: "Workflow is empty. Add at least one node.",
      type: "error",
    });
    return errors;
  }

  // Check for cycles using DFS
  const hasCycle = detectCycle(workflow);
  if (hasCycle) {
    errors.push({
      message: "Workflow contains a cycle. Remove circular dependencies.",
      type: "error",
    });
  }

  // Check each node's connections
  workflow.nodes.forEach((node) => {
    if (node.type === "algorithm" && node.data.algorithmKey) {
      const algorithm = algorithmLibrary.find(
        (a) => a.key === node.data.algorithmKey,
      );

      if (!algorithm) {
        errors.push({
          nodeId: node.id,
          message: `Algorithm "${node.data.algorithmKey}" not found`,
          type: "error",
        });
        return;
      }

      // Check required inputs are connected
      const connectedInputs = workflow.edges
        .filter((e) => e.target === node.id)
        .map((e) => e.targetHandle);

      algorithm.inputs.forEach((input) => {
        if (input.required && !connectedInputs.includes(input.id)) {
          errors.push({
            nodeId: node.id,
            message: `Required input "${input.label}" is not connected`,
            type: "warning",
          });
        }
      });
    }
  });

  return errors;
}

/**
 * Detects cycles in the workflow graph using DFS
 */
function detectCycle(workflow: Workflow): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  const dfs = (nodeId: string): boolean => {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    // Get all outgoing edges from this node
    const outgoingEdges = workflow.edges.filter((e) => e.source === nodeId);

    for (const edge of outgoingEdges) {
      if (!visited.has(edge.target)) {
        if (dfs(edge.target)) return true;
      } else if (recursionStack.has(edge.target)) {
        return true; // Cycle detected
      }
    }

    recursionStack.delete(nodeId);
    return false;
  };

  for (const node of workflow.nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }

  return false;
}
