import { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { SpainMap } from './components/SpainMap';
import { Spain3DMap } from './components/Spain3DMap';
import { FilterPanel } from './components/FilterPanel';
import { useAirQuality } from './hooks/useAirQuality';
import type { AirQualityData, AirQualityLevel } from './types';

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    overflow: hidden;
  }

  #root {
    height: 100vh;
    width: 100vw;
  }
`;

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  position: relative;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
`;

const MapContainer = styled.div<{ showSplit: boolean }>`
  width: ${props => props.showSplit ? '50%' : '100%'};
  height: 100vh;
  transition: width 0.3s ease;
`;

const ViewToggle = styled.button<{ splitView: boolean }>`
  position: fixed;
  top: 20px;
  right: ${props => props.splitView ? 'calc(50% + 20px)' : '20px'};
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  cursor: pointer;
  z-index: 1002;
  font-weight: 600;
  color: #2d3748;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 60, 114, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(10px);
`;

const LoadingSpinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid #ffffff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 24px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: white;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 8px;
`;

const LoadingSubtext = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  text-align: center;
`;

const ErrorOverlay = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(102, 126, 234, 0.95);
  color: white;
  padding: 24px 32px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  z-index: 9999;
  max-width: 400px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const RefreshButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 16px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

function App() {
  const { data, loading, error, refreshData, lastUpdate } = useAirQuality(true, 300000);
  const [selectedLocation, setSelectedLocation] = useState<AirQualityData | null>(null);
  const [showSplit, setShowSplit] = useState(false);
  
  // Estados compartidos para filtros entre panel izquierdo y mapa 3D
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [globalSelectedFilters, setGlobalSelectedFilters] = useState<any[]>([]);
  const [globalSortBy, setGlobalSortBy] = useState<'aqi' | 'name' | 'pm25'>('aqi');

  const handleLocationSelect = (locationData: AirQualityData) => {
    setSelectedLocation(locationData);
    console.log('Ubicación seleccionada:', locationData);
  };

  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (err) {
      console.error('Error al refrescar datos:', err);
    }
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        {/* Panel lateral con filtros */}
        <FilterPanel
          airQualityData={data}
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
          searchTerm={globalSearchTerm}
          onSearchChange={setGlobalSearchTerm}
          selectedFilters={globalSelectedFilters}
          onFiltersChange={setGlobalSelectedFilters}
          sortBy={globalSortBy}
          onSortChange={setGlobalSortBy}
        />

        {/* Botón para alternar vista dividida */}
        <ViewToggle 
          splitView={showSplit}
          onClick={() => setShowSplit(!showSplit)}
        >
          {showSplit ? '🗺️ Solo Mapa' : '🏢 Vista 3D'}
        </ViewToggle>

        {loading && data.length === 0 && (
          <LoadingOverlay>
            <LoadingSpinner />
            <LoadingText>Cargando datos de calidad del aire</LoadingText>
            <LoadingSubtext>
              Obteniendo información de {data.length > 0 ? data.length : '60+'} ciudades de España...
            </LoadingSubtext>
          </LoadingOverlay>
        )}

        {error && (
          <ErrorOverlay>
            <h3 style={{ marginBottom: '12px' }}>⚠️ Modo Demostración</h3>
            <p style={{ marginBottom: '8px', fontSize: '14px' }}>
              Mostrando datos simulados para todas las ciudades de España
            </p>
            <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '16px' }}>
              Para datos reales, configura tu API key en el archivo .env
            </p>
            <RefreshButton onClick={handleRefresh}>
              🔄 Actualizar Datos
            </RefreshButton>
          </ErrorOverlay>
        )}

        {/* Contenedor del mapa principal */}
        <MapContainer showSplit={showSplit}>
          <SpainMap
            airQualityData={data}
            onLocationSelect={handleLocationSelect}
            loading={loading}
          />
        </MapContainer>

        {/* Vista 3D (cuando está activada) */}
        {showSplit && (
          <Spain3DMap
            airQualityData={data}
            selectedLocation={selectedLocation}
            onLocationSelect={setSelectedLocation}
            globalSearchTerm={globalSearchTerm}
            globalSelectedFilters={globalSelectedFilters}
            globalSortBy={globalSortBy}
          />
        )}

        {/* Footer con información de última actualización */}
        {lastUpdate && !loading && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: showSplit ? 'calc(25% - 100px)' : 'calc(50% - 100px)',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#4a5568',
              zIndex: 1000,
              backdropFilter: 'blur(10px)',
              transition: 'left 0.3s ease'
            }}
          >
            🕒 Última actualización: {lastUpdate.toLocaleTimeString()}
          </div>
        )}

        {/* Indicador de cantidad de datos */}
        {data.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(102, 126, 234, 0.9)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              zIndex: 1000,
              backdropFilter: 'blur(10px)'
            }}
          >
            📍 {data.length} ciudades monitoreadas
          </div>
        )}
      </AppContainer>
    </>
  );
}

export default App;
