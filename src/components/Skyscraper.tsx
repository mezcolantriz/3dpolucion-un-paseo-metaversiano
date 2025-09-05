import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SkyscraperProps } from '../types';
import { AirQualityLevel } from '../types';

export const Skyscraper: React.FC<SkyscraperProps> = ({
  height,
  color,
  position,
  airQuality,
  opacity,
  animationDelay
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Configuración de geometría basada en el nivel de contaminación
  const geometry = useMemo(() => {
    const segments = airQuality === AirQualityLevel.HAZARDOUS ? 16 : 8;
    const baseWidth = 0.1 + (height / 10) * 0.05;
    const baseDepth = baseWidth * 0.8;
    
    return new THREE.BoxGeometry(baseWidth, height, baseDepth, 1, segments, 1);
  }, [height, airQuality]);

  // Material dinámico que cambia según la contaminación
  const material = useMemo(() => {
    const baseColor = new THREE.Color(color);
    const emissiveIntensity = airQuality === AirQualityLevel.HAZARDOUS ? 0.3 : 0.1;
    
    return new THREE.MeshStandardMaterial({
      color: baseColor,
      emissive: baseColor.clone().multiplyScalar(0.2),
      emissiveIntensity,
      metalness: 0.7,
      roughness: 0.3,
      transparent: true,
      opacity: opacity
    });
  }, [color, airQuality, opacity]);

  // Animación de respiración y pulso
  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    const time = state.clock.getElapsedTime() + animationDelay;
    
    // Efecto de respiración más intenso para mayor contaminación
    const breatheIntensity = airQuality === AirQualityLevel.HAZARDOUS ? 0.15 : 0.05;
    const breathe = Math.sin(time * 2) * breatheIntensity + 1;
    
    meshRef.current.scale.y = breathe;
    
    // Efecto de pulso en la emisión
    const pulse = Math.sin(time * 3) * 0.1 + 0.2;
    materialRef.current.emissiveIntensity = pulse * (airQuality === AirQualityLevel.HAZARDOUS ? 0.5 : 0.2);
    
    // Rotación sutil
    meshRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
  });

  // Efectos de partículas para niveles altos de contaminación
  const particleSystem = useMemo(() => {
    if (airQuality !== AirQualityLevel.HAZARDOUS && airQuality !== AirQualityLevel.VERY_POOR) {
      return null;
    }

    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 0.5;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    return (
      <points position={position}>
        <bufferGeometry attach="geometry" {...particles} />
        <pointsMaterial
          attach="material"
          color={color}
          size={0.01}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
    );
  }, [airQuality, height, position, color]);

  return (
    <group position={position}>
      <mesh
        ref={meshRef}
        geometry={geometry}
        material={material}
        position={[0, height / 2, 0]}
      >
        <meshStandardMaterial
          ref={materialRef}
          {...material}
        />
      </mesh>
      
      {/* Base del edificio */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 0.04, 8]} />
        <meshStandardMaterial
          color={new THREE.Color(color).multiplyScalar(0.7)}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      
      {particleSystem}
      
      {/* Luces en las ventanas */}
      <group>
        {Array.from({ length: Math.floor(height * 10) }, (_, i) => (
          <mesh
            key={i}
            position={[
              0.06,
              (i * 0.1) + 0.1,
              Math.random() > 0.5 ? 0.04 : -0.04
            ]}
          >
            <boxGeometry args={[0.01, 0.02, 0.01]} />
            <meshBasicMaterial
              color="#ffff88"
              transparent
              opacity={Math.random() > 0.3 ? 0.8 : 0.2}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};
