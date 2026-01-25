import type { Workflow } from "@/types/workflow";

/**
 * Performs topological sort on workflow nodes
 * Returns nodes in execution order (dependencies first)
 */
export function topologicalSort(workflow: Workflow): string[] {
  const inDegree = new Map<string, number>();
  const adjacencyList = new Map<string, string[]>();

  // Initialize
  workflow.nodes.forEach((node) => {
    inDegree.set(node.id, 0);
    adjacencyList.set(node.id, []);
  });

  // Build graph
  workflow.edges.forEach((edge) => {
    const currentDegree = inDegree.get(edge.target) || 0;
    inDegree.set(edge.target, currentDegree + 1);

    const neighbors = adjacencyList.get(edge.source) || [];
    neighbors.push(edge.target);
    adjacencyList.set(edge.source, neighbors);
  });

  // Kahn's algorithm
  const queue: string[] = [];
  const result: string[] = [];

  // Add nodes with no dependencies
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) {
      queue.push(nodeId);
    }
  });

  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);

    const neighbors = adjacencyList.get(current) || [];
    neighbors.forEach((neighbor) => {
      const newDegree = (inDegree.get(neighbor) || 0) - 1;
      inDegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        queue.push(neighbor);
      }
    });
  }

  // If result doesn't contain all nodes, there's a cycle
  if (result.length !== workflow.nodes.length) {
    throw new Error("Workflow contains a cycle");
  }

  return result;
}
