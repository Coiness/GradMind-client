export const gradientDescentBridge = {
  mappings: [
    {
      id: "loss_func",
      name: "损失函数",
      formula: "J(θ) = 1/2m ∑(hθ(x) - y)²",
      description: "均方误差",
      color: "#e6f7ff",
      codeLines: [1, 5] as [number, number],
      codeSnippet: `def compute_loss(X, y, theta):
    m = len(y)
    predictions = X.dot(theta)
    loss = (1/(2*m)) * np.sum((predictions - y) ** 2)
    return loss`,
    },
    {
      id: "gradient_formula",
      name: "梯度计算",
      formula: "∇J(θ) = 1/m ∑(hθ(x) - y)x",
      description: "参数梯度",
      color: "#d9f7be",
      codeLines: [7, 11] as [number, number],
      codeSnippet: `def compute_gradient(X, y, theta):
    m = len(y)
    predictions = X.dot(theta)
    errors = predictions - y
    gradient = (1/m) * X.T.dot(errors)
    return gradient`,
    },
    {
      id: "update_step",
      name: "参数更新",
      formula: "θ := θ - α∇J(θ)",
      description: "更新规则",
      color: "#ffd6e7",
      codeLines: [13, 22] as [number, number],
      codeSnippet: `def gradient_descent(X, y, theta, alpha, iterations):
    m = len(y)
    loss_history = []

    for i in range(iterations):
        grad = compute_gradient(X, y, theta)
        theta = theta - alpha * grad
        loss = compute_loss(X, y, theta)
        loss_history.append(loss)

    return theta, loss_history`,
    },
  ],
};
