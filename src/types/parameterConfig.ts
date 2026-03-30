export type ParameterConfig = {
  key: string; // 唯一标识，用于 state
  label: string; // 显示的标签
  type: "slider" | "number" | "select" | "boolean"; // 控件类型
  defaultValue: number | string | boolean;
  // 特定于控件的选项
  options?: {
    min?: number;
    max?: number;
    step?: number;
    // 'select' 类型的选项
    items?: { label: string; value: number | string | boolean }[];
  };
};

export type ParameterValues = Record<string, string | number | boolean>;
