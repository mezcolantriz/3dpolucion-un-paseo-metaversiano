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
  weather?: {         // NUEVO: Datos meteorológicos
    main: string;     // "Rain", "Clear", "Clouds", etc.
    description: string;
    temperature: number;  // °C
    humidity: number;     // %
    windSpeed: number;    // m/s
    windDirection: number; // grados
    visibility: number;   // metros
    pressure: number;     // hPa
    icon: string;        // código del icono
  };
  timestamp: string;
  quality: AirQualityLevel;
}

export const AirQualityLevel = {
  EXCELLENT: 'excellent',
  GOOD: 'good',
  MODERATE: 'moderate',
  POOR: 'poor',
  VERY_POOR: 'very_poor',
  HAZARDOUS: 'hazardous'
} as const;

export type AirQualityLevel = typeof AirQualityLevel[keyof typeof AirQualityLevel];

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

// Todas las grandes ciudades de España para requests reales de API
export const SpainCities: SpainRegion[] = [
  // Comunidad de Madrid
  { name: 'Madrid', coordinates: [40.4168, -3.7038], cities: ['Madrid'] },
  { name: 'Móstoles', coordinates: [40.3230, -3.8648], cities: ['Móstoles'] },
  { name: 'Alcalá de Henares', coordinates: [40.4818, -3.3625], cities: ['Alcalá de Henares'] },
  { name: 'Fuenlabrada', coordinates: [40.2846, -3.7995], cities: ['Fuenlabrada'] },
  { name: 'Leganés', coordinates: [40.3267, -3.7636], cities: ['Leganés'] },
  
  // Cataluña
  { name: 'Barcelona', coordinates: [41.3851, 2.1734], cities: ['Barcelona'] },
  { name: 'Hospitalet de Llobregat', coordinates: [41.3598, 2.1006], cities: ['Hospitalet de Llobregat'] },
  { name: 'Badalona', coordinates: [41.4500, 2.2473], cities: ['Badalona'] },
  { name: 'Terrassa', coordinates: [41.5640, 2.0110], cities: ['Terrassa'] },
  { name: 'Sabadell', coordinates: [41.5433, 2.1094], cities: ['Sabadell'] },
  { name: 'Tarragona', coordinates: [41.1189, 1.2445], cities: ['Tarragona'] },
  { name: 'Lleida', coordinates: [41.6175, 0.6200], cities: ['Lleida'] },
  { name: 'Girona', coordinates: [41.9794, 2.8214], cities: ['Girona'] },
  
  // Comunidad Valenciana
  { name: 'Valencia', coordinates: [39.4699, -0.3763], cities: ['Valencia'] },
  { name: 'Alicante', coordinates: [38.3452, -0.4810], cities: ['Alicante'] },
  { name: 'Elche', coordinates: [38.2622, -0.7011], cities: ['Elche'] },
  { name: 'Castellón', coordinates: [39.9864, -0.0513], cities: ['Castellón'] },
  { name: 'Torrevieja', coordinates: [37.9784, -0.6811], cities: ['Torrevieja'] },
  
  // Andalucía
  { name: 'Sevilla', coordinates: [37.3891, -5.9845], cities: ['Sevilla'] },
  { name: 'Málaga', coordinates: [36.7213, -4.4214], cities: ['Málaga'] },
  { name: 'Córdoba', coordinates: [37.8882, -4.7794], cities: ['Córdoba'] },
  { name: 'Granada', coordinates: [37.1773, -3.5986], cities: ['Granada'] },
  { name: 'Almería', coordinates: [36.8381, -2.4597], cities: ['Almería'] },
  { name: 'Cádiz', coordinates: [36.5271, -6.2886], cities: ['Cádiz'] },
  { name: 'Huelva', coordinates: [37.2614, -6.9447], cities: ['Huelva'] },
  { name: 'Jaén', coordinates: [37.7796, -3.7849], cities: ['Jaén'] },
  { name: 'Jerez de la Frontera', coordinates: [36.6860, -6.1366], cities: ['Jerez de la Frontera'] },
  { name: 'Marbella', coordinates: [36.5107, -4.8851], cities: ['Marbella'] },
  
  // País Vasco
  { name: 'Bilbao', coordinates: [43.2627, -2.9253], cities: ['Bilbao'] },
  { name: 'Vitoria-Gasteiz', coordinates: [42.8467, -2.6716], cities: ['Vitoria-Gasteiz'] },
  { name: 'San Sebastián', coordinates: [43.3183, -1.9812], cities: ['San Sebastián'] },
  
  // Galicia
  { name: 'A Coruña', coordinates: [43.3623, -8.4115], cities: ['A Coruña'] },
  { name: 'Vigo', coordinates: [42.2406, -8.7207], cities: ['Vigo'] },
  { name: 'Santiago de Compostela', coordinates: [42.8805, -8.5456], cities: ['Santiago de Compostela'] },
  { name: 'Ourense', coordinates: [42.3406, -7.8644], cities: ['Ourense'] },
  { name: 'Lugo', coordinates: [43.0097, -7.5567], cities: ['Lugo'] },
  { name: 'Pontevedra', coordinates: [42.4296, -8.6448], cities: ['Pontevedra'] },
  
  // Aragón
  { name: 'Zaragoza', coordinates: [41.6488, -0.8891], cities: ['Zaragoza'] },
  { name: 'Huesca', coordinates: [42.1408, -0.4082], cities: ['Huesca'] },
  { name: 'Teruel', coordinates: [40.3456, -1.1063], cities: ['Teruel'] },
  
  // Asturias
  { name: 'Oviedo', coordinates: [43.3614, -5.8593], cities: ['Oviedo'] },
  { name: 'Gijón', coordinates: [43.5322, -5.6611], cities: ['Gijón'] },
  
  // Murcia
  { name: 'Murcia', coordinates: [37.9922, -1.1307], cities: ['Murcia'] },
  { name: 'Cartagena', coordinates: [37.6000, -0.9833], cities: ['Cartagena'] },
  
  // Castilla y León
  { name: 'Valladolid', coordinates: [41.6523, -4.7245], cities: ['Valladolid'] },
  { name: 'Salamanca', coordinates: [40.9701, -5.6635], cities: ['Salamanca'] },
  { name: 'León', coordinates: [42.5987, -5.5671], cities: ['León'] },
  { name: 'Burgos', coordinates: [42.3440, -3.6969], cities: ['Burgos'] },
  { name: 'Palencia', coordinates: [42.0096, -4.5246], cities: ['Palencia'] },
  { name: 'Zamora', coordinates: [41.5034, -5.7467], cities: ['Zamora'] },
  { name: 'Ávila', coordinates: [40.6566, -4.6810], cities: ['Ávila'] },
  { name: 'Segovia', coordinates: [40.9429, -4.1088], cities: ['Segovia'] },
  { name: 'Soria', coordinates: [41.7665, -2.479], cities: ['Soria'] },
  
  // Castilla-La Mancha
  { name: 'Toledo', coordinates: [39.8628, -4.0273], cities: ['Toledo'] },
  { name: 'Ciudad Real', coordinates: [38.9848, -3.9278], cities: ['Ciudad Real'] },
  { name: 'Albacete', coordinates: [38.9943, -1.8585], cities: ['Albacete'] },
  { name: 'Cuenca', coordinates: [40.0704, -2.1374], cities: ['Cuenca'] },
  { name: 'Guadalajara', coordinates: [40.6319, -3.1601], cities: ['Guadalajara'] },
  
  // Extremadura
  { name: 'Badajoz', coordinates: [38.8794, -6.9707], cities: ['Badajoz'] },
  { name: 'Cáceres', coordinates: [39.4753, -6.3724], cities: ['Cáceres'] },
  { name: 'Mérida', coordinates: [38.9165, -6.3363], cities: ['Mérida'] },
  
  // Navarra
  { name: 'Pamplona', coordinates: [42.8125, -1.6458], cities: ['Pamplona'] },
  
  // La Rioja
  { name: 'Logroño', coordinates: [42.4627, -2.4447], cities: ['Logroño'] },
  
  // Cantabria
  { name: 'Santander', coordinates: [43.4623, -3.8099], cities: ['Santander'] },
  
  // Islas Baleares
  { name: 'Palma de Mallorca', coordinates: [39.5693, 2.6502], cities: ['Palma de Mallorca'] },
  { name: 'Ibiza', coordinates: [38.9067, 1.4206], cities: ['Ibiza'] },
  
  // Canarias
  { name: 'Las Palmas de Gran Canaria', coordinates: [28.1248, -15.4300], cities: ['Las Palmas de Gran Canaria'] },
  { name: 'Santa Cruz de Tenerife', coordinates: [28.4636, -16.2518], cities: ['Santa Cruz de Tenerife'] },
  { name: 'San Cristóbal de La Laguna', coordinates: [28.4853, -16.3200], cities: ['San Cristóbal de La Laguna'] },
  
  // Ceuta y Melilla
  { name: 'Ceuta', coordinates: [35.8893, -5.3213], cities: ['Ceuta'] },
  { name: 'Melilla', coordinates: [35.2919, -2.9388], cities: ['Melilla'] }
];
