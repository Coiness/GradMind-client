import type { Workflow } from "@/types/workflow";
import type { AlgorithmNode } from "@/types/algorithmNode";
import { topologicalSort } from "./topologicalSort";
import { validateWorkflow } from "./workflowValidator";

/**
 * Executes a workflow and returns results for each node
 */
export async function executeWorkflowEngine(
  workflow: Workflow,
  algorithmLibrary: AlgorithmNode[],
): Promise<Record<string, any>> {
  // Validate workflow first
  const errors = validateWorkflow(workflow, algorithmLibrary);
  const criticalErrors = errors.filter((e) => e.type === "error");

  if (criticalErrors.length > 0) {
    throw new Error(
      `Workflow validation failed: ${criticalErrors.map((e) => e.message).join(", ")}`,
    );
  }

  // Get execution order
  const executionOrder = topologicalSort(workflow);

  // Store results for each node
  const results: Record<string, any> = {};

  // Execute nodes in order
  for (const nodeId of executionOrder) {
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    if (node.type === "dataset") {
      // Use real dataset data if available, otherwise use mock data
      if (node.data.datasetData) {
        results[nodeId] = {
          data: node.data.datasetData.data,
          type: "dataset",
          metadata: node.data.datasetData.metadata,
        };
      } else {
        // Fallback to mock data
        results[nodeId] = {
          data: [[1, 2], [3, 4], [5, 6]],
          type: "dataset",
        };
      }
      continue;
    }

    if (node.type === "algorithm" && node.data.algorithmKey) {
      const algorithm = algorithmLibrary.find(
        (a) => a.key === node.data.algorithmKey,
      );

      if (!algorithm) {
        throw new Error(`Algorithm "${node.data.algorithmKey}" not found`);
      }

      // Gather inputs from connected nodes
      const inputs: Record<string, any> = {};
      const incomingEdges = workflow.edges.filter((e) => e.target === nodeId);

      incomingEdges.forEach((edge) => {
        const sourceResult = results[edge.source];
        if (sourceResult) {
          inputs[edge.targetHandle] = sourceResult;
        }
      });

      // Execute algorithm
      try {
        const result = await algorithm.compute(
          inputs,
          node.data.parameters || {},
        );
        results[nodeId] = result;
      } catch (error) {
        throw new Error(
          `Error executing node "${node.data.label}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  return results;
}
