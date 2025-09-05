import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { AirQualityLevel } from '../types';

export const SkyscraperCluster: React.FC<{
  aqi: number;
  position: [number, number, number];
  color: string;
  airQuality: AirQualityLevel;
}> = ({ aqi, position, color }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  // Determinar número de rascacielos según AQI
  const buildingCount = useMemo(() => {
    if (aqi <= 2) return Math.max(1, aqi); // 1-2 edificios pequeños
    if (aqi === 3) return 3; // 3 edificios medianos
    if (aqi === 4) return 4; // 4 edificios altos
    if (aqi >= 5) return 5; // 5 edificios gigantes
    return 1;
  }, [aqi]);

  // Configuración de edificios
  const buildings = useMemo(() => {
    const buildingsConfig = [];
    const baseHeight = 0.3;
    const heightMultiplier = aqi * 0.4;
    
    for (let i = 0; i < buildingCount; i++) {
      const angle = (i / buildingCount) * Math.PI * 2;
      const radius = 0.15;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      
      // Altura variable pero creciente con AQI
      const height = baseHeight + heightMultiplier + (Math.random() * 0.3);
      const width = 0.06 + (aqi / 10);
      const depth = width * 0.8;
      
      buildingsConfig.push({
        position: [x, height / 2, z] as [number, number, number],
        height,
        width,
        depth,
        intensity: 0.1 + (aqi / 10)
      });
    }
    
    return buildingsConfig;
  }, [buildingCount, aqi]);

  // Animación del grupo
  useFrame((state) => {
    if (!groupRef.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Rotación suave del conjunto
    groupRef.current.rotation.y = time * 0.1;
    
    // Efecto de "respiración" más intenso para mayor contaminación
    const breatheIntensity = aqi >= 4 ? 0.1 : 0.05;
    const breathe = Math.sin(time * 2) * breatheIntensity + 1;
    groupRef.current.scale.y = breathe;
  });

  // Sistema de partículas para contaminación alta
  const ParticleSystem = useMemo(() => {
    if (aqi < 4) return null;
    
    const particleCount = aqi * 20;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 1;
      positions[i * 3 + 1] = Math.random() * 2;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 1;
    }
    
    return (
      <points position={[0, 1, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
            args={[positions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          color={color}
          size={0.02}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    );
  }, [aqi, color]);

  return (
    <group ref={groupRef} position={position}>
      {/* Edificios del cluster */}
      {buildings.map((building, index) => (
        <Building
          key={index}
          position={building.position}
          height={building.height}
          width={building.width}
          depth={building.depth}
          color={color}
          intensity={building.intensity}
          aqi={aqi}
          delay={index * 0.2}
        />
      ))}
      
      {/* Sistema de partículas para contaminación alta */}
      {ParticleSystem}
      
      {/* Base circular del cluster */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.25, 0.3, 0.02, 12]} />
        <meshStandardMaterial
          color={new THREE.Color(color).multiplyScalar(0.6)}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>
      
      {/* Efectos de niebla para contaminación extrema */}
      {aqi >= 5 && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.4, 16, 16]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  );
};

// Componente individual de edificio
const Building: React.FC<{
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  color: string;
  intensity: number;
  aqi: number;
  delay: number;
}> = ({ position, height, width, depth, color, intensity, aqi, delay }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Animación individual del edificio
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;
    
    const time = state.clock.getElapsedTime() + delay;
    
    // Pulsación más intensa para mayor contaminación
    const pulse = Math.sin(time * 3) * (intensity * 2) + intensity;
    materialRef.current.emissiveIntensity = pulse;
    
    // Movimiento sutil
    meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.02;
  });

  // Geometría con más detalle para edificios grandes
  const geometry = useMemo(() => {
    const segments = aqi >= 4 ? 2 : 1;
    return new THREE.BoxGeometry(width, height, depth, 1, segments, 1);
  }, [width, height, depth, aqi]);

  // Material dinámico
  const material = useMemo(() => {
    const baseColor = new THREE.Color(color);
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor.clone().multiplyScalar(0.3),
      emissiveIntensity: intensity,
      metalness: 0.7,
      roughness: 0.2,
      transparent: true,
      opacity: 0.9
    });
  }, [color, intensity]);

  return (
    <>
      <mesh
        ref={meshRef}
        position={position}
        geometry={geometry}
      >
        <meshStandardMaterial
          ref={materialRef}
          {...material}
        />
      </mesh>
      
      {/* Ventanas iluminadas */}
      <Windows
        position={position}
        height={height}
        width={width}
        depth={depth}
        buildingIndex={delay}
      />
    </>
  );
};

// Componente de ventanas iluminadas
const Windows: React.FC<{
  position: [number, number, number];
  height: number;
  width: number;
  depth: number;
  buildingIndex: number;
}> = ({ position, height, width, depth, buildingIndex }) => {
  const windows = useMemo(() => {
    const windowsArray = [];
    const floors = Math.floor(height * 15);
    const windowsPerFloor = 3;
    
    for (let floor = 0; floor < floors; floor++) {
      for (let window = 0; window < windowsPerFloor; window++) {
        const y = (floor / floors) * height + position[1] - height / 2 + 0.1;
        const x = position[0] + (window - 1) * (width / 4);
        const z = position[2] + depth / 2 + 0.001;
        
        // Probabilidad de ventana encendida
        const isLit = Math.random() > 0.4;
        
        if (isLit) {
          windowsArray.push({
            position: [x, y, z] as [number, number, number],
            key: `${buildingIndex}-${floor}-${window}`
          });
        }
      }
    }
    
    return windowsArray;
  }, [height, width, depth, position, buildingIndex]);

  return (
    <>
      {windows.map((window) => (
        <mesh key={window.key} position={window.position}>
          <boxGeometry args={[0.015, 0.02, 0.001]} />
          <meshBasicMaterial
            color="#ffff88"
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </>
  );
};
