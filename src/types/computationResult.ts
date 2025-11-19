// 计算结果的类型（根据你的算法返回的数据）
export interface ComputationResult {
  computationTime: number;
  finalLoss?: number;
  iterations?: number;
  // ... 其他算法特定的结果字段
}
