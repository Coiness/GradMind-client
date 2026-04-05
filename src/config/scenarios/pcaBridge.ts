export const pcaBridge = {
  mappings: [
    {
      id: "center_data",
      name: "数据中心化",
      formula: "X̃ = X - μ",
      description: "减去均值",
      color: "#e6f7ff",
      codeLines: [1, 4] as [number, number],
      codeSnippet: `def center_data(X):
    mean = np.mean(X, axis=0)
    X_centered = X - mean
    return X_centered, mean`,
    },
    {
      id: "covariance",
      name: "协方差矩阵",
      formula: "C = (X̃ᵀX̃) / (n-1)",
      description: "计算协方差",
      color: "#d9f7be",
      codeLines: [6, 9] as [number, number],
      codeSnippet: `def compute_covariance(X_centered):
    n = X_centered.shape[0]
    cov = (X_centered.T @ X_centered) / (n - 1)
    return cov`,
    },
    {
      id: "eigen",
      name: "特征分解",
      formula: "C = VΛVᵀ",
      description: "提取主成分",
      color: "#ffd6e7",
      codeLines: [11, 16] as [number, number],
      codeSnippet: `def compute_pca(cov, n_components):
    eigenvalues, eigenvectors = np.linalg.eig(cov)
    idx = eigenvalues.argsort()[::-1]
    eigenvalues = eigenvalues[idx]
    eigenvectors = eigenvectors[:, idx]
    return eigenvectors[:, :n_components]`,
    },
  ],
};
