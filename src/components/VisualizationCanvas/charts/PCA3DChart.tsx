import React, { useState, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button, Space } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import * as THREE from "three";
import { useTheme } from "@/contexts/ThemeContext";
import type { PCAVisualization } from "@/types/computationResult";

interface PCA3DChartProps {
  data: PCAVisualization & {
    originalData?: number[][];
    nComponents?: number;
  };
}

// 将第 4 维值映射到颜色
function mapValueToColor(value: number, min: number, max: number): string {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return `hsl(${normalized * 240}, 70%, 50%)`;
}

// 散点组件
const ScatterPoints: React.FC<{
  points: number[][];
  originalData: number[][];
  nComponents: number;
  progress: number;
}> = ({ points, originalData, nComponents, progress }) => {
  const { colors, positions } = useMemo(() => {
    const fourthDimValues = originalData.map((p) => p[3] || 0);
    const min = Math.min(...fourthDimValues);
    const max = Math.max(...fourthDimValues);

    const colors = fourthDimValues.map((val) => mapValueToColor(val, min, max));
    const positions = points.map((p, i) => {
      const x = p[0] || 0;
      const originalY = p[1] || 0;
      const originalZ = p[2] || 0;

      let targetY = originalY;
      let targetZ = originalZ;

      if (nComponents < 3) targetZ = 0;
      if (nComponents < 2) targetY = 0;

      const interpolatedY = originalY * (1 - progress) + targetY * progress;
      const interpolatedZ = originalZ * (1 - progress) + targetZ * progress;

      return new THREE.Vector3(x, interpolatedZ, -interpolatedY);
    });

    return { colors, positions };
  }, [points, originalData, nComponents, progress]);

  const grayness = nComponents < 4 ? progress : 0;

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color={nComponents >= 4 ? colors[i] : `hsl(0, 0%, ${50 - grayness * 20}%)`}
          />
        </mesh>
      ))}
    </group>
  );
};

// 主组件
const PCA3DChart: React.FC<PCA3DChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const { points, originalData = [], nComponents = 4 } = data;
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // 动画循环 (6秒: 100步 × 60ms)
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) return 1;
        return prev + 0.01;
      });
    }, 60);
    return () => clearInterval(timer);
  }, [isPlaying]);

  // 数据变化时重置
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
  }, [data]);

  const handlePlayPause = () => setIsPlaying(!isPlaying);
  const handleReset = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  return (
    <div style={{ height: "100%", background: theme === "dark" ? "#0f172a" : "#ffffff", position: "relative" }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <color attach="background" args={[theme === "dark" ? "#0f172a" : "#ffffff"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} />

        <ScatterPoints points={points} originalData={originalData} nComponents={nComponents} progress={progress} />

        <OrbitControls enableDamping dampingFactor={0.05} />
        <axesHelper args={[5]} />
        <gridHelper args={[10, 10, theme === "dark" ? "#334155" : "#e2e8f0"]} />
      </Canvas>

      <div style={{ position: "absolute", top: 16, right: 16, zIndex: 10 }}>
        <Space>
          <Button
            icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={handlePlayPause}
          />
          <Button icon={<ReloadOutlined />} onClick={handleReset} />
          <span style={{ color: theme === "dark" ? "#fff" : "#000", marginLeft: 8 }}>
            {nComponents}D → {Math.round(progress * 100)}%
          </span>
        </Space>
      </div>
    </div>
  );
};

export default PCA3DChart;
