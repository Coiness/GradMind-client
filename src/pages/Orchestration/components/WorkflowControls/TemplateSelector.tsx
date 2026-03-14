import React from "react";
import { Select, message } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadTemplate } from "@/store/features/orchestrationSlice";

/**
 * TemplateSelector Component
 * Dropdown to load pre-built workflow templates
 */
export const TemplateSelector: React.FC = () => {
  const dispatch = useAppDispatch();
  const { templates, status } = useAppSelector((state) => state.orchestration);

  const isLoading = status === "loading";

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      dispatch(loadTemplate(templateId));
      message.success(`模板 "${template.name}" 加载成功！`);
    }
  };

  // 按类别分组：内置数据模板 vs 普通模板
  const builtinTemplates = templates.filter((t) =>
    ["template-pca-builtin", "template-gd-builtin", "template-ls-builtin", "template-svd-builtin"].includes(t.id)
  );
  const basicTemplates = templates.filter((t) =>
    !["template-pca-builtin", "template-gd-builtin", "template-ls-builtin", "template-svd-builtin"].includes(t.id)
  );

  const groupedOptions = [
    ...(builtinTemplates.length > 0
      ? [
          {
            label: "🎯 内置数据（直接执行）",
            options: builtinTemplates.map((t) => ({
              label: t.name,
              value: t.id,
            })),
          },
        ]
      : []),
    ...(basicTemplates.length > 0
      ? [
          {
            label: "📋 基础模板",
            options: basicTemplates.map((t) => ({
              label: t.name,
              value: t.id,
            })),
          },
        ]
      : []),
  ];

  return (
    <Select
      placeholder={
        <>
          <AppstoreOutlined /> 加载模板
        </>
      }
      style={{ minWidth: 200 }}
      options={groupedOptions}
      onChange={handleTemplateSelect}
      value={null}
      loading={isLoading}
      disabled={false}
      notFoundContent={isLoading ? "加载中..." : "暂无模板"}
    />
  );
};
