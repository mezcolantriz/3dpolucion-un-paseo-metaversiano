import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';
import type { AirQualityData } from '../types';
import { AirQualityColors, AirQualityLevel } from '../types';

// Fix para los iconos de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapWrapper = styled.div`
  height: 100vh;
  width: 100%;
  position: relative;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  
  .leaflet-container {
    background: rgba(30, 60, 114, 0.8);
    border-radius: 0;
  }
  
  .leaflet-control-container {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }
`;

const InfoPanel = styled.div`
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 300px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const InfoTitle = styled.h2`
  margin: 0 0 16px 0;
  color: #2d3748;
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const InfoSubtitle = styled.p`
  margin: 0 0 20px 0;
  color: #4a5568;
  font-size: 14px;
  line-height: 1.5;
`;

const LegendItem = styled.div<{ color: string }>`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  
  &::before {
    content: '';
    width: 16px;
    height: 16px;
    background-color: ${props => props.color};
    border-radius: 4px;
    margin-right: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const StatsGrid = styled.div`
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  z-index: 1000;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

interface SpainMapProps {
  airQualityData: AirQualityData[];
  onLocationSelect: (data: AirQualityData) => void;
  loading: boolean;
}

// Componente para crear marcadores personalizados
const CustomMarker: React.FC<{ data: AirQualityData; onLocationSelect: (data: AirQualityData) => void }> = ({ 
  data, 
  onLocationSelect 
}) => {
  const createCustomIcon = (quality: AirQualityLevel, aqi: number) => {
    const color = AirQualityColors[quality];
    const size = Math.max(20, Math.min(50, aqi * 10));
    
    return L.divIcon({
      html: `
        <div style="
          background: ${color};
          width: ${size}px;
          height: ${size}px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${Math.max(10, size / 3)}px;
          animation: pulse 2s infinite;
        ">
          ${aqi}
        </div>
        <style>
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.1); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
        </style>
      `,
      className: 'custom-air-quality-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  return (
    <Marker
      position={[data.location.latitude, data.location.longitude]}
      icon={createCustomIcon(data.quality, data.measurements.aqi)}
      eventHandlers={{
        click: () => onLocationSelect(data)
      }}
    >
      <Popup>
        <div style={{ padding: '12px', minWidth: '250px' }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#2d3748' }}>{data.location.name}</h3>
          <div style={{ marginBottom: '8px' }}>
            <strong>ICA:</strong> {data.measurements.aqi} ({data.quality})
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>PM2.5:</strong> {data.measurements.pm25.toFixed(1)} μg/m³
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>PM10:</strong> {data.measurements.pm10.toFixed(1)} μg/m³
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>NO2:</strong> {data.measurements.no2.toFixed(1)} μg/m³
          </div>
          <div style={{ fontSize: '12px', color: '#718096', marginTop: '8px' }}>
            Última actualización: {new Date(data.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// Componente para manejar la vista del mapa
const MapController: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

export const SpainMap: React.FC<SpainMapProps> = ({ 
  airQualityData, 
  onLocationSelect, 
  loading 
}) => {
  const mapRef = useRef<L.Map | null>(null);

  // Coordenadas del centro de España
  const spainCenter: [number, number] = [40.4637, -3.7492];
  const spainZoom = 6;

  // Calcular estadísticas
  const stats = React.useMemo(() => {
    if (airQualityData.length === 0) {
      return { avgAqi: 0, maxPM25: 0, locations: 0 };
    }

    const avgAqi = airQualityData.reduce((sum, data) => sum + data.measurements.aqi, 0) / airQualityData.length;
    const maxPM25 = Math.max(...airQualityData.map(data => data.measurements.pm25));
    
    return {
      avgAqi: Math.round(avgAqi * 10) / 10,
      maxPM25: Math.round(maxPM25 * 10) / 10,
      locations: airQualityData.length
    };
  }, [airQualityData]);

  return (
    <MapWrapper>
      <InfoPanel>
        <InfoTitle>Calidad del Aire España</InfoTitle>
        <InfoSubtitle>
          Visualización en tiempo real de la contaminación atmosférica
        </InfoSubtitle>
        
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{ margin: '0 0 12px 0', color: '#4a5568' }}>Leyenda (ICA)</h4>
          <LegendItem color={AirQualityColors[AirQualityLevel.EXCELLENT]}>
            Excelente (1)
          </LegendItem>
          <LegendItem color={AirQualityColors[AirQualityLevel.GOOD]}>
            Buena (2)
          </LegendItem>
          <LegendItem color={AirQualityColors[AirQualityLevel.MODERATE]}>
            Moderada (3)
          </LegendItem>
          <LegendItem color={AirQualityColors[AirQualityLevel.POOR]}>
            Mala (4)
          </LegendItem>
          <LegendItem color={AirQualityColors[AirQualityLevel.VERY_POOR]}>
            Muy Mala (5)
          </LegendItem>
        </div>
        
        {loading && (
          <div style={{ color: '#718096', fontStyle: 'italic' }}>
            Cargando datos...
          </div>
        )}
      </InfoPanel>

      <StatsGrid>
        <StatCard>
          <StatValue>{stats.avgAqi}</StatValue>
          <StatLabel>ICA Promedio</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.maxPM25}</StatValue>
          <StatLabel>PM2.5 Máximo (μg/m³)</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.locations}</StatValue>
          <StatLabel>Ubicaciones</StatLabel>
        </StatCard>
      </StatsGrid>

      <MapContainer
        center={spainCenter}
        zoom={spainZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController center={spainCenter} zoom={spainZoom} />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={0.7}
        />
        
        {airQualityData.map((data, index) => (
          <CustomMarker
            key={`${data.location.name}-${index}`}
            data={data}
            onLocationSelect={onLocationSelect}
          />
        ))}
      </MapContainer>
    </MapWrapper>
  );
};
