import type { Workflow, ValidationError } from "@/types/workflow";
import type { AlgorithmNode } from "@/types/algorithmNode";
import { isTypeCompatible } from "./dataTransformer";

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
    // 示波器节点不需要 algorithmKey，跳过算法验证
    if (node.type === "oscilloscope") return;

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
            message: `必需输入 "${input.label}" 未连接`,
            type: "error", // 改为 error 而不是 warning
          });
        }
      });
    }
  });

  // 添加数据类型兼容性验证
  errors.push(...validateDataTypeCompatibility(workflow, algorithmLibrary));

  // 添加端口有效性验证
  errors.push(...validatePortValidity(workflow, algorithmLibrary));

  // 添加多重连接检查
  errors.push(...validateMultipleConnections(workflow));

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

/**
 * 验证数据类型兼容性
 * 检查连接的端口类型是否兼容
 */
function validateDataTypeCompatibility(
  workflow: Workflow,
  algorithmLibrary: AlgorithmNode[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  workflow.edges.forEach((edge) => {
    const sourceNode = workflow.nodes.find((n) => n.id === edge.source);
    const targetNode = workflow.nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) {
      errors.push({
        edgeId: edge.id,
        message: `连接的节点不存在`,
        type: "error",
      });
      return;
    }

    // 示波器节点接受任意类型，跳过类型检查
    if (sourceNode.type === "oscilloscope" || targetNode.type === "oscilloscope") return;
    let sourceAlgorithm: AlgorithmNode | undefined;
    if (sourceNode.type === "algorithm" && sourceNode.data.algorithmKey) {
      sourceAlgorithm = algorithmLibrary.find(
        (a) => a.key === sourceNode.data.algorithmKey
      );
    } else if (sourceNode.type === "dataset") {
      // Dataset 节点输出 dataset 类型
      sourceAlgorithm = {
        outputs: [{ id: "dataset", label: "数据集", dataType: "dataset" }],
      } as any;
    }

    // 获取目标节点的算法定义
    const targetAlgorithm =
      targetNode.type === "algorithm" && targetNode.data.algorithmKey
        ? algorithmLibrary.find((a) => a.key === targetNode.data.algorithmKey)
        : undefined;

    if (!sourceAlgorithm || !targetAlgorithm) {
      return; // 如果找不到算法定义，跳过类型检查
    }

    // 查找输出端口和输入端口
    const outputPort = sourceAlgorithm.outputs?.find(
      (o) => o.id === edge.sourceHandle
    );
    const inputPort = targetAlgorithm.inputs?.find(
      (i) => i.id === edge.targetHandle
    );

    if (!outputPort) {
      errors.push({
        edgeId: edge.id,
        nodeId: sourceNode.id,
        message: `源端口 "${edge.sourceHandle}" 不存在`,
        type: "error",
      });
      return;
    }

    if (!inputPort) {
      errors.push({
        edgeId: edge.id,
        nodeId: targetNode.id,
        message: `目标端口 "${edge.targetHandle}" 不存在`,
        type: "error",
      });
      return;
    }

    // 检查类型兼容性
    const sourceType = outputPort.dataType;
    const targetType = inputPort.dataType;

    if (!isTypeCompatible(sourceType as any, targetType as any)) {
      errors.push({
        edgeId: edge.id,
        message: `类型不匹配: ${sourceType} 无法连接到 ${targetType}`,
        type: "error",
      });
    }
  });

  return errors;
}

/**
 * 验证端口有效性
 * 检查端口 ID 是否存在
 */
function validatePortValidity(
  workflow: Workflow,
  algorithmLibrary: AlgorithmNode[]
): ValidationError[] {
  const errors: ValidationError[] = [];

  workflow.edges.forEach((edge) => {
    const sourceNode = workflow.nodes.find((n) => n.id === edge.source);
    const targetNode = workflow.nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) return;

    // 示波器节点不做端口验证
    if (sourceNode.type === "oscilloscope" || targetNode.type === "oscilloscope") return;

    // 验证源端口
    if (sourceNode.type === "algorithm" && sourceNode.data.algorithmKey) {
      const algorithm = algorithmLibrary.find(
        (a) => a.key === sourceNode.data.algorithmKey
      );
      if (algorithm) {
        const hasOutputPort = algorithm.outputs?.some(
          (o) => o.id === edge.sourceHandle
        );
        if (!hasOutputPort) {
          errors.push({
            edgeId: edge.id,
            nodeId: sourceNode.id,
            message: `输出端口 "${edge.sourceHandle}" 在算法中不存在`,
            type: "error",
          });
        }
      }
    }

    // 验证目标端口
    if (targetNode.type === "algorithm" && targetNode.data.algorithmKey) {
      const algorithm = algorithmLibrary.find(
        (a) => a.key === targetNode.data.algorithmKey
      );
      if (algorithm) {
        const hasInputPort = algorithm.inputs?.some(
          (i) => i.id === edge.targetHandle
        );
        if (!hasInputPort) {
          errors.push({
            edgeId: edge.id,
            nodeId: targetNode.id,
            message: `输入端口 "${edge.targetHandle}" 在算法中不存在`,
            type: "error",
          });
        }
      }
    }
  });

  return errors;
}

/**
 * 验证多重连接
 * 检查同一个输入端口是否被多次连接
 */
function validateMultipleConnections(workflow: Workflow): ValidationError[] {
  const errors: ValidationError[] = [];
  const inputConnections = new Map<string, string[]>();

  // 统计每个输入端口的连接数
  workflow.edges.forEach((edge) => {
    const key = `${edge.target}:${edge.targetHandle}`;
    if (!inputConnections.has(key)) {
      inputConnections.set(key, []);
    }
    inputConnections.get(key)!.push(edge.id);
  });

  // 检查是否有多重连接
  inputConnections.forEach((edgeIds, key) => {
    if (edgeIds.length > 1) {
      const [nodeId, portId] = key.split(":");
      errors.push({
        nodeId,
        message: `输入端口 "${portId}" 被多次连接（${edgeIds.length} 个连接）`,
        type: "warning",
      });
    }
  });

  return errors;
}
