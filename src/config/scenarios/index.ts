import gradientDescentScenario from "./gradientDescentScenario";

// 导出所有场景的数组
export const scenarios = [
  gradientDescentScenario,
  // 未来添加新场景时，只需要在这里导入并添加到数组中
  // 例如：import { bpScenario } from './bpScenario';
  // 然后在数组中添加 bpScenario
  // 注意，这跟导出方式相关，如果是export default a，无需加{}，并且可以改变名字
  // 如果只有 export a，则需要{}，无法命名
];
