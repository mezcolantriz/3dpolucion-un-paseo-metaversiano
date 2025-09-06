import axios from 'axios';
import type { AirQualityData, WeatherData } from '../types';
import { AirQualityLevel, SpainCities } from '../types';

// API gratuita de OpenWeatherMap para calidad del aire
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || 'demo_key';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

class AirQualityService {
  private readonly retryAttempts = 3;
  private readonly retryDelay = 1000;
  private readonly requestDelay = 100; // Delay entre requests para no sobrecargar la API

  /**
   * Obtiene datos de calidad del aire para TODAS las ciudades de España + CLIMA
   */
  async getAllSpainCitiesData(): Promise<AirQualityData[]> {
    const results: AirQualityData[] = [];
    const errors: string[] = [];
    
    console.log(`🌍 Iniciando requests a ${SpainCities.length} ciudades españolas + DATOS METEOROLÓGICOS...`);
    console.log(`🔑 Usando API key: ${OPENWEATHER_API_KEY.substring(0, 8)}...`);
    
    // Procesar ciudades en lotes más pequeños para API gratuita
    const batchSize = 3; // Reducido para plan gratuito
    for (let i = 0; i < SpainCities.length; i += batchSize) {
      const batch = SpainCities.slice(i, i + batchSize);
      
      console.log(`📦 Procesando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(SpainCities.length/batchSize)}: ${batch.map(c => c.name).join(', ')}`);
      
      const batchPromises = batch.map(async (city, index) => {
        try {
          // Delay progresivo para evitar rate limiting
          await this.delay(index * this.requestDelay * 2);
          
          // Obtener datos de aire Y clima simultáneamente
          const [airData, weatherData] = await Promise.all([
            this.getAirQualityData(city.coordinates[0], city.coordinates[1], city.name),
            this.getWeatherData(city.coordinates[0], city.coordinates[1], city.name)
          ]);
          
          // Combinar datos de aire + clima transformando el formato
          const combinedData: AirQualityData = {
            ...airData,
            weather: {
              main: weatherData.current.description.split(' ')[0] || 'Clear',
              description: weatherData.current.description,
              temperature: weatherData.current.temperature,
              humidity: weatherData.current.humidity,
              windSpeed: weatherData.current.windSpeed,
              windDirection: weatherData.current.windDirection,
              visibility: 10000, // valor por defecto
              pressure: weatherData.current.pressure,
              icon: this.getWeatherIcon(weatherData.current.weatherCode)
            }
          };
          
          console.log(`✅ ${city.name}: AQI ${airData.measurements.aqi} (${airData.quality}) + 🌤️ ${weatherData.current.description} ${weatherData.current.temperature}°C`);
          return combinedData;
        } catch (error) {
          console.warn(`❌ Error en ${city.name}:`, error);
          errors.push(`${city.name}: ${error}`);
          
          // Devolver datos simulados en caso de error
          const mockData = this.generateMockAirQualityDataWithWeather(city.coordinates[0], city.coordinates[1], city.name);
          console.log(`🎭 ${city.name}: Usando datos simulados (AQI ${mockData.measurements.aqi}) + 🌤️ ${mockData.weather?.main}`);
          return mockData;
        }
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Delay más largo entre lotes para API gratuita
      if (i + batchSize < SpainCities.length) {
        console.log('⏱️ Esperando entre lotes...');
        await this.delay(1000); // 1 segundo entre lotes
      }
    }
    
    console.log(`🎉 ¡Completado! ${results.length} ciudades cargadas`);
    console.log(`📊 Distribución por calidad:`);
    const qualityCount = results.reduce((acc, city) => {
      acc[city.quality] = (acc[city.quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    Object.entries(qualityCount).forEach(([quality, count]) => {
      console.log(`   ${quality}: ${count} ciudades`);
    });
    
    if (errors.length > 0) {
      console.log(`⚠️ Errores en ${errors.length} ciudades (usando datos simulados)`);
    }
    
    return results;
  }

  /**
   * Función de delay para controlar rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene datos de calidad del aire para una ubicación específica
   */
  async getAirQualityData(lat: number, lon: number, locationName: string): Promise<AirQualityData> {
    try {
      // Intentar con OpenWeatherMap primero
      const response = await this.retryRequest(() =>
        axios.get(`${OPENWEATHER_BASE_URL}/air_pollution`, {
          params: {
            lat,
            lon,
            appid: OPENWEATHER_API_KEY || 'demo_key'
          }
        })
      );

      const data = response.data;
      const measurements = data.list[0].components;
      const aqi = data.list[0].main.aqi;

      // LOG PARA CONFIRMAR DATOS REALES
      console.log(`🌍 DATOS REALES API para ${locationName}:`, {
        timestamp: new Date().toISOString(),
        api_response: {
          aqi: aqi,
          pm25: measurements.pm2_5,
          pm10: measurements.pm10,
          no2: measurements.no2,
          o3: measurements.o3
        },
        coordinates: [lat, lon],
        source: 'OpenWeatherMap API REAL'
      });

      return {
        location: {
          latitude: lat,
          longitude: lon,
          name: locationName,
          region: this.getRegionFromCoordinates(lat, lon)
        },
        measurements: {
          pm25: measurements.pm2_5 || 0,
          pm10: measurements.pm10 || 0,
          no2: measurements.no2 || 0,
          o3: measurements.o3 || 0,
          so2: measurements.so2 || 0,
          co: measurements.co || 0,
          aqi: aqi
        },
        timestamp: new Date().toISOString(),
        quality: this.getAirQualityLevel(aqi)
      };
    } catch (error) {
      console.warn(`Error obteniendo datos reales para ${locationName}, usando datos simulados:`, error);
      return this.generateMockAirQualityData(lat, lon, locationName);
    }
  }

  /**
   * Obtiene datos meteorológicos para una ubicación específica
   */
  async getWeatherData(lat: number, lon: number, locationName: string): Promise<WeatherData> {
    try {
      const response = await this.retryRequest(() =>
        axios.get(`${OPENWEATHER_BASE_URL}/weather`, {
          params: {
            lat,
            lon,
            appid: OPENWEATHER_API_KEY || 'demo_key',
            units: 'metric'
          }
        })
      );

      const data = response.data;

      return {
        location: {
          latitude: lat,
          longitude: lon,
          name: locationName
        },
        current: {
          temperature: data.main.temp,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed,
          windDirection: data.wind.deg,
          precipitation: data.rain?.['1h'] || 0,
          pressure: data.main.pressure,
          weatherCode: data.weather[0].id,
          description: data.weather[0].description
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.warn(`Error obteniendo datos meteorológicos para ${locationName}, usando datos simulados:`, error);
      return this.generateMockWeatherData(lat, lon, locationName);
    }
  }

  /**
   * Obtiene datos para todas las ciudades principales de España
   */
  async getAllSpainAirQualityData(): Promise<AirQualityData[]> {
    const promises = SpainCities.map(region =>
      this.getAirQualityData(
        region.coordinates[0],
        region.coordinates[1],
        region.name
      )
    );

    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error obteniendo datos de todas las ciudades:', error);
      return SpainCities.map(region =>
        this.generateMockAirQualityData(
          region.coordinates[0],
          region.coordinates[1],
          region.name
        )
      );
    }
  }

  /**
   * Convierte el índice AQI a nivel de calidad del aire
   */
  private getAirQualityLevel(aqi: number): AirQualityLevel {
    if (aqi === 1) return AirQualityLevel.EXCELLENT;
    if (aqi === 2) return AirQualityLevel.GOOD;
    if (aqi === 3) return AirQualityLevel.MODERATE;
    if (aqi === 4) return AirQualityLevel.POOR;
    if (aqi === 5) return AirQualityLevel.VERY_POOR;
    return AirQualityLevel.HAZARDOUS;
  }

  /**
   * Obtiene la región basada en coordenadas
   */
  private getRegionFromCoordinates(lat: number, lon: number): string {
    const region = SpainCities.find(city => {
      const distance = Math.sqrt(
        Math.pow(city.coordinates[0] - lat, 2) + 
        Math.pow(city.coordinates[1] - lon, 2)
      );
      return distance < 2; // Aproximadamente 200km
    });
    return region?.name || 'España';
  }

  /**
   * Genera datos simulados de calidad del aire para desarrollo/demo
   */
  private generateMockAirQualityData(lat: number, lon: number, locationName: string): AirQualityData {
    const baseValue = Math.sin(lat * lon) * 0.5 + 0.5; // Valor base seudoaleatorio
    const timeVariation = Math.sin(Date.now() / 60000) * 0.3; // Variación temporal
    const pollutionLevel = Math.max(0.1, Math.min(1, baseValue + timeVariation));

    const pm25 = pollutionLevel * 50 + Math.random() * 10;
    const aqi = Math.ceil(pollutionLevel * 5);

    return {
      location: {
        latitude: lat,
        longitude: lon,
        name: locationName,
        region: this.getRegionFromCoordinates(lat, lon)
      },
      measurements: {
        pm25,
        pm10: pm25 * 1.5 + Math.random() * 5,
        no2: pollutionLevel * 40 + Math.random() * 8,
        o3: pollutionLevel * 80 + Math.random() * 15,
        so2: pollutionLevel * 20 + Math.random() * 5,
        co: pollutionLevel * 2 + Math.random() * 0.5,
        aqi
      },
      timestamp: new Date().toISOString(),
      quality: this.getAirQualityLevel(aqi)
    };
  }

  /**
   * Genera datos meteorológicos simulados
   */
  private generateMockWeatherData(lat: number, lon: number, locationName: string): WeatherData {
    return {
      location: {
        latitude: lat,
        longitude: lon,
        name: locationName
      },
      current: {
        temperature: 15 + Math.random() * 20,
        humidity: 40 + Math.random() * 40,
        windSpeed: Math.random() * 15,
        windDirection: Math.random() * 360,
        precipitation: Math.random() * 5,
        pressure: 1000 + Math.random() * 40,
        weatherCode: 800,
        description: 'Cielo despejado'
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Convierte código meteorológico a icono
   */
  private getWeatherIcon(weatherCode: number): string {
    if (weatherCode >= 200 && weatherCode < 300) return '11d'; // Tormenta
    if (weatherCode >= 300 && weatherCode < 400) return '09d'; // Llovizna
    if (weatherCode >= 500 && weatherCode < 600) return '10d'; // Lluvia
    if (weatherCode >= 600 && weatherCode < 700) return '13d'; // Nieve
    if (weatherCode >= 700 && weatherCode < 800) return '50d'; // Niebla
    if (weatherCode === 800) return '01d'; // Despejado
    if (weatherCode > 800) return '02d'; // Nubes
    return '01d'; // Por defecto
  }

  /**
   * Genera datos simulados de calidad del aire + clima
   */
  generateMockAirQualityDataWithWeather(latitude: number, longitude: number, cityName: string): AirQualityData {
    const baseData = this.generateMockAirQualityData(latitude, longitude, cityName);
    
    // Generar clima simulado
    const weatherConditions = ['Clear', 'Clouds', 'Rain', 'Drizzle', 'Snow', 'Mist'];
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    
    return {
      ...baseData,
      weather: {
        main: randomWeather,
        description: randomWeather.toLowerCase(),
        temperature: Math.random() * 30 + 5, // 5-35°C
        humidity: Math.random() * 60 + 30,    // 30-90%
        windSpeed: Math.random() * 10,        // 0-10 m/s
        windDirection: Math.random() * 360,   // 0-360°
        visibility: Math.random() * 5000 + 5000, // 5-10km
        pressure: Math.random() * 50 + 1000,  // 1000-1050 hPa
        icon: randomWeather === 'Clear' ? '01d' : randomWeather === 'Clouds' ? '02d' : '10d'
      }
    };
  }

  /**
   * Implementa reintentos para las peticiones HTTP
   */
  private async retryRequest<T>(
    requestFn: () => Promise<T>,
    attempt: number = 1
  ): Promise<T> {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt < this.retryAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
        return this.retryRequest(requestFn, attempt + 1);
      }
      throw error;
    }
  }
}

export const airQualityService = new AirQualityService();
