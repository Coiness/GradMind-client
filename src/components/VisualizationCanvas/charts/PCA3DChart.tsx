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

// 主成分箭头组件
const PCArrows: React.FC<{
  components: number[][];
  nComponents: number;
}> = ({ components, nComponents }) => {
  const arrows = useMemo(() => {
    const colors = ["#ff0000", "#00ff00", "#0000ff"];
    const widths = [0.15, 0.1, 0.05];
    // 箭头数量 = min(nComponents, 3)
    const arrowCount = Math.min(nComponents, 3);
    return components.slice(0, arrowCount).map((comp, i) => ({
      direction: new THREE.Vector3(comp[0], comp[2], -comp[1]).normalize(),
      color: colors[i],
      width: widths[i],
    }));
  }, [components, nComponents]);

  return (
    <group>
      {arrows.map((arrow, i) => (
        <arrowHelper
          key={i}
          args={[arrow.direction, new THREE.Vector3(0, 0, 0), 3, arrow.color, 0.3, 0.2]}
        />
      ))}
    </group>
  );
};

// 散点组件
const ScatterPoints: React.FC<{
  originalData: number[][];
  components: number[][];
  nComponents: number;
  progress: number;
}> = ({ originalData, components, nComponents, progress }) => {
  const { colors, positions } = useMemo(() => {
    // 颜色：nComponents >= 4 时彩色，否则灰色
    const shouldShowColor = nComponents >= 4;
    const fourthDimValues = originalData.map((p) => p[3] || 0);
    const min = Math.min(...fourthDimValues);
    const max = Math.max(...fourthDimValues);

    const colors = shouldShowColor
      ? fourthDimValues.map((val) => mapValueToColor(val, min, max))
      : originalData.map(() => '#808080');

    // 计算投影
    const projected = originalData.map((point) => {
      // 当 nComponents >= 3 时，不投影，使用原始前 3 维
      if (nComponents >= 3) {
        return [point[0], point[1], point[2], point[3]];
      }

      // 当 nComponents < 3 时，投影到前 nComponents 个主成分
      const result = [0, 0, 0, point[3]]; // 第 4 维保持不变

      for (let i = 0; i < nComponents; i++) {
        const dot = point.reduce((sum, val, j) => sum + val * components[i][j], 0);
        for (let j = 0; j < 3; j++) {
          result[j] += dot * components[i][j];
        }
      }

      return result;
    });

    const positions = originalData.map((orig, i) => {
      const proj = projected[i];
      const x = orig[0] * (1 - progress) + proj[0] * progress;
      const y = orig[1] * (1 - progress) + proj[1] * progress;
      const z = orig[2] * (1 - progress) + proj[2] * progress;
      return new THREE.Vector3(x, z, -y);
    });

    return { colors, positions };
  }, [originalData, components, nComponents, progress]);

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={colors[i]} />
        </mesh>
      ))}
    </group>
  );
};

// 主组件
const PCA3DChart: React.FC<PCA3DChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const { components, originalData = [], nComponents = 4 } = data;
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  if (!components || components.length === 0) {
    return <div style={{ padding: 20, color: "red" }}>错误：缺少主成分数据</div>;
  }

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

        <PCArrows components={components} nComponents={nComponents} />
        <ScatterPoints originalData={originalData} components={components} nComponents={nComponents} progress={progress} />

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
