import type { Workflow } from "@/types/workflow";
import type { AlgorithmNode } from "@/types/algorithmNode";
import { topologicalSort } from "./topologicalSort";
import { validateWorkflow } from "./workflowValidator";
import { transformData, detectDataType } from "./dataTransformer";

function extractSourceValue(sourceResult: unknown, sourceHandle: string): unknown {
  if (
    sourceResult &&
    typeof sourceResult === "object" &&
    sourceHandle in (sourceResult as Record<string, unknown>)
  ) {
    return (sourceResult as Record<string, unknown>)[sourceHandle];
  }
  return sourceResult;
}

/**
 * Executes a workflow and returns results for each node
 */
export async function executeWorkflowEngine(
  workflow: Workflow,
  algorithmLibrary: AlgorithmNode[],
): Promise<Record<string, any>> {
  console.log("🔧 [workflowExecutor] Starting execution engine");
  console.log("📋 [workflowExecutor] Workflow nodes:", workflow.nodes.map(n => ({ id: n.id, type: n.type, label: n.data.label })));

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
  console.log("📊 [workflowExecutor] Execution order:", executionOrder);

  // Store results for each node
  const results: Record<string, any> = {};

  // Execute nodes in order
  for (const nodeId of executionOrder) {
    console.log(`🔄 [workflowExecutor] Executing node: ${nodeId}`);
    const node = workflow.nodes.find((n) => n.id === nodeId);
    if (!node) continue;

    if (node.type === "oscilloscope") {
      // 示波器节点：收集上游数据，透传并生成 visualization 供节点内嵌渲染
      const incomingEdges = workflow.edges.filter((e) => e.target === nodeId);
      let inputData: unknown = null;
      if (incomingEdges.length > 0) {
        const edge = incomingEdges[0];
        const sourceResult = results[edge.source];
        inputData = extractSourceValue(sourceResult, edge.sourceHandle);
        // 如果 sourceHandle 没有命中子字段，就用整个 sourceResult
        if (inputData === sourceResult && sourceResult && typeof sourceResult === "object") {
          inputData = sourceResult;
        }
      }
      results[nodeId] = { data: inputData, type: "oscilloscope", _raw: inputData };
      console.log(`📡 [workflowExecutor] Oscilloscope node ${nodeId} received:`, inputData);
      continue;
    }

    if (node.type === "dataset") {
      // Use real dataset data if available, otherwise use mock data
      if (node.data.datasetData) {
        const resultData: any = {
          data: node.data.datasetData.data,
          type: "dataset",
          metadata: node.data.datasetData.metadata,
        };

        // 自动为图片类型数据集附加 visualization 标识，以便示波器直接渲染
        if (node.data.datasetData.type === "image") {
          const meta = node.data.datasetData.metadata;
          resultData.visualization = {
            type: "image",
            data: {
              matrix: node.data.datasetData.data,
              width: meta?.imageWidth || meta?.columns || node.data.datasetData.data[0]?.length || 0,
              height: meta?.imageHeight || meta?.rows || node.data.datasetData.data.length || 0,
            }
          };
        }

        results[nodeId] = resultData;
        console.log(`✅ [workflowExecutor] Dataset node ${nodeId} result:`, results[nodeId]);
      } else {
        // Fallback to mock data
        results[nodeId] = {
          data: [[1, 2], [3, 4], [5, 6]],
          type: "dataset",
        };
        console.log(`⚠️ [workflowExecutor] Dataset node ${nodeId} using mock data`);
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
      console.log(`📥 [workflowExecutor] Node ${nodeId} incoming edges:`, incomingEdges.length);

      incomingEdges.forEach((edge) => {
        const sourceResult = results[edge.source];
        if (sourceResult === undefined) {
          return;
        }

        // 查找源节点和目标端口信息
        const sourceNode = workflow.nodes.find((n) => n.id === edge.source);
        const sourceAlgorithm = sourceNode?.data.algorithmKey
          ? algorithmLibrary.find((a) => a.key === sourceNode.data.algorithmKey)
          : null;

        // 提取该输出端口对应的数据，而不是整个结果对象
        const extractedSourceValue = extractSourceValue(sourceResult, edge.sourceHandle);

        // 查找输出端口和输入端口的数据类型
        const outputPort = sourceAlgorithm?.outputs.find(
          (o) => o.id === edge.sourceHandle
        );
        const inputPort = algorithm.inputs.find(
          (i) => i.id === edge.targetHandle
        );

        let sourceType: string | undefined = outputPort?.dataType;
        if (!sourceType && sourceNode?.type === "dataset") {
          sourceType = "dataset";
        }

        if (!sourceType) {
          try {
            sourceType = detectDataType(extractedSourceValue);
          } catch {
            sourceType = undefined;
          }
        }

        // 如果找到了端口类型信息，进行类型转换
        if (sourceType && inputPort) {
          try {
            const targetType = inputPort.dataType;
            if (sourceType !== targetType) {
              inputs[edge.targetHandle] = transformData(
                extractedSourceValue,
                sourceType as any,
                targetType as any
              );
            } else {
              inputs[edge.targetHandle] = extractedSourceValue;
            }
          } catch (error) {
            console.warn(
              `数据类型转换失败 (${edge.source} → ${edge.target}):`,
              error instanceof Error ? error.message : String(error)
            );
            inputs[edge.targetHandle] = extractedSourceValue;
          }
        } else {
          // 如果没有端口信息，直接使用提取后的原数据
          inputs[edge.targetHandle] = extractedSourceValue;
        }
      });

      console.log(`🔧 [workflowExecutor] Node ${nodeId} inputs:`, inputs);
      console.log(`⚙️ [workflowExecutor] Node ${nodeId} parameters:`, node.data.parameters);

      // Execute algorithm
      try {
        const result = await algorithm.compute(
          inputs,
          node.data.parameters || {},
        );
        results[nodeId] = result;
        console.log(`✅ [workflowExecutor] Node ${nodeId} execution success, result:`, result);
      } catch (error) {
        console.error(`❌ [workflowExecutor] Node ${nodeId} execution failed:`, error);
        throw new Error(
          `Error executing node "${node.data.label}": ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  console.log("🎉 [workflowExecutor] All nodes executed, final results:", results);
  return results;
}
