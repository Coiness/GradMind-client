import type { BridgeConfig } from "@/types/bridgeConfig";

export const gradientDescentBridge: BridgeConfig = {
  id: "gradient-descent",
  name: "梯度下降算法",
  language: "python",

  // 完整的 LaTeX 公式，包含 htmlId 标记
  mathTemplate: `## 梯度下降算法数学推导

### 1. 定义损失函数
我们使用均方误差（Mean Squared Error）作为损失函数：

$$
\\htmlId{loss_func}{J(\\theta)} = \\htmlId{loss_formula}{\\frac{1}{2m} \\sum_{i=1}^{m} (h_{\\theta}(x^{(i)}) - y^{(i)})^2}
$$

其中：
- $m$ 是训练样本数量
- $h_{\\theta}(x)$ 是假设函数：$h_{\\theta}(x) = \\theta_0 + \\theta_1 x$
- $\\theta = [\\theta_0, \\theta_1]^T$ 是模型参数

### 2. 计算梯度
损失函数对参数 $\\theta_j$ 的偏导数为：

$$
\\htmlId{gradient_calc}{\\frac{\\partial}{\\partial \\theta_j} J(\\theta)} = \\htmlId{gradient_formula}{\\frac{1}{m} \\sum_{i=1}^{m} (h_{\\theta}(x^{(i)}) - y^{(i)}) x_j^{(i)}}
$$

对于所有参数，梯度向量为：

$$
\\htmlId{gradient_vector}{\\nabla_{\\theta} J(\\theta)} = \\begin{bmatrix} \\frac{\\partial J}{\\partial \\theta_0} \\\\ \\frac{\\partial J}{\\partial \\theta_1} \\end{bmatrix}
$$

### 3. 参数更新规则
梯度下降算法的核心更新规则：

$$
\\htmlId{update_step}{\\theta_j := \\theta_j - \\alpha \\frac{\\partial}{\\partial \\theta_j} J(\\theta)}
$$

向量形式：

$$
\\htmlId{update_vector}{\\theta := \\theta - \\alpha \\nabla_{\\theta} J(\\theta)}
$$

其中 $\\alpha$ 是学习率（learning rate），控制每次更新的步长。`,

  // 完整的 Python 代码实现
  codeContent: `import numpy as np
import matplotlib.pyplot as plt

class GradientDescent:
    """梯度下降算法实现类"""
    
    def __init__(self, learning_rate=0.01, max_iterations=1000):
        """
        初始化梯度下降算法
        Args:
            learning_rate: 学习率，控制参数更新步长
            max_iterations: 最大迭代次数
        """
        self.learning_rate = learning_rate
        self.max_iterations = max_iterations
        self.loss_history = []
        self.theta_history = []
    
    def compute_loss(self, X, y, theta):
        """
        计算损失函数（均方误差）
        Args:
            X: 特征矩阵，形状 (m, n)
            y: 目标值，形状 (m,)
            theta: 参数向量，形状 (n,)
        Returns:
            loss: 损失值
        """
        m = len(y)
        predictions = X.dot(theta)
        # 计算损失函数
        loss = (1/(2*m)) * np.sum((predictions - y) ** 2)
        return loss
    
    def compute_gradient(self, X, y, theta):
        """
        计算梯度
        Args:
            X: 特征矩阵
            y: 目标值
            theta: 参数向量
        Returns:
            gradient: 梯度向量
        """
        m = len(y)
        predictions = X.dot(theta)
        errors = predictions - y
        # 计算梯度
        gradient = (1/m) * X.T.dot(errors)
        return gradient
    
    def fit(self, X, y, initial_theta=None):
        """
        训练模型
        Args:
            X: 特征矩阵
            y: 目标值
            initial_theta: 初始参数，如果为None则初始化为零向量
        Returns:
            theta: 优化后的参数
        """
        if initial_theta is None:
            initial_theta = np.zeros(X.shape[1])
        
        theta = initial_theta.copy()
        self.loss_history = []
        self.theta_history = [theta.copy()]
        
        print(f"开始梯度下降，学习率: {self.learning_rate}, 最大迭代次数: {self.max_iterations}")
        
        for i in range(self.max_iterations):
            # 计算当前损失
            current_loss = self.compute_loss(X, y, theta)
            self.loss_history.append(current_loss)
            
            # 计算梯度
            grad = self.compute_gradient(X, y, theta)
            
            # 更新参数
            theta = theta - self.learning_rate * grad
            self.theta_history.append(theta.copy())
            
            # 每100次迭代打印进度
            if i % 100 == 0:
                print(f"迭代 {i}: 损失 = {current_loss:.6f}, 参数 = {theta}")
            
            # 提前停止条件：损失变化很小
            if len(self.loss_history) > 1:
                loss_change = abs(self.loss_history[-1] - self.loss_history[-2])
                if loss_change < 1e-6:
                    print(f"迭代 {i}: 损失变化很小 ({loss_change:.8f})，提前停止")
                    break
        
        print(f"训练完成，最终损失: {self.loss_history[-1]:.6f}")
        return theta
    
    def predict(self, X, theta):
        """预测"""
        return X.dot(theta)
    
    def plot_loss_history(self):
        """绘制损失历史"""
        plt.figure(figsize=(10, 6))
        plt.plot(self.loss_history)
        plt.xlabel('迭代次数')
        plt.ylabel('损失')
        plt.title('梯度下降损失曲线')
        plt.grid(True)
        plt.show()

# 示例使用
if __name__ == "__main__":
    # 生成模拟数据
    np.random.seed(42)
    n_samples = 100
    X = np.c_[np.ones(n_samples), np.random.randn(n_samples, 1)]  # 添加偏置项
    true_theta = np.array([1.0, 2.0])
    y = X.dot(true_theta) + np.random.randn(n_samples) * 0.5
    
    # 创建梯度下降实例
    gd = GradientDescent(learning_rate=0.1, max_iterations=500)
    
    # 训练模型
    theta_optimized = gd.fit(X, y)
    
    # 输出结果
    print("\\n=== 训练结果 ===")
    print(f"真实参数: {true_theta}")
    print(f"优化参数: {theta_optimized}")
    print(f"参数误差: {np.abs(true_theta - theta_optimized)}")
    print(f"最终损失: {gd.loss_history[-1]:.8f}")
    
    # 绘制损失曲线
    gd.plot_loss_history()`,

  // 映射关系配置
  mappings: {
    loss_func: {
      lines: [19, 22],
      color: "#e6f7ff",
      description: "损失函数定义和计算",
    },
    loss_formula: {
      lines: [27, 30],
      color: "#bae7ff",
      description: "损失函数公式具体实现",
    },
    gradient_calc: {
      lines: [40, 42],
      color: "#d9f7be",
      description: "梯度计算调用",
    },
    gradient_formula: {
      lines: [32, 35],
      color: "#b7eb8f",
      description: "梯度公式实现",
    },
    gradient_vector: {
      lines: [30, 31],
      color: "#95de64",
      description: "梯度向量表示",
    },
    update_step: {
      lines: [40, 42],
      color: "#ffd6e7",
      description: "参数更新步骤",
    },
    update_vector: {
      lines: [52, 52],
      color: "#ff9ec6",
      description: "向量形式更新",
    },
  },
};
