import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars, Environment } from '@react-three/drei';
import styled from 'styled-components';
import * as THREE from 'three';
import { SkyscraperCluster } from './SkyscraperCluster';
import type { AirQualityData } from '../types';
import { AirQualityColors } from '../types';
import { geoToScenePosition, isDayTime } from '../utils';

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
}

// Componente principal del mapa 3D
export const Spain3DMap: React.FC<Spain3DMapProps> = ({ 
  airQualityData, 
  selectedLocation 
}) => {
  const [cameraMode, setCameraMode] = useState<'orbit' | 'fly' | 'overview'>('orbit');
  const [showAtmosphere, setShowAtmosphere] = useState(true);
  const [dayTime, setDayTime] = useState(isDayTime());

  return (
    <Canvas3DContainer>
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
        
        <InfoDisplay>
          <div><strong>Ubicaciones:</strong> {airQualityData.length}</div>
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
        
        <SpainTerrain />
        
        {/* Rascacielos por ubicación */}
        {airQualityData.map((data, index) => {
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
          minDistance={5}
          maxDistance={50}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
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

// Terreno base de España
const SpainTerrain: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      // El terreno está estático por ahora
    }
  });

  return (
    <mesh ref={meshRef} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[30, 25]} />
      <meshStandardMaterial
        color="#2d5016"
        transparent
        opacity={0.8}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  );
};

// Efectos atmosféricos
const AtmosphericEffects: React.FC<{ dayTime: boolean }> = ({ dayTime }) => {
  const cloudsRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
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
