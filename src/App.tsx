import { useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import { SpainMap } from './components/SpainMap';
import { useAirQuality } from './hooks/useAirQuality';
import type { AirQualityData } from './types';

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
  background: rgba(220, 38, 38, 0.95);
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
  const { data, loading, error, refreshData, lastUpdate } = useAirQuality(true, 300000); // Refresh cada 5 minutos
  const [selectedLocation, setSelectedLocation] = useState<AirQualityData | null>(null);

  const handleLocationSelect = (locationData: AirQualityData) => {
    setSelectedLocation(locationData);
    // TODO: Implementar visualización 3D de rascacielos para la ubicación seleccionada
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
        {loading && data.length === 0 && (
          <LoadingOverlay>
            <LoadingSpinner />
            <LoadingText>Cargando datos de calidad del aire</LoadingText>
            <LoadingSubtext>Obteniendo información en tiempo real de España...</LoadingSubtext>
          </LoadingOverlay>
        )}

        {error && (
          <ErrorOverlay>
            <h3 style={{ marginBottom: '12px' }}>Error de conexión</h3>
            <p style={{ marginBottom: '8px', fontSize: '14px' }}>{error}</p>
            <p style={{ fontSize: '12px', opacity: 0.8, marginBottom: '16px' }}>
              Mostrando datos simulados para demostración
            </p>
            <RefreshButton onClick={handleRefresh}>
              Intentar de nuevo
            </RefreshButton>
          </ErrorOverlay>
        )}

        <SpainMap
          airQualityData={data}
          onLocationSelect={handleLocationSelect}
          loading={loading}
        />

        {/* Footer con información de última actualización */}
        {lastUpdate && !loading && (
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              background: 'rgba(255, 255, 255, 0.9)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#4a5568',
              zIndex: 1000,
              backdropFilter: 'blur(10px)'
            }}
          >
            Última actualización: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </AppContainer>
    </>
  );
}

export default App;
