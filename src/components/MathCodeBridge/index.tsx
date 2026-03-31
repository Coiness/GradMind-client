import React, { useState } from "react";
import { Card, Space, Typography, Tag, Divider } from "antd";
const { Title, Text } = Typography;

interface MathCodeBridgeProps {
  mappings?: Array<{
    id: string;
    name: string;
    formula: string;
    description: string;
    color: string;
    codeLines: [number, number];
    codeSnippet: string;
  }>;
}

export const MathCodeBridge: React.FC<MathCodeBridgeProps> = ({ mappings }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  if (!mappings || mappings.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center", color: "var(--text-secondary)" }}>
        当前场景暂无公式-代码对应关系
      </div>
    );
  }

  const formulaMappings = mappings;

  // 获取当前高亮的公式
  const currentFormula = formulaMappings.find(
    (f) => f.id === (hoveredId || activeId),
  );

  return (
    <div
      style={{
        padding: "12px 16px", // 减少内边距
        height: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 紧凑标题区域 */}
      <div style={{ marginBottom: "12px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "8px",
          }}
        >
          <Title level={5} style={{ margin: 0 }}>
            🎯 公式-算法对译
          </Title>
          {currentFormula && (
            <Tag
              color={currentFormula.color.replace("#", "")}
              style={{ fontSize: "11px", padding: "2px 6px" }}
            >
              {currentFormula.description}
            </Tag>
          )}
        </div>
        <Text type="secondary" style={{ fontSize: "12px" }}>
          悬停/点击查看公式与代码对应关系
        </Text>
      </div>

      {/* 数学公式区域 - 紧凑版 */}
      <Card
        size="small"
        title={
          <span style={{ fontSize: "14px", fontWeight: "normal" }}>
            📐 数学公式
          </span>
        }
        style={{
          marginBottom: "12px",
          flex: 1,
          overflow: "auto",
        }}
        bodyStyle={{ padding: "12px" }}
      >
        <Space direction="vertical" style={{ width: "100%" }}>
          {formulaMappings.map((item) => {
            const isActive = activeId === item.id;
            const isHovered = hoveredId === item.id;
            const shouldHighlight = isActive || isHovered;

            return (
              <div
                key={item.id}
                style={{
                  padding: "8px 10px",
                  background: shouldHighlight ? item.color : "transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  border: isActive
                    ? `2px solid ${item.color}`
                    : "1px solid #e8e8e8",
                  marginBottom: "6px",
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setActiveId(isActive ? null : item.id)}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      minWidth: "20px",
                      height: "20px",
                      borderRadius: "4px",
                      background: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#000",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {item.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "4px",
                      }}
                    >
                      <Text strong style={{ fontSize: "13px" }}>
                        {item.name}
                      </Text>
                      {isActive && (
                        <Text type="secondary" style={{ fontSize: "10px" }}>
                          ✅ 已选择
                        </Text>
                      )}
                    </div>
                    <Text
                      style={{
                        fontSize: "12px",
                        fontFamily: "KaTeX_Main, Times New Roman, serif",
                        lineHeight: "1.3",
                      }}
                    >
                      {item.formula}
                    </Text>
                  </div>
                </div>
              </div>
            );
          })}
        </Space>
      </Card>

      {/* 代码实现区域 - 紧凑版 */}
      <Card
        size="small"
        title={
          <span style={{ fontSize: "14px", fontWeight: "normal" }}>
            💻 代码实现
          </span>
        }
        style={{
          marginBottom: "12px",
          flex: 1,
          overflow: "auto",
        }}
        bodyStyle={{ padding: "12px" }}
      >
        <div
          style={{
            background: "#1e1e1e",
            borderRadius: "6px",
            overflow: "hidden",
            fontSize: "11px", // 缩小代码字体
          }}
        >
          {formulaMappings.map((item) => {
            const isActive = activeId === item.id;
            const isHovered = hoveredId === item.id;
            const shouldHighlight = isActive || isHovered;

            return (
              <div
                key={item.id}
                style={{
                  padding: "8px 10px",
                  background: shouldHighlight ? item.color : "transparent",
                  borderLeft: shouldHighlight
                    ? `4px solid ${item.color}`
                    : "none",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setActiveId(isActive ? null : item.id)}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "6px",
                    color: shouldHighlight ? "#000" : "#569cd6",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: item.color,
                      marginRight: "6px",
                    }}
                  />
                  <Text
                    strong
                    style={{
                      fontSize: "12px",
                      color: shouldHighlight ? "#000" : "#d4d4d4",
                    }}
                  >
                    {item.name}
                  </Text>
                </div>

                <pre
                  style={{
                    margin: 0,
                    color: shouldHighlight ? "#000" : "#d4d4d4",
                    fontFamily: "Consolas, Monaco, monospace",
                    fontSize: "11px", // 缩小代码字体
                    lineHeight: "1.3",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {item.codeSnippet}
                </pre>
              </div>
            );
          })}
        </div>
      </Card>

      {/* 紧凑的交互说明和图例 */}
      <Card size="small" bodyStyle={{ padding: "8px 12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Text strong style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
            图例:
          </Text>
          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              flex: 1,
            }}
          >
            {formulaMappings.map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  cursor: "pointer",
                }}
                onClick={() => setActiveId(item.id)}
              >
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    background: item.color,
                    borderRadius: "2px",
                  }}
                />
                <Text style={{ fontSize: "11px" }}>{item.name}</Text>
              </div>
            ))}
          </div>
        </div>

        <Divider style={{ margin: "6px 0", fontSize: "10px" }}>
          💡 悬停或点击查看对应关系
        </Divider>
      </Card>
    </div>
  );
};
