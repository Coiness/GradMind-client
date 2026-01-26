// 信息面板中每一条信息的结构
export interface InfoItem {
  label: string; // 信息的标签，例如 "计算耗时"
  value: React.ReactNode; // 信息的值，可以是字符串、数字，甚至是 React 组件
  unit?: string; // 可选的单位，例如 "ms" 或 "次"
}
