import React from "react";
import { Card, Descriptions, Spin } from "antd";
import type { DescriptionsProps } from "antd";
import type { InfoItem } from "@/types/InfoConfig";
import styles from "./index.module.css";

interface InfoPanelProps {
  title: string;
  data: InfoItem[];
  loading?: boolean;
}

export const InfoPanel: React.FC<InfoPanelProps> = ({
  title,
  data,
  loading,
}) => {
  // 将我们的 InfoItem 数据转换为 Ant Design Descriptions 组件需要的格式
  const descriptionItems: DescriptionsProps["items"] = data.map((item) => ({
    key: item.label,
    label: item.label,
    children: `${item.value ?? "N/A"} ${item.unit ?? ""}`,
  }));

  return (
    <div className={styles.panel}>
      <Spin spinning={loading} tip="计算中..." className="w-full">
        <Card title={title} bordered={false}>
          <Descriptions items={descriptionItems} column={1} bordered />
        </Card>
      </Spin>
    </div>
  );
};
