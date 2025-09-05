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

export interface SkyscraperProps {
  height: number;
  color: string;
  position: [number, number, number];
  airQuality: AirQualityLevel;
  opacity: number;
  animationDelay: number;
}

export interface MapMarkerData {
  id: string;
  position: [number, number];
  airQuality: AirQualityData;
  weather: WeatherData;
  skyscraperHeight: number;
}

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

// Ciudades principales de España con sus coordenadas
export const SpainCities: SpainRegion[] = [
  {
    name: 'Madrid',
    coordinates: [40.4168, -3.7038],
    cities: ['Madrid', 'Alcalá de Henares', 'Móstoles', 'Fuenlabrada']
  },
  {
    name: 'Barcelona',
    coordinates: [41.3851, 2.1734],
    cities: ['Barcelona', 'Hospitalet de Llobregat', 'Badalona', 'Terrassa']
  },
  {
    name: 'Valencia',
    coordinates: [39.4699, -0.3763],
    cities: ['Valencia', 'Alicante', 'Elche', 'Castellón']
  },
  {
    name: 'Sevilla',
    coordinates: [37.3891, -5.9845],
    cities: ['Sevilla', 'Málaga', 'Córdoba', 'Jerez de la Frontera']
  },
  {
    name: 'Bilbao',
    coordinates: [43.2627, -2.9253],
    cities: ['Bilbao', 'Vitoria', 'San Sebastián', 'Barakaldo']
  },
  {
    name: 'Zaragoza',
    coordinates: [41.6488, -0.8891],
    cities: ['Zaragoza', 'Huesca', 'Teruel']
  }
];
