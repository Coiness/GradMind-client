export interface MappingItem {
  lines: [number, number]; // 代码行范围 [start, end]
  color: string; // 高亮颜色
  description?: string; // 可选描述
}

export interface BridgeMapping {
  [id: string]: MappingItem; // ID -> 映射配置
}

export interface BridgeConfig {
  id: string; // 场景ID
  name: string; // 场景名称
  mathTemplate: string; // 包含 htmlId 的 LaTeX 公式
  codeContent: string; // 代码内容
  mappings: BridgeMapping; // ID 映射配置
  language?: string; // 代码语言，默认 python
}

export interface HighlightState {
  activeId: string | null; // 当前激活的ID
  hoveredId: string | null; // 当前悬停的ID
  activeColor: string | null; // 当前激活的颜色
}
