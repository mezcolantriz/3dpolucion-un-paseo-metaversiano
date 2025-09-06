import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import styled from 'styled-components';
import * as THREE from 'three';
import { SkyscraperCluster } from './SkyscraperCluster';
import type { AirQualityData } from '../types';
import { AirQualityColors } from '../types';
import { geoToScenePosition, isDayTime } from '../utils';

interface Mountain3DProps {
  position: [number, number, number];
  size: number;
  color: string;
}

// Componente Mountain para añadir montañas realistas
const Mountain: React.FC<Mountain3DProps> = ({ position, size, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const mountainGeometry = useMemo(() => {
    const geometry = new THREE.ConeGeometry(size * 1.5, size * 2, 8);
    return geometry;
  }, [size]);
  
  useFrame(() => {
    if (meshRef.current) {
      // Animación muy sutil
      meshRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh ref={meshRef} position={position} castShadow receiveShadow geometry={mountainGeometry}>
      <meshStandardMaterial
        color={color}
        roughness={0.9}
        metalness={0.1}
      />
    </mesh>
  );
};

interface VegetationProps {
  position: [number, number, number];
  density: number; // 0-1 basado en calidad del aire
  type: 'trees' | 'bushes' | 'grass';
}

// Componente de vegetación basado en calidad del aire
const Vegetation: React.FC<VegetationProps> = ({ position, density, type }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      // Animación sutil de vegetación
      groupRef.current.rotation.y = Math.sin(Date.now() * 0.0008) * 0.05;
    }
  });

  const getVegetationElements = () => {
    const elements = [];
    const count = Math.floor(density * 10); // Más vegetación = mejor aire
    
    for (let i = 0; i < count; i++) {
      const offsetX = (Math.random() - 0.5) * 4;
      const offsetZ = (Math.random() - 0.5) * 4;
      const offsetY = 0.2;
      
      if (type === 'trees') {
        elements.push(
          <mesh key={`tree-${i}`} position={[offsetX, offsetY, offsetZ]} castShadow>
            {/* Tronco */}
            <cylinderGeometry args={[0.1, 0.15, 0.8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
        );
        elements.push(
          <mesh key={`leaves-${i}`} position={[offsetX, offsetY + 0.6, offsetZ]} castShadow>
            {/* Hojas */}
            <sphereGeometry args={[0.4]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        );
      } else if (type === 'bushes') {
        elements.push(
          <mesh key={`bush-${i}`} position={[offsetX, offsetY * 0.5, offsetZ]} castShadow>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial color="#32CD32" />
          </mesh>
        );
      } else if (type === 'grass') {
        elements.push(
          <mesh key={`grass-${i}`} position={[offsetX, offsetY * 0.2, offsetZ]}>
            <cylinderGeometry args={[0.02, 0.02, 0.1]} />
            <meshStandardMaterial color="#90EE90" />
          </mesh>
        );
      }
    }
    
    return elements;
  };

  return (
    <group ref={groupRef} position={position}>
      {getVegetationElements()}
    </group>
  );
};

interface SpanishLandmarkProps {
  position: [number, number, number];
  type: 'cathedral' | 'castle' | 'bridge' | 'lighthouse' | 'windmill';
  size: number;
}

// Componente para monumentos y elementos característicos de España
const SpanishLandmark: React.FC<SpanishLandmarkProps> = ({ position, type, size }) => {
  const meshRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // Animación muy sutil para monumentos
      meshRef.current.rotation.y = Math.sin(Date.now() * 0.0003) * 0.02;
    }
  });

  const getLandmarkGeometry = () => {
    switch (type) {
      case 'cathedral':
        return (
          <>
            {/* Base de la catedral */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <boxGeometry args={[size, size, size]} />
              <meshStandardMaterial color="#D2B48C" />
            </mesh>
            {/* Torre principal */}
            <mesh position={[0, size + 0.5, 0]} castShadow>
              <cylinderGeometry args={[size * 0.3, size * 0.4, size]} />
              <meshStandardMaterial color="#DEB887" />
            </mesh>
            {/* Cúpula */}
            <mesh position={[0, size * 1.8, 0]} castShadow>
              <sphereGeometry args={[size * 0.4]} />
              <meshStandardMaterial color="#CD853F" />
            </mesh>
          </>
        );
      
      case 'castle':
        return (
          <>
            {/* Torre principal del castillo */}
            <mesh position={[0, 0.8, 0]} castShadow>
              <cylinderGeometry args={[size * 0.6, size * 0.8, size * 1.5]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
            {/* Torres laterales */}
            <mesh position={[-size * 0.8, 0.6, 0]} castShadow>
              <cylinderGeometry args={[size * 0.4, size * 0.5, size]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
            <mesh position={[size * 0.8, 0.6, 0]} castShadow>
              <cylinderGeometry args={[size * 0.4, size * 0.5, size]} />
              <meshStandardMaterial color="#8B7355" />
            </mesh>
          </>
        );
      
      case 'windmill':
        return (
          <>
            {/* Base del molino */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[size * 0.3, size * 0.4, size]} />
              <meshStandardMaterial color="#F5F5DC" />
            </mesh>
            {/* Aspas del molino */}
            <mesh position={[0, size + 0.2, 0]} rotation={[0, 0, Date.now() * 0.001]} castShadow>
              <boxGeometry args={[size * 1.2, 0.05, 0.1]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
            <mesh position={[0, size + 0.2, 0]} rotation={[0, 0, Date.now() * 0.001 + Math.PI/2]} castShadow>
              <boxGeometry args={[size * 1.2, 0.05, 0.1]} />
              <meshStandardMaterial color="#8B4513" />
            </mesh>
          </>
        );
      
      case 'lighthouse':
        return (
          <>
            {/* Base del faro */}
            <mesh position={[0, 0.5, 0]} castShadow>
              <cylinderGeometry args={[size * 0.4, size * 0.6, size]} />
              <meshStandardMaterial color="#F5F5F5" />
            </mesh>
            {/* Linterna del faro */}
            <mesh position={[0, size + 0.3, 0]} castShadow>
              <cylinderGeometry args={[size * 0.3, size * 0.3, size * 0.4]} />
              <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.3} />
            </mesh>
          </>
        );
      
      default:
        return null;
    }
  };

  return (
    <group ref={meshRef} position={position}>
      {getLandmarkGeometry()}
    </group>
  );
};

interface AtmosphericParticlesProps {
  data: AirQualityData[];
}

// Sistema de partículas atmosféricas basado en calidad del aire
const AtmosphericParticles: React.FC<AtmosphericParticlesProps> = ({ data }) => {
  const particlesRef = useRef<THREE.Points>(null);
  
  const particleSystem = useMemo(() => {
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    // Crear partículas distribuidas por España
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Distribución aleatoria en área de España
      positions[i3] = (Math.random() - 0.5) * 50;     // x
      positions[i3 + 1] = Math.random() * 8 + 2;      // y (altura)
      positions[i3 + 2] = (Math.random() - 0.5) * 40; // z
      
      // Encontrar la ciudad más cercana para determinar color
      const x = positions[i3];
      const z = positions[i3 + 2];
      
      let closestAQI = 3; // AQI por defecto
      let minDistance = Infinity;
      
      data.forEach(cityData => {
        const [cityX, , cityZ] = geoToScenePosition(cityData.location.latitude, cityData.location.longitude);
        const distance = Math.sqrt((x - cityX) ** 2 + (z - cityZ) ** 2);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestAQI = cityData.measurements.aqi;
        }
      });
      
      // Color basado en AQI
      if (closestAQI <= 2) {
        // Aire limpio: partículas azules/verdes
        colors[i3] = 0.2;     // r
        colors[i3 + 1] = 0.8; // g
        colors[i3 + 2] = 0.6; // b
        sizes[i] = Math.random() * 0.02 + 0.01;
      } else if (closestAQI <= 3) {
        // Aire moderado: partículas amarillas
        colors[i3] = 0.8;     // r
        colors[i3 + 1] = 0.8; // g
        colors[i3 + 2] = 0.2; // b
        sizes[i] = Math.random() * 0.03 + 0.02;
      } else {
        // Aire contaminado: partículas rojas/naranjas
        colors[i3] = 0.9;     // r
        colors[i3 + 1] = 0.3; // g
        colors[i3 + 2] = 0.1; // b
        sizes[i] = Math.random() * 0.05 + 0.03;
      }
    }
    
    return { positions, colors, sizes, particleCount };
  }, [data]);
  
  useFrame(() => {
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array;
      
      // Animación de partículas flotando
      for (let i = 0; i < particleSystem.particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.01; // Movimiento Y
        positions[i3] += Math.cos(Date.now() * 0.0005 + i) * 0.005;   // Movimiento X
      }
      
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
      particlesRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particleSystem.positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[particleSystem.colors, 3]}
        />
        <bufferAttribute
          attach="attributes-size"
          args={[particleSystem.sizes, 1]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.03}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation={true}
      />
    </points>
  );
};

const Canvas3DContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100vh;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
`;

const LegendContainer = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  z-index: 200;
  max-width: 250px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const LegendTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-align: center;
`;

const LegendSection = styled.div`
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const LegendSectionTitle = styled.h4`
  margin: 0 0 6px 0;
  font-size: 11px;
  font-weight: 500;
  color: #ccc;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  gap: 8px;
`;

const LegendColor = styled.div<{ color: string; size?: string }>`
  width: ${props => props.size || '12px'};
  height: ${props => props.size || '12px'};
  background: ${props => props.color};
  border-radius: 2px;
  flex-shrink: 0;
`;

const LegendText = styled.span`
  font-size: 10px;
  color: #ddd;
`;

const WeatherInfo = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px;
  color: white;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  z-index: 200;
  min-width: 180px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

// Componente de Leyenda del Mapa 3D
const Map3DLegend: React.FC = () => {
  return (
    <LegendContainer>
      <LegendTitle>🗺️ Leyenda del Mapa</LegendTitle>
      
      <LegendSection>
        <LegendSectionTitle>Calidad del Aire</LegendSectionTitle>
        <LegendItem>
          <LegendColor color="#22c55e" />
          <LegendText>Excelente (AQI 1-2)</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#84cc16" />
          <LegendText>Buena (AQI 2-3)</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#eab308" />
          <LegendText>Moderada (AQI 3-4)</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#f97316" />
          <LegendText>Mala (AQI 4-5)</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#ef4444" />
          <LegendText>Muy Mala (AQI 5+)</LegendText>
        </LegendItem>
      </LegendSection>

      <LegendSection>
        <LegendSectionTitle>Elementos del Mapa</LegendSectionTitle>
        <LegendItem>
          <LegendColor color="#8B4513" size="8px" />
          <LegendText>🏔️ Montañas</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#4682B4" size="8px" />
          <LegendText>🌊 Ríos y Mar</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#228B22" size="8px" />
          <LegendText>🌳 Vegetación</LegendText>
        </LegendItem>
        <LegendItem>
          <LegendColor color="#D2B48C" size="8px" />
          <LegendText>🏰 Monumentos</LegendText>
        </LegendItem>
      </LegendSection>

      <LegendSection>
        <LegendSectionTitle>Interacciones</LegendSectionTitle>
        <LegendText style={{ fontSize: '9px', lineHeight: '1.3' }}>
          🖱️ Click: Seleccionar ciudad<br/>
          🎯 Zoom: Rueda del ratón<br/>
          🔄 Rotar: Arrastrar<br/>
          📊 Más edificios = Mayor contaminación
        </LegendText>
      </LegendSection>
    </LegendContainer>
  );
};

interface PollutionElementsProps {
  position: [number, number, number];
  aqi: number;
  weatherMain?: string;
}

// Componente para elementos de contaminación basados en AQI
const PollutionElements: React.FC<PollutionElementsProps> = ({ position, aqi, weatherMain }) => {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      // Rotación según nivel de contaminación
      groupRef.current.rotation.y += (aqi / 50) * 0.005;
    }
  });

  const getContaminationLevel = () => {
    if (aqi <= 2) return 'excellent';
    if (aqi <= 3) return 'good';
    if (aqi <= 4) return 'moderate';
    if (aqi <= 5) return 'poor';
    return 'very_poor';
  };

  const level = getContaminationLevel();

  return (
    <group ref={groupRef} position={position}>
      {/* MODERADA (AQI 3-4): Chimeneas ligeras y algo de tráfico */}
      {level === 'moderate' && (
        <>
          {/* Chimeneas pequeñas */}
          <mesh position={[1, 0.3, 1]} castShadow>
            <cylinderGeometry args={[0.05, 0.05, 0.6]} />
            <meshStandardMaterial color="#696969" />
          </mesh>
          <mesh position={[-1, 0.3, -1]} castShadow>
            <cylinderGeometry args={[0.04, 0.04, 0.5]} />
            <meshStandardMaterial color="#696969" />
          </mesh>
          
          {/* Humo ligero */}
          <mesh position={[1, 0.8, 1]}>
            <sphereGeometry args={[0.1]} />
            <meshBasicMaterial color="#E0E0E0" transparent opacity={0.3} />
          </mesh>
          
          {/* Tráfico básico (cubos pequeños móviles) */}
          <mesh position={[0.5, 0.05, 0]} castShadow>
            <boxGeometry args={[0.15, 0.08, 0.05]} />
            <meshStandardMaterial color="#FF6B35" />
          </mesh>
        </>
      )}

      {/* MALA (AQI 4-5): Más industria y tráfico pesado */}
      {level === 'poor' && (
        <>
          {/* Chimeneas más grandes */}
          <mesh position={[1.5, 0.4, 1]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.8]} />
            <meshStandardMaterial color="#4A4A4A" />
          </mesh>
          <mesh position={[-1.5, 0.4, -1]} castShadow>
            <cylinderGeometry args={[0.07, 0.07, 0.7]} />
            <meshStandardMaterial color="#4A4A4A" />
          </mesh>
          <mesh position={[0, 0.35, 1.5]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 0.7]} />
            <meshStandardMaterial color="#4A4A4A" />
          </mesh>
          
          {/* Humo más denso */}
          <mesh position={[1.5, 1, 1]}>
            <sphereGeometry args={[0.15]} />
            <meshBasicMaterial color="#C0C0C0" transparent opacity={0.5} />
          </mesh>
          <mesh position={[-1.5, 1, -1]}>
            <sphereGeometry args={[0.12]} />
            <meshBasicMaterial color="#C0C0C0" transparent opacity={0.4} />
          </mesh>
          
          {/* Tráfico pesado */}
          <mesh position={[0.8, 0.06, 0]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.08]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
          <mesh position={[-0.8, 0.06, 0.2]} castShadow>
            <boxGeometry args={[0.18, 0.09, 0.07]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        </>
      )}

      {/* MUY MALA (AQI 5+): Complejo industrial, smog denso */}
      {(level === 'very_poor') && (
        <>
          {/* Complejo industrial */}
          <mesh position={[2, 0.5, 1]} castShadow>
            <cylinderGeometry args={[0.12, 0.12, 1]} />
            <meshStandardMaterial color="#2F2F2F" />
          </mesh>
          <mesh position={[-2, 0.45, -1]} castShadow>
            <cylinderGeometry args={[0.1, 0.1, 0.9]} />
            <meshStandardMaterial color="#2F2F2F" />
          </mesh>
          <mesh position={[0, 0.4, 2]} castShadow>
            <cylinderGeometry args={[0.09, 0.09, 0.8]} />
            <meshStandardMaterial color="#2F2F2F" />
          </mesh>
          <mesh position={[1, 0.4, -2]} castShadow>
            <cylinderGeometry args={[0.08, 0.08, 0.8]} />
            <meshStandardMaterial color="#2F2F2F" />
          </mesh>
          
          {/* Edificios industriales */}
          <mesh position={[1.5, 0.2, 0]} castShadow>
            <boxGeometry args={[0.3, 0.4, 0.2]} />
            <meshStandardMaterial color="#3A3A3A" />
          </mesh>
          <mesh position={[-1.5, 0.15, 0]} castShadow>
            <boxGeometry args={[0.25, 0.3, 0.18]} />
            <meshStandardMaterial color="#3A3A3A" />
          </mesh>
          
          {/* Smog denso (niebla contaminante) */}
          <mesh position={[0, 0.8, 0]}>
            <sphereGeometry args={[1.2]} />
            <meshBasicMaterial color="#8B4513" transparent opacity={0.15} />
          </mesh>
          <mesh position={[2, 1.2, 1]}>
            <sphereGeometry args={[0.3]} />
            <meshBasicMaterial color="#A0522D" transparent opacity={0.6} />
          </mesh>
          <mesh position={[-2, 1.1, -1]}>
            <sphereGeometry args={[0.25]} />
            <meshBasicMaterial color="#A0522D" transparent opacity={0.5} />
          </mesh>
          
          {/* Tráfico congestionado */}
          <mesh position={[1.2, 0.07, 0.3]} castShadow>
            <boxGeometry args={[0.25, 0.12, 0.1]} />
            <meshStandardMaterial color="#800000" />
          </mesh>
          <mesh position={[-1.2, 0.07, -0.3]} castShadow>
            <boxGeometry args={[0.22, 0.11, 0.09]} />
            <meshStandardMaterial color="#8B0000" />
          </mesh>
          <mesh position={[0.3, 0.06, 1.2]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.08]} />
            <meshStandardMaterial color="#A0522D" />
          </mesh>
        </>
      )}

      {/* Efectos meteorológicos adicionales */}
      {weatherMain === 'Rain' && aqi > 3 && (
        <mesh position={[0, 0.5, 0]}>
          <sphereGeometry args={[0.8]} />
          <meshBasicMaterial color="#4A4A4A" transparent opacity={0.1} />
        </mesh>
      )}
    </group>
  );
};

interface WeatherEffectsProps {
  data: AirQualityData[];
}

// Efectos meteorológicos visuales
const WeatherEffects: React.FC<WeatherEffectsProps> = ({ data }) => {
  const rainParticlesRef = useRef<THREE.Points>(null);
  const snowParticlesRef = useRef<THREE.Points>(null);
  
  // Contar ciudades por tipo de clima
  const weatherStats = useMemo(() => {
    const stats = data.reduce((acc, city) => {
      const weather = city.weather?.main || 'Clear';
      acc[weather] = (acc[weather] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return stats;
  }, [data]);

  // Generar partículas de lluvia
  const rainParticles = useMemo(() => {
    const rainyCities = data.filter(city => 
      city.weather?.main === 'Rain' || city.weather?.main === 'Drizzle'
    );
    
    if (rainyCities.length === 0) return null;
    
    const particleCount = rainyCities.length * 50;
    const positions = new Float32Array(particleCount * 3);
    
    rainyCities.forEach((city, cityIndex) => {
      const [cityX, , cityZ] = geoToScenePosition(city.location.latitude, city.location.longitude);
      
      for (let i = 0; i < 50; i++) {
        const index = (cityIndex * 50 + i) * 3;
        positions[index] = cityX + (Math.random() - 0.5) * 6;     // x
        positions[index + 1] = Math.random() * 8 + 2;            // y
        positions[index + 2] = cityZ + (Math.random() - 0.5) * 6; // z
      }
    });
    
    return { positions, particleCount };
  }, [data]);

  // Generar partículas de nieve
  const snowParticles = useMemo(() => {
    const snowyCities = data.filter(city => city.weather?.main === 'Snow');
    
    if (snowyCities.length === 0) return null;
    
    const particleCount = snowyCities.length * 30;
    const positions = new Float32Array(particleCount * 3);
    
    snowyCities.forEach((city, cityIndex) => {
      const [cityX, , cityZ] = geoToScenePosition(city.location.latitude, city.location.longitude);
      
      for (let i = 0; i < 30; i++) {
        const index = (cityIndex * 30 + i) * 3;
        positions[index] = cityX + (Math.random() - 0.5) * 5;     // x
        positions[index + 1] = Math.random() * 6 + 3;            // y
        positions[index + 2] = cityZ + (Math.random() - 0.5) * 5; // z
      }
    });
    
    return { positions, particleCount };
  }, [data]);

  useFrame(() => {
    // Animación de lluvia
    if (rainParticlesRef.current && rainParticles) {
      const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < rainParticles.particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] -= 0.1; // Caída vertical
        
        // Reiniciar partícula si llega al suelo
        if (positions[i3 + 1] < 0) {
          positions[i3 + 1] = 10;
        }
      }
      
      rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animación de nieve
    if (snowParticlesRef.current && snowParticles) {
      const positions = snowParticlesRef.current.geometry.attributes.position.array as Float32Array;
      
      for (let i = 0; i < snowParticles.particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] -= 0.03; // Caída más lenta
        positions[i3] += Math.sin(Date.now() * 0.001 + i) * 0.01; // Movimiento lateral
        
        // Reiniciar partícula si llega al suelo
        if (positions[i3 + 1] < 0) {
          positions[i3 + 1] = 8;
        }
      }
      
      snowParticlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Partículas de lluvia */}
      {rainParticles && (
        <points ref={rainParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[rainParticles.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#4FC3F7"
            size={0.02}
            transparent
            opacity={0.6}
          />
        </points>
      )}

      {/* Partículas de nieve */}
      {snowParticles && (
        <points ref={snowParticlesRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              args={[snowParticles.positions, 3]}
            />
          </bufferGeometry>
          <pointsMaterial
            color="#FFFFFF"
            size={0.03}
            transparent
            opacity={0.8}
          />
        </points>
      )}
    </>
  );
};

const ControlPanel = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 16px;
  z-index: 1001;
  min-width: 200px;
`;

const ControlButton = styled.button<{ active?: boolean }>`
  display: block;
  width: 100%;
  margin-bottom: 8px;
  padding: 8px 12px;
  background: ${props => props.active ? '#667eea' : 'rgba(255, 255, 255, 0.8)'};
  color: ${props => props.active ? 'white' : '#2d3748'};
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#5a6fd8' : '#f7fafc'};
    transform: translateY(-1px);
  }
`;

const InfoDisplay = styled.div`
  font-size: 11px;
  color: #4a5568;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

interface Spain3DMapProps {
  airQualityData: AirQualityData[];
  selectedLocation: AirQualityData | null;
  onLocationSelect?: (location: AirQualityData | null) => void;
  // Props para sincronizar filtros con el panel izquierdo
  globalSearchTerm?: string;
  globalSelectedFilters?: any[];
  globalSortBy?: 'aqi' | 'name' | 'pm25';
}

// Componente principal del mapa 3D
export const Spain3DMap: React.FC<Spain3DMapProps> = ({ 
  airQualityData, 
  selectedLocation,
  onLocationSelect,
  globalSearchTerm = '',
  globalSelectedFilters = [],
  globalSortBy = 'aqi'
}) => {
  const [cameraMode, setCameraMode] = useState<'orbit' | 'fly' | 'overview'>('orbit');
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [dayTime, setDayTime] = useState(isDayTime());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'good' | 'moderate' | 'poor'>('all');

  // Usar filtros globales si están disponibles, sino usar los locales
  const effectiveSearchTerm = globalSearchTerm || searchTerm;
  const effectiveFilters = globalSelectedFilters;

  // Filtrar datos localmente en el mapa 3D - MOSTRAR TODAS POR DEFECTO
  const localFilteredData = useMemo(() => {
    let filtered = airQualityData;
    
    // Si NO hay filtros globales activos, mostrar TODAS las ciudades
    const hasActiveFilters = globalSelectedFilters && globalSelectedFilters.length > 0;
    const hasSearchTerm = effectiveSearchTerm && effectiveSearchTerm.trim() !== '';
    
    // Solo filtrar si hay búsqueda activa
    if (hasSearchTerm) {
      filtered = filtered.filter((location: AirQualityData) =>
        location.location.name.toLowerCase().includes(effectiveSearchTerm.toLowerCase())
      );
    }
    
    // Solo filtrar por calidad si hay filtros globales activos
    if (hasActiveFilters) {
      filtered = filtered.filter((location: AirQualityData) => {
        return globalSelectedFilters.includes(location.quality);
      });
    }
    
    // Si no hay filtros activos, mostrar TODAS las ciudades
    if (!hasActiveFilters && !hasSearchTerm) {
      filtered = airQualityData; // TODAS las 70+ ciudades visibles
    }
    
    // Aplicar filtro local solo si no hay filtros globales
    if (!hasActiveFilters && selectedFilter !== 'all') {
      filtered = filtered.filter((location: AirQualityData) => {
        switch (selectedFilter) {
          case 'good':
            return location.measurements.aqi <= 2;
          case 'moderate':
            return location.measurements.aqi === 3;
          case 'poor':
            return location.measurements.aqi >= 4;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [airQualityData, effectiveSearchTerm, effectiveFilters, selectedFilter]);

  return (
    <Canvas3DContainer>
      {/* Leyenda del Mapa 3D */}
      <Map3DLegend />
      
      <ControlPanel>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
          Vista 3D España
        </h4>
        
        <ControlButton 
          active={cameraMode === 'overview'} 
          onClick={() => setCameraMode('overview')}
        >
          📍 Vista General
        </ControlButton>
        
        <ControlButton 
          active={cameraMode === 'orbit'} 
          onClick={() => setCameraMode('orbit')}
        >
          🌍 Órbita Libre
        </ControlButton>
        
        <ControlButton 
          active={cameraMode === 'fly'} 
          onClick={() => setCameraMode('fly')}
        >
          ✈️ Vuelo Automático
        </ControlButton>
        
        <ControlButton 
          active={showAtmosphere} 
          onClick={() => setShowAtmosphere(!showAtmosphere)}
        >
          {showAtmosphere ? '🌫️' : '☀️'} Atmósfera
        </ControlButton>
        
        <ControlButton 
          active={dayTime} 
          onClick={() => setDayTime(!dayTime)}
        >
          {dayTime ? '☀️' : '🌙'} {dayTime ? 'Día' : 'Noche'}
        </ControlButton>
        
        {/* Controles de filtrado */}
        <div style={{ margin: '12px 0', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '12px' }}>
          <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600' }}>🔍 Filtros</h5>
          
          <input
            type="text"
            placeholder="Buscar ciudad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '11px',
              marginBottom: '8px'
            }}
          />
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <ControlButton 
              active={selectedFilter === 'all'} 
              onClick={() => setSelectedFilter('all')}
              style={{ fontSize: '10px', padding: '4px 8px' }}
            >
              Todas ({airQualityData.length})
            </ControlButton>
            <ControlButton 
              active={selectedFilter === 'good'} 
              onClick={() => setSelectedFilter('good')}
              style={{ fontSize: '10px', padding: '4px 8px' }}
            >
              🟢 Buena ({airQualityData.filter(d => d.measurements.aqi <= 2).length})
            </ControlButton>
            <ControlButton 
              active={selectedFilter === 'moderate'} 
              onClick={() => setSelectedFilter('moderate')}
              style={{ fontSize: '10px', padding: '4px 8px' }}
            >
              🟡 Moderada ({airQualityData.filter(d => d.measurements.aqi === 3).length})
            </ControlButton>
            <ControlButton 
              active={selectedFilter === 'poor'} 
              onClick={() => setSelectedFilter('poor')}
              style={{ fontSize: '10px', padding: '4px 8px' }}
            >
              🔴 Mala ({airQualityData.filter(d => d.measurements.aqi >= 4).length})
            </ControlButton>
          </div>
        </div>
        
        <InfoDisplay>
          <div><strong>Mostrando:</strong> {localFilteredData.length} de {airQualityData.length}</div>
          <div><strong>Última actualización:</strong> {new Date().toLocaleTimeString()}</div>
          {selectedLocation && (
            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(102, 126, 234, 0.1)', borderRadius: '4px' }}>
              <strong>Seleccionada:</strong><br />
              {selectedLocation.location.name}<br />
              <span style={{ color: AirQualityColors[selectedLocation.quality] }}>
                AQI: {selectedLocation.measurements.aqi}
              </span>
            </div>
          )}
        </InfoDisplay>
      </ControlPanel>

      <Canvas>
        <SceneSetup 
          cameraMode={cameraMode} 
          dayTime={dayTime} 
          showAtmosphere={showAtmosphere}
        />
        
        <SpainTerrain data={localFilteredData} />
        
        {/* Rascacielos por ubicación - SOLO DATOS FILTRADOS */}
        {localFilteredData.map((data: AirQualityData, index: number) => {
          const position = geoToScenePosition(
            data.location.latitude, 
            data.location.longitude
          );
          
          return (
            <SkyscraperCluster
              key={`${data.location.name}-${index}`}
              aqi={data.measurements.aqi}
              position={position}
              color={AirQualityColors[data.quality]}
              airQuality={data.quality}
              onClick={() => onLocationSelect?.(data)}
              isSelected={selectedLocation?.location.name === data.location.name}
            />
          );
        })}
        
        {/* Efectos atmosféricos */}
        {showAtmosphere && <AtmosphericEffects dayTime={dayTime} />}
        
        {/* Destacar ubicación seleccionada */}
        {selectedLocation && (
          <SelectionHighlight 
            position={geoToScenePosition(
              selectedLocation.location.latitude,
              selectedLocation.location.longitude
            )}
          />
        )}
      </Canvas>
    </Canvas3DContainer>
  );
};

// Configuración de la escena
const SceneSetup: React.FC<{ 
  cameraMode: string; 
  dayTime: boolean; 
  showAtmosphere: boolean; 
}> = ({ cameraMode, dayTime }) => {
  return (
    <>
      <PerspectiveCamera
        makeDefault
        position={[0, 15, 15]}
        fov={60}
        near={0.1}
        far={1000}
      />
      
      {cameraMode === 'orbit' && (
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}  // Zoom más cercano
          maxDistance={25} // Zoom más lejano pero controlado
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          zoomSpeed={1.5}  // Zoom más rápido
          panSpeed={1.2}   // Pan más responsivo
        />
      )}
      
      <CameraAnimation mode={cameraMode} />
      
      {/* Iluminación dinámica día/noche */}
      <ambientLight intensity={dayTime ? 0.6 : 0.2} color={dayTime ? '#ffffff' : '#4444ff'} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={dayTime ? 1 : 0.3}
        color={dayTime ? '#ffffff' : '#6666ff'}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      
      {/* Estrellas para la noche */}
      {!dayTime && <Stars radius={300} depth={60} count={1000} factor={7} />}
      
      {/* Entorno */}
      <Environment preset={dayTime ? 'dawn' : 'night'} />
      
      <fog attach="fog" args={[dayTime ? '#87CEEB' : '#191970', 20, 100]} />
    </>
  );
};

// Animación automática de cámara
const CameraAnimation: React.FC<{ mode: string }> = ({ mode }) => {
  const { camera } = useThree();
  
  useFrame((state) => {
    if (mode === 'fly') {
      const time = state.clock.getElapsedTime();
      const radius = 25;
      const height = 20 + Math.sin(time * 0.3) * 5;
      
      camera.position.x = Math.cos(time * 0.2) * radius;
      camera.position.z = Math.sin(time * 0.2) * radius;
      camera.position.y = height;
      
      camera.lookAt(0, 0, 0);
    } else if (mode === 'overview') {
      // Vista fija desde arriba
      camera.position.set(0, 30, 0);
      camera.lookAt(0, 0, 0);
    }
  });
  
  return null;
};

// Terreno base de España con contorno más realista y EXPANDIDO
const SpainTerrain: React.FC<{ data: AirQualityData[] }> = ({ data }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Crear una geometría personalizada MUCHO MÁS GRANDE para simular el contorno de España
  const spainGeometry = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(50, 40, 100, 80); // DUPLICADO el tamaño y detalle
    const positions = geometry.attributes.position.array as Float32Array;
    
    // Crear un contorno aproximado de España modificando los vértices
    for (let i = 0; i < positions.length; i += 3) {
      const x = positions[i];
      const z = positions[i + 2];
      
      // Normalizar coordenadas a rango -1 a 1
      const normalizedX = x / 25; // Ajustado para nuevo tamaño
      const normalizedZ = z / 20;
      
      // Función mejorada para determinar si un punto está dentro del contorno de España
      const isInsideSpain = (nx: number, nz: number): boolean => {
        const centerX = -0.1;
        const centerZ = 0.1;
        
        // Cuerpo principal de España (forma más detallada)
        const mainBody = (
          Math.pow(nx - centerX, 2) / 0.9 + 
          Math.pow(nz - centerZ, 2) / 0.7
        ) < 1.2;
        
        // Excluir Portugal (lado izquierdo) - más preciso
        const notPortugal = nx > -0.8;
        
        // Incluir Andalucía (sur) - más detallada
        const andalucia = (
          Math.pow(nx + 0.2, 2) / 0.4 + 
          Math.pow(nz + 0.6, 2) / 0.25
        ) < 1;
        
        // Incluir Cataluña y Valencia (este) - más detallada
        const eastCoast = (
          Math.pow(nx - 0.5, 2) / 0.25 + 
          Math.pow(nz - 0.3, 2) / 0.6
        ) < 1;
        
        // Incluir Galicia (noroeste) - más detallada
        const galicia = (
          Math.pow(nx + 0.6, 2) / 0.2 + 
          Math.pow(nz - 0.7, 2) / 0.2
        ) < 1;
        
        // Añadir Islas Baleares
        const baleares = (
          Math.pow(nx - 0.7, 2) / 0.1 + 
          Math.pow(nz + 0.2, 2) / 0.05
        ) < 1;
        
        // Añadir Canarias (simplificado)
        const canarias = (
          Math.pow(nx + 1.2, 2) / 0.15 + 
          Math.pow(nz + 1, 2) / 0.1
        ) < 1;
        
        return (mainBody && notPortugal) || andalucia || eastCoast || galicia || baleares || canarias;
      };
      
      // Si está fuera de España, bajar el terreno más dramáticamente
      if (!isInsideSpain(normalizedX, normalizedZ)) {
        positions[i + 1] = -3; // Y position (altura) - más profundo
      } else {
        // Dentro de España: terreno con más variación de altura (montañas, valles)
        const height = Math.sin(normalizedX * 4) * Math.cos(normalizedZ * 3) * 0.8 + 
                      Math.sin(normalizedX * 8) * 0.3 + 
                      Math.cos(normalizedZ * 6) * 0.4; // Más variación topográfica
        positions[i + 1] = height;
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  
  useFrame(() => {
    if (meshRef.current) {
      // Animación sutil del terreno
      meshRef.current.rotation.z = Math.sin(Date.now() * 0.0001) * 0.002;
    }
  });

  return (
    <>
      {/* Terreno principal de España MÁS GRANDE */}
      <mesh ref={meshRef} position={[0, -0.5, 0]} receiveShadow geometry={spainGeometry}>
        <meshStandardMaterial
          color="#2d4a1e" // Verde más natural
          transparent
          opacity={0.95}
          roughness={0.9}
          metalness={0.05}
        />
      </mesh>
      
      {/* Mar/océano alrededor MÁS GRANDE */}
      <mesh position={[0, -3.5, 0]} receiveShadow>
        <planeGeometry args={[80, 70]} />
        <meshStandardMaterial
          color="#1e3a8a"
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.4}
        />
      </mesh>
      
      {/* Contorno brillante para España */}
      <mesh position={[0, -0.3, 0]}>
        <planeGeometry args={[50, 40, 100, 80]} />
        <meshBasicMaterial
          color="#ffd700"
          transparent
          opacity={0.15}
          wireframe={true}
        />
      </mesh>
      
      {/* Vegetación basada en calidad del aire */}
      {data.map((cityData) => {
        const [x, , z] = geoToScenePosition(cityData.location.latitude, cityData.location.longitude);
        const aqi = cityData.measurements.aqi || 1;
        
        // Calcular densidad de vegetación basada en AQI (mejor aire = más vegetación)
        const vegetationDensity = Math.max(0, (6 - aqi) / 5); // AQI 1-2 = alta densidad, 5 = baja densidad
        
        // Solo mostrar vegetación significativa si hay buena calidad del aire
        if (vegetationDensity > 0.3) {
          return (
            <React.Fragment key={`vegetation-${cityData.location.name}`}>
              {/* Árboles para calidad excelente (AQI 1-2) */}
              {aqi <= 2 && (
                <>
                  <Vegetation 
                    position={[x - 2, 0, z - 2]} 
                    density={vegetationDensity} 
                    type="trees" 
                  />
                  <Vegetation 
                    position={[x + 2, 0, z + 2]} 
                    density={vegetationDensity} 
                    type="trees" 
                  />
                </>
              )}
              
              {/* Arbustos para calidad buena (AQI 2-3) */}
              {aqi <= 3 && (
                <>
                  <Vegetation 
                    position={[x - 1, 0, z + 1]} 
                    density={vegetationDensity} 
                    type="bushes" 
                  />
                  <Vegetation 
                    position={[x + 1, 0, z - 1]} 
                    density={vegetationDensity} 
                    type="bushes" 
                  />
                </>
              )}
              
              {/* Hierba para calidad moderada (AQI 3-4) - REDUCIDA */}
              {aqi <= 4 && (
                <Vegetation 
                  position={[x, 0, z + 3]} 
                  density={vegetationDensity * 0.4} 
                  type="grass" 
                />
              )}
            </React.Fragment>
          );
        }
        return null;
      })}

      {/* NUEVOS: Elementos de contaminación progresiva */}
      {data.map((cityData) => {
        const [x, , z] = geoToScenePosition(cityData.location.latitude, cityData.location.longitude);
        const aqi = cityData.measurements.aqi || 1;
        const weatherMain = cityData.weather?.main;
        
        // Solo mostrar elementos de contaminación si AQI >= 3 (moderada o peor)
        if (aqi >= 3) {
          return (
            <PollutionElements
              key={`pollution-${cityData.location.name}`}
              position={[x, 0, z]}
              aqi={aqi}
              weatherMain={weatherMain}
            />
          );
        }
        return null;
      })}

      {/* Montañas principales de España */}
      <Mountain position={[-8, 1, 12]} size={1.5} color="#8B4513" />
      <Mountain position={[0, 0.8, 8]} size={1.2} color="#A0522D" />
      <Mountain position={[8, 1.2, 5]} size={1.0} color="#8B4513" />
      <Mountain position={[-15, 0.6, 0]} size={0.8} color="#A0522D" />
      
      {/* Elementos característicos de España distribuidos por regiones */}
      
      {/* Castilla-La Mancha: Molinos de viento (Don Quijote) */}
      <SpanishLandmark position={[-2, 0.5, -2]} type="windmill" size={0.8} />
      <SpanishLandmark position={[-1, 0.5, -3]} type="windmill" size={0.7} />
      <SpanishLandmark position={[-3, 0.5, -1]} type="windmill" size={0.9} />
      
      {/* Andalucía: Catedrales y castillos */}
      <SpanishLandmark position={[-4, 0.5, -8]} type="cathedral" size={1.0} />
      <SpanishLandmark position={[-6, 0.5, -7]} type="castle" size={1.2} />
      <SpanishLandmark position={[-2, 0.5, -9]} type="castle" size={0.9} />
      
      {/* Costa: Faros */}
      <SpanishLandmark position={[-18, 0.2, 8]} type="lighthouse" size={0.6} /> {/* Galicia */}
      <SpanishLandmark position={[12, 0.2, -2]} type="lighthouse" size={0.7} /> {/* Valencia */}
      <SpanishLandmark position={[-8, 0.2, -12]} type="lighthouse" size={0.5} /> {/* Cádiz */}
      
      {/* Cataluña: Catedral */}
      <SpanishLandmark position={[6, 0.5, 8]} type="cathedral" size={1.1} />
      
      {/* Castilla y León: Castillos */}
      <SpanishLandmark position={[-6, 0.5, 2]} type="castle" size={1.0} />
      <SpanishLandmark position={[-4, 0.5, 4]} type="castle" size={1.1} />
      
      {/* Ríos principales de España */}
      {/* Río Ebro */}
      <mesh position={[2, -0.4, 6]} receiveShadow>
        <boxGeometry args={[15, 0.1, 0.8]} />
        <meshStandardMaterial
          color="#4682B4"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
      
      {/* Río Tajo */}
      <mesh position={[-8, -0.4, -2]} receiveShadow>
        <boxGeometry args={[18, 0.1, 0.6]} />
        <meshStandardMaterial
          color="#4682B4"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
      
      {/* Río Guadalquivir */}
      <mesh position={[-6, -0.4, -6]} receiveShadow>
        <boxGeometry args={[12, 0.1, 0.5]} />
        <meshStandardMaterial
          color="#4682B4"
          transparent
          opacity={0.8}
          roughness={0.1}
          metalness={0.6}
        />
      </mesh>
      
      {/* Estrecho de Gibraltar */}
      <mesh position={[-4, -0.3, -12]} receiveShadow>
        <boxGeometry args={[2, 0.1, 1]} />
        <meshStandardMaterial
          color="#1E90FF"
          transparent
          opacity={0.9}
          roughness={0.05}
          metalness={0.8}
        />
      </mesh>
      
      {/* Sistema de partículas atmosféricas */}
      <AtmosphericParticles data={data} />
      
      {/* NUEVO: Efectos meteorológicos visuales */}
      <WeatherEffects data={data} />
    </>
  );
};

// Efectos atmosféricos
const AtmosphericEffects: React.FC<{ dayTime: boolean }> = ({ dayTime }) => {
  const cloudsRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += 0.0005;
    }
  });

  const clouds = useMemo(() => {
    const cloudPositions = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 20 + Math.random() * 10;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 8 + Math.random() * 4;
      
      cloudPositions.push([x, y, z] as [number, number, number]);
    }
    return cloudPositions;
  }, []);

  return (
    <group ref={cloudsRef}>
      {clouds.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[2, 8, 8]} />
          <meshBasicMaterial
            color={dayTime ? '#ffffff' : '#333355'}
            transparent
            opacity={dayTime ? 0.6 : 0.3}
          />
        </mesh>
      ))}
    </group>
  );
};

// Destacar ubicación seleccionada
const SelectionHighlight: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const ringRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ringRef.current) {
      const time = state.clock.getElapsedTime();
      ringRef.current.rotation.y = time * 2;
      ringRef.current.scale.setScalar(1 + Math.sin(time * 4) * 0.1);
    }
  });

  return (
    <mesh ref={ringRef} position={[position[0], 0.1, position[2]]}>
      <ringGeometry args={[0.8, 1.2, 16]} />
      <meshBasicMaterial
        color="#ffff00"
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
};
