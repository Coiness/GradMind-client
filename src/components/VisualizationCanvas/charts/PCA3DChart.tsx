import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Button, Space } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import * as THREE from "three";
import { useTheme } from "@/contexts/ThemeContext";
import type { PCAVisualization } from "@/types/computationResult";

interface PCA3DChartProps {
  data: PCAVisualization;
}

// 散点组件
const ScatterPoints: React.FC<{
  points: number[][];
  progress: number;
}> = ({ points, progress }) => {
  const positions = useMemo(() => {
    // 假设原始数据是 3D（前3个主成分）
    // progress: 0 = 3D原始位置, 1 = 2D平面（z=0）
    return points.map((p) => {
      const x = p[0] || 0;
      const y = p[1] || 0;
      const z = (p[2] || 0) * (1 - progress); // 逐渐压缩到 z=0
      return new THREE.Vector3(x, z, -y);
    });
  }, [points, progress]);

  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#4a90e2" />
        </mesh>
      ))}
    </group>
  );
};

// 2D 平面组件
const TargetPlane: React.FC<{ opacity: number }> = ({ opacity }) => {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#cccccc"
        transparent
        opacity={opacity * 0.3}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};

// 主组件
const PCA3DChart: React.FC<PCA3DChartProps> = ({ data }) => {
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<number | null>(null);
  const { theme } = useTheme();

  const { points } = data;

  // 动画控制：从 3D 逐渐压缩到 2D
  useEffect(() => {
    if (isPlaying && progress < 1) {
      timerRef.current = window.setTimeout(() => {
        setProgress((prev) => Math.min(prev + 0.01, 1));
      }, 30);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, progress]);

  // 重置动画
  useEffect(() => {
    setProgress(0);
    setIsPlaying(true);
  }, [data]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Space style={{ marginBottom: 8 }}>
        <Button
          icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
          onClick={() => setIsPlaying(!isPlaying)}
          disabled={progress >= 1}
        >
          {isPlaying ? "暂停" : "播放"}
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={() => {
            setProgress(0);
            setIsPlaying(true);
          }}
        >
          重置
        </Button>
        <span style={{ color: theme === "dark" ? "#94a3b8" : "#666", fontSize: 12 }}>
          降维进度: {Math.round(progress * 100)}%
        </span>
      </Space>
      <div style={{ flex: 1, background: theme === "dark" ? "#0f172a" : "#ffffff" }}>
        <Canvas camera={{ position: [8, 8, 8], fov: 50 }}>
          <color attach="background" args={[theme === "dark" ? "#0f172a" : "#ffffff"]} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <pointLight position={[-5, -5, -5]} intensity={0.4} />

          <ScatterPoints points={points} progress={progress} />
          <TargetPlane opacity={progress} />

          <OrbitControls enableDamping dampingFactor={0.05} />
          <axesHelper args={[3]} />
        </Canvas>
      </div>
    </div>
  );
};

export default PCA3DChart;
