/**
 * 数据转换工具
 * 用于在不同数据类型之间进行转换
 */

export type DataType = "matrix" | "vector" | "scalar" | "function" | "model" | "dataset";

/**
 * 数据类型兼容性规则
 * 定义哪些类型可以转换到哪些类型
 */
const compatibilityRules: Record<DataType, DataType[]> = {
  dataset: ["matrix", "vector", "dataset"],
  matrix: ["vector", "matrix"],
  vector: ["scalar", "vector", "matrix"],
  scalar: ["scalar", "vector"],
  function: ["function"],
  model: ["model"],
};

/**
 * 检查两种数据类型是否兼容
 */
export function isTypeCompatible(sourceType: DataType, targetType: DataType): boolean {
  if (sourceType === targetType) return true;
  return compatibilityRules[sourceType]?.includes(targetType) || false;
}

/**
 * 转换数据从源类型到目标类型
 * @param data 源数据
 * @param sourceType 源数据类型
 * @param targetType 目标数据类型
 * @returns 转换后的数据
 */
export function transformData(
  data: any,
  sourceType: DataType,
  targetType: DataType
): any {
  // 如果类型相同，直接返回
  if (sourceType === targetType) {
    return data;
  }

  // 检查类型兼容性
  if (!isTypeCompatible(sourceType, targetType)) {
    throw new Error(
      `无法将类型 "${sourceType}" 转换为 "${targetType}"。这两种类型不兼容。`
    );
  }

  try {
    // Dataset → Matrix
    if (sourceType === "dataset" && targetType === "matrix") {
      return datasetToMatrix(data);
    }

    // Dataset → Vector
    if (sourceType === "dataset" && targetType === "vector") {
      return datasetToVector(data);
    }

    // Matrix → Vector (展平)
    if (sourceType === "matrix" && targetType === "vector") {
      return matrixToVector(data);
    }

    // Vector → Matrix (转换为列向量)
    if (sourceType === "vector" && targetType === "matrix") {
      return vectorToMatrix(data);
    }

    // Vector → Scalar (取第一个元素)
    if (sourceType === "vector" && targetType === "scalar") {
      return vectorToScalar(data);
    }

    // Scalar → Vector (包装为单元素数组)
    if (sourceType === "scalar" && targetType === "vector") {
      return scalarToVector(data);
    }

    // 如果没有匹配的转换规则，返回原数据
    return data;
  } catch (error) {
    throw new Error(
      `数据转换失败 (${sourceType} → ${targetType}): ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}

/**
 * Dataset → Matrix
 * 提取 dataset 对象中的 data 字段
 */
function datasetToMatrix(data: any): number[][] {
  // 如果已经是数组，直接返回
  if (Array.isArray(data)) {
    // 检查是否是二维数组
    if (Array.isArray(data[0])) {
      return data as number[][];
    }
    // 如果是一维数组，转换为列向量
    return data.map((val: number) => [val]);
  }

  // 如果是对象，提取 data 字段
  if (data && typeof data === "object") {
    if (data.data) {
      return datasetToMatrix(data.data);
    }
    throw new Error("Dataset 对象缺少 data 字段");
  }

  throw new Error("无效的 dataset 格式");
}

/**
 * Dataset → Vector
 * 提取并展平 dataset 数据
 */
function datasetToVector(data: any): number[] {
  const matrix = datasetToMatrix(data);
  // 如果是二维数组，提取最后一列（通常是目标值 Y）
  if (Array.isArray(matrix[0]) && matrix[0].length > 1) {
    const lastColIndex = matrix[0].length - 1;
    return matrix.map((row: number[]) => row[lastColIndex]);
  }
  return matrixToVector(matrix);
}

/**
 * Matrix → Vector
 * 展平矩阵为一维数组
 */
function matrixToVector(data: any): number[] {
  if (!Array.isArray(data)) {
    throw new Error("Matrix 必须是数组");
  }

  // 如果已经是一维数组，直接返回
  if (!Array.isArray(data[0])) {
    return data as number[];
  }

  // 展平二维数组
  const result: number[] = [];
  for (const row of data) {
    if (Array.isArray(row)) {
      result.push(...row);
    } else {
      result.push(row);
    }
  }

  return result;
}

/**
 * Vector → Matrix
 * 将向量转换为列向量矩阵
 */
function vectorToMatrix(data: any): number[][] {
  if (!Array.isArray(data)) {
    throw new Error("Vector 必须是数组");
  }

  // 如果已经是二维数组，直接返回
  if (Array.isArray(data[0])) {
    return data as number[][];
  }

  // 转换为列向量
  return (data as number[]).map((val) => [val]);
}

/**
 * Vector → Scalar
 * 取向量的第一个元素
 */
function vectorToScalar(data: any): number {
  if (!Array.isArray(data)) {
    throw new Error("Vector 必须是数组");
  }

  if (data.length === 0) {
    throw new Error("Vector 不能为空");
  }

  // 如果是二维数组，取第一行第一列
  if (Array.isArray(data[0])) {
    return data[0][0];
  }

  // 取第一个元素
  return data[0];
}

/**
 * Scalar → Vector
 * 将标量包装为单元素数组
 */
function scalarToVector(data: any): number[] {
  if (typeof data !== "number") {
    throw new Error("Scalar 必须是数字");
  }

  return [data];
}

/**
 * 自动检测数据类型
 */
export function detectDataType(data: any): DataType {
  // 检查是否是函数
  if (typeof data === "function") {
    return "function";
  }

  // 检查是否是数字（标量）
  if (typeof data === "number") {
    return "scalar";
  }

  // 检查是否是数组
  if (Array.isArray(data)) {
    // 空数组视为向量
    if (data.length === 0) {
      return "vector";
    }

    // 检查第一个元素
    if (Array.isArray(data[0])) {
      return "matrix";
    }

    return "vector";
  }

  // 检查是否是对象
  if (data && typeof data === "object") {
    // 检查是否是 dataset
    if (data.data || data.type === "dataset") {
      return "dataset";
    }

    // 检查是否是 model
    if (data.weights || data.model) {
      return "model";
    }

    // 检查是否是函数对象
    if (data.func) {
      return "function";
    }
  }

  throw new Error("无法检测数据类型");
}

/**
 * 批量转换数据
 * 用于转换多个输入
 */
export function transformInputs(
  inputs: Record<string, any>,
  inputSpecs: Array<{ id: string; dataType: DataType }>,
  sourceTypes?: Record<string, DataType>
): Record<string, any> {
  const transformed: Record<string, any> = {};

  for (const spec of inputSpecs) {
    const data = inputs[spec.id];
    if (data === undefined) continue;

    // 检测源数据类型
    const sourceType = sourceTypes?.[spec.id] || detectDataType(data);

    // 转换数据
    try {
      transformed[spec.id] = transformData(data, sourceType, spec.dataType);
    } catch (error) {
      console.warn(
        `输入 "${spec.id}" 转换失败:`,
        error instanceof Error ? error.message : String(error)
      );
      // 转换失败时保留原数据
      transformed[spec.id] = data;
    }
  }

  return transformed;
}

/**
 * 验证数据是否符合指定类型
 */
export function validateDataType(data: any, expectedType: DataType): boolean {
  try {
    const actualType = detectDataType(data);
    return actualType === expectedType || isTypeCompatible(actualType, expectedType);
  } catch {
    return false;
  }
}
