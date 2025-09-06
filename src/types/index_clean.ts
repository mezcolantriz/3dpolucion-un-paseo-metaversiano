// Tipos para la aplicación de calidad del aire en España

export interface AirQualityData {
  location: {
    latitude: number;
    longitude: number;
    name: string;
    region: string;
  };
  measurements: {
    pm25: number;      // PM2.5 (µg/m³)
    pm10: number;      // PM10 (µg/m³)
    no2: number;       // NO2 (µg/m³)
    o3: number;        // O3 (µg/m³)
    so2: number;       // SO2 (µg/m³)
    co: number;        // CO (mg/m³)
    aqi: number;       // Air Quality Index
  };
  timestamp: string;
  quality: AirQualityLevel;
}

export enum AirQualityLevel {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  MODERATE = 'moderate',
  POOR = 'poor',
  VERY_POOR = 'very_poor',
  HAZARDOUS = 'hazardous'
}

export interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    name: string;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    pressure: number;
    weatherCode: number;
    description: string;
  };
  timestamp: string;
}

// Tipos para filtros y UI
export interface FilterState {
  searchTerm: string;
  selectedQualityLevel: AirQualityLevel | 'all';
  sortBy: 'name' | 'aqi' | 'pm25';
  sortOrder: 'asc' | 'desc';
}

// Tipo para las regiones de España
export interface SpainRegion {
  name: string;
  coordinates: [number, number];
  cities: string[];
}

// Configuración de colores para los niveles de calidad del aire
export const AirQualityColors: Record<AirQualityLevel, string> = {
  [AirQualityLevel.EXCELLENT]: '#00e400',
  [AirQualityLevel.GOOD]: '#ffff00',
  [AirQualityLevel.MODERATE]: '#ff7e00',
  [AirQualityLevel.POOR]: '#ff0000',
  [AirQualityLevel.VERY_POOR]: '#8f3f97',
  [AirQualityLevel.HAZARDOUS]: '#7e0023'
};

// Solo 3 ciudades para el proyecto
export const SpainCities: SpainRegion[] = [
  { name: 'Madrid', coordinates: [40.4168, -3.7038], cities: ['Madrid'] },
  { name: 'Murcia', coordinates: [37.9922, -1.1307], cities: ['Murcia'] },
  { name: 'Córdoba', coordinates: [37.8882, -4.7794], cities: ['Córdoba'] },
];
