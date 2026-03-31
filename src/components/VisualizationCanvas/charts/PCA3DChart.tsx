import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
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
}> = ({ points }) => {
  const positions = useMemo(() => {
    // 直接显示 3D 数据，不压缩
    return points.map((p) => {
      const x = p[0] || 0;
      const y = p[1] || 0;
      const z = p[2] || 0;
      return new THREE.Vector3(x, z, -y);
    });
  }, [points]);

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

// 主组件
const PCA3DChart: React.FC<PCA3DChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const { points } = data;

  return (
    <div style={{ height: "100%", background: theme === "dark" ? "#0f172a" : "#ffffff" }}>
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }}>
        <color attach="background" args={[theme === "dark" ? "#0f172a" : "#ffffff"]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        <pointLight position={[-5, -5, -5]} intensity={0.4} />

        <ScatterPoints points={points} progress={0} />

        <OrbitControls enableDamping dampingFactor={0.05} />
        <axesHelper args={[3]} />
      </Canvas>
    </div>
  );
};

export default PCA3DChart;
