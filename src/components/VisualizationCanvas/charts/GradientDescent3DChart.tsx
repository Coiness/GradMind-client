import React, { useState, useEffect, useMemo, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Button, Space } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import "echarts-gl";
import type { GradientDescentVisualization } from "@/types/computationResult";

interface GradientDescent3DChartProps {
  data: GradientDescentVisualization;
}

const GradientDescent3DChart: React.FC<GradientDescent3DChartProps> = ({ data }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<number | null>(null);

  const { surfaceData, pathPoints, range, functionType } = data;

  // 动画控制
  useEffect(() => {
    if (isPlaying && currentStep < pathPoints.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 50);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, pathPoints.length]);

  // 重置动画
  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(true);
  }, [data]);

  const option = useMemo(() => {
    const surfaceValues = surfaceData.map((p) => [p.x, p.y, p.z]);
    const animatedPath = pathPoints.slice(0, currentStep + 1).map((p) => [p.x, p.y, p.z]);
    const currentPoint = pathPoints[currentStep];

    // 根据函数类型调整范围和坐标
    const isRosenbrock = functionType === "rosenbrock";
    const adjustedRange = isRosenbrock
      ? { xMin: -2, xMax: 2, yMin: -2, yMax: 2 }
      : range;

    return {
      tooltip: {},
      visualMap: {
        show: false,
        dimension: 2,
        min: Math.min(...surfaceData.map((p) => p.z)),
        max: Math.max(...surfaceData.map((p) => p.z)),
        inRange: {
          color: ["#313695", "#4575b4", "#74add1", "#abd9e9", "#e0f3f8", "#ffffbf", "#fee090", "#fdae61", "#f46d43", "#d73027", "#a50026"],
        },
      },
      xAxis3D: { type: "value", min: adjustedRange.xMin, max: adjustedRange.xMax, name: "X" },
      yAxis3D: { type: "value", min: adjustedRange.yMin, max: adjustedRange.yMax, name: "Y" },
      zAxis3D: { type: "value", name: "Z (Loss)" },
      grid3D: {
        viewControl: {
          projection: "perspective",
          autoRotate: false,
          distance: isRosenbrock ? 180 : 200,
          alpha: 30,
          beta: 45,
        },
        boxWidth: 100,
        boxHeight: 50,
        boxDepth: 100,
        postEffect: {
          enable: true,
          SSAO: { enable: true, radius: 2, intensity: 1.5 },
        },
        light: {
          main: { intensity: 1.5, shadow: true, alpha: 40, beta: 40 },
          ambient: { intensity: 0.5 },
        },
      },
      series: [
        {
          type: "surface",
          data: surfaceValues,
          shading: "realistic",
          realisticMaterial: { roughness: 0.5, metalness: 0.3 },
          itemStyle: { opacity: 0.8 },
        },
        {
          type: "line3D",
          data: animatedPath,
          lineStyle: { width: 4, color: "#ff0000" },
        },
        {
          type: "scatter3D",
          data: [[currentPoint.x, currentPoint.y, currentPoint.z]],
          symbolSize: 12,
          itemStyle: { color: "#ff0000" },
        },
      ],
    };
  }, [surfaceData, pathPoints, currentStep, range, functionType]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Space style={{ marginBottom: 8 }}>
        <Button
          icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={currentStep >= pathPoints.length - 1}
        >
          {isPlaying ? "暂停" : "播放"}
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setCurrentStep(0);
            setIsPlaying(true);
          }}
        >
          重置
        </Button>
        <span style={{ color: "#666", fontSize: 12 }}>
          步骤: {currentStep + 1} / {pathPoints.length}
        </span>
      </Space>
      <div style={{ flex: 1 }}>
        <ReactECharts
          option={option}
          style={{ height: "100%" }}
          notMerge={false}
          lazyUpdate={true}
        />
      </div>
    </div>
  );
};

export default GradientDescent3DChart;
