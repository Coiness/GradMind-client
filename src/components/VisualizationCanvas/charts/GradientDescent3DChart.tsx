import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import { Button, Space } from "antd";
import { PlayCircleOutlined, PauseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import * as THREE from "three";
import { useTheme } from "@/contexts/ThemeContext";
import type { GradientDescentVisualization } from "@/types/computationResult";

interface GradientDescent3DChartProps {
  data: GradientDescentVisualization;
}

// 曲面组件
const Surface: React.FC<{
  functionType: string;
  range: { xMin: number; xMax: number; yMin: number; yMax: number };
}> = ({ functionType, range }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const { xMin, xMax, yMin, yMax } = range;
    const resolution = 100;
    const geometry = new THREE.PlaneGeometry(
      xMax - xMin,
      yMax - yMin,
      resolution,
      resolution
    );

    // 目标函数
    const funcs: Record<string, (x: number, y: number) => number> = {
      bowl: (x, y) => x * x + y * y,
      saddle: (x, y) => x * x - y * y,
      rosenbrock: (x, y) => {
        const val = (1 - x) ** 2 + 100 * (y - x ** 2) ** 2;
        return Math.log(1 + val);
      },
    };

    const func = funcs[functionType] || funcs.bowl;
    const positions = geometry.attributes.position;

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const z = func(x, y);
      positions.setZ(i, z);
    }

    geometry.computeVertexNormals();
    return geometry;
  }, [functionType, range]);

  return (
    <mesh ref={meshRef} geometry={geometry} rotation={[-Math.PI / 2, 0, 0]}>
      <meshStandardMaterial
        color="#4a90e2"
        wireframe={false}
        side={THREE.DoubleSide}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
};

// 路径组件
const PathLine: React.FC<{ points: THREE.Vector3[] }> = ({ points }) => {
  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [points]);

  return (
    <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xff0000 }))} />
  );
};

// 当前点组件
const CurrentPoint: React.FC<{ position: THREE.Vector3 }> = ({ position }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={0.5} />
    </mesh>
  );
};

// 主组件
const GradientDescent3DChart: React.FC<GradientDescent3DChartProps> = ({ data }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<number | null>(null);
  const { theme } = useTheme();

  const { pathPoints, range, functionType } = data;

  // 动画控制
  useEffect(() => {
    if (isPlaying && currentStep < pathPoints.length - 1) {
      timerRef.current = window.setTimeout(() => {
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

  // 转换路径点为 Three.js Vector3
  const pathVectors = useMemo(() => {
    return pathPoints.slice(0, currentStep + 1).map(
      (p) => new THREE.Vector3(p.x, p.z, -p.y)
    );
  }, [pathPoints, currentStep]);

  const currentPosition = useMemo(() => {
    const p = pathPoints[currentStep];
    return new THREE.Vector3(p.x, p.z, -p.y);
  }, [pathPoints, currentStep]);

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
        <span style={{ color: theme === 'dark' ? '#94a3b8' : '#666', fontSize: 12 }}>
          步骤: {currentStep + 1} / {pathPoints.length}
        </span>
      </Space>
      <div style={{ flex: 1, background: theme === 'dark' ? '#0f172a' : '#ffffff' }}>
        <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
          <color attach="background" args={[theme === 'dark' ? '#0f172a' : '#ffffff']} />
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          <Surface functionType={functionType} range={range} />
          {pathVectors.length > 1 && <PathLine points={pathVectors} />}
          <CurrentPoint position={currentPosition} />

          <Grid args={[20, 20]} cellColor={theme === 'dark' ? '#1e293b' : '#e5e7eb'} sectionColor={theme === 'dark' ? '#334155' : '#9ca3af'} />
          <OrbitControls enableDamping dampingFactor={0.05} />
          <axesHelper args={[5]} />
        </Canvas>
      </div>
    </div>
  );
};

export default GradientDescent3DChart;
