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
  const { templates } = useAppSelector((state) => state.orchestration);

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      dispatch(loadTemplate(templateId));
      message.success(`Template "${template.name}" loaded successfully!`);
    }
  };

  const templateOptions = templates.map((template) => ({
    label: template.name,
    value: template.id,
    description: template.description,
  }));

  return (
    <Select
      placeholder={
        <>
          <AppstoreOutlined /> Templates
        </>
      }
      style={{ minWidth: 180 }}
      options={templateOptions}
      onChange={handleTemplateSelect}
      value={null}
      disabled={templates.length === 0}
    />
  );
};
