import { AirQualityLevel, AirQualityColors } from '../types';

/**
 * Calcula la altura del rascacielos basada en el nivel de contaminación
 */
export const calculateSkyscraperHeight = (aqi: number, pm25: number): number => {
  const baseHeight = 0.5;
  const aqiMultiplier = aqi * 0.3;
  const pm25Multiplier = (pm25 / 100) * 0.5;
  
  return Math.max(baseHeight, Math.min(3.0, baseHeight + aqiMultiplier + pm25Multiplier));
};

/**
 * Obtiene el color del rascacielos basado en la calidad del aire
 */
export const getSkyscraperColor = (quality: AirQualityLevel): string => {
  return AirQualityColors[quality];
};

/**
 * Calcula la opacidad del rascacielos basada en el nivel de contaminación
 */
export const calculateOpacity = (aqi: number): number => {
  return Math.max(0.3, Math.min(1.0, 0.4 + (aqi / 5) * 0.6));
};

/**
 * Convierte coordenadas geográficas a posición 3D en el escenario
 */
export const geoToScenePosition = (
  lat: number, 
  lon: number, 
  centerLat: number = 40.4637, 
  centerLon: number = -3.7492
): [number, number, number] => {
  const scale = 10; // Factor de escala para el mapa
  const x = (lon - centerLon) * scale;
  const z = (centerLat - lat) * scale;
  return [x, 0, z];
};

/**
 * Formatea los valores de contaminantes para mostrar
 */
export const formatPollutantValue = (value: number, unit: string = 'μg/m³'): string => {
  return `${value.toFixed(1)} ${unit}`;
};

/**
 * Obtiene la descripción textual del nivel de calidad del aire
 */
export const getQualityDescription = (quality: AirQualityLevel): string => {
  const descriptions = {
    [AirQualityLevel.EXCELLENT]: 'Excelente - Aire muy limpio',
    [AirQualityLevel.GOOD]: 'Buena - Aire de buena calidad',
    [AirQualityLevel.MODERATE]: 'Moderada - Calidad aceptable',
    [AirQualityLevel.POOR]: 'Mala - Puede afectar a personas sensibles',
    [AirQualityLevel.VERY_POOR]: 'Muy Mala - Evitar actividades al aire libre',
    [AirQualityLevel.HAZARDOUS]: 'Peligrosa - Emergencia sanitaria'
  };
  
  return descriptions[quality];
};

/**
 * Calcula estadísticas agregadas de un conjunto de datos
 */
export const calculateAggregateStats = (data: any[]) => {
  if (data.length === 0) {
    return {
      avgAqi: 0,
      maxPM25: 0,
      minPM25: 0,
      avgPM25: 0,
      worstLocation: null,
      bestLocation: null
    };
  }

  const aqiValues = data.map(d => d.measurements.aqi);
  const pm25Values = data.map(d => d.measurements.pm25);

  const avgAqi = aqiValues.reduce((sum, val) => sum + val, 0) / aqiValues.length;
  const avgPM25 = pm25Values.reduce((sum, val) => sum + val, 0) / pm25Values.length;
  const maxPM25 = Math.max(...pm25Values);
  const minPM25 = Math.min(...pm25Values);

  const worstLocation = data.reduce((worst, current) => 
    current.measurements.aqi > worst.measurements.aqi ? current : worst
  );

  const bestLocation = data.reduce((best, current) => 
    current.measurements.aqi < best.measurements.aqi ? current : best
  );

  return {
    avgAqi: Math.round(avgAqi * 10) / 10,
    maxPM25: Math.round(maxPM25 * 10) / 10,
    minPM25: Math.round(minPM25 * 10) / 10,
    avgPM25: Math.round(avgPM25 * 10) / 10,
    worstLocation,
    bestLocation
  };
};

/**
 * Genera un retraso de animación basado en la posición geográfica
 */
export const calculateAnimationDelay = (lat: number, lon: number): number => {
  // Crear un patrón de onda desde el noroeste hacia el sureste
  const normalizedLat = (lat - 35) / 8; // Normalizar latitud de España
  const normalizedLon = (lon + 10) / 10; // Normalizar longitud de España
  
  return (normalizedLat + normalizedLon) * 2;
};

/**
 * Determina si es de día o de noche basado en la hora local
 */
export const isDayTime = (date: Date = new Date()): boolean => {
  // Cálculo simplificado basado en la hora local
  const hour = date.getHours();
  
  // Ajustar por estación (aproximado)
  const month = date.getMonth();
  const isDST = month >= 2 && month <= 9; // Aproximación del horario de verano
  
  const sunriseHour = isDST ? 6 : 7;
  const sunsetHour = isDST ? 21 : 19;
  
  return hour >= sunriseHour && hour <= sunsetHour;
};

/**
 * Convierte un timestamp a formato legible
 */
export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};
