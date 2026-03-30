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

  const options = templates.map((t) => ({
    label: t.name,
    value: t.id,
  }));

  return (
    <Select
      placeholder={
        <>
          <AppstoreOutlined /> 加载模板
        </>
      }
      style={{ minWidth: 200 }}
      options={options}
      onChange={handleTemplateSelect}
      value={null}
      loading={isLoading}
      disabled={false}
      notFoundContent={isLoading ? "加载中..." : "暂无模板"}
    />
  );
};
