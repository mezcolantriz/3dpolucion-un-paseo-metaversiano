import axios from 'axios';
import type { AirQualityData, WeatherData } from '../types';
import { AirQualityLevel, SpainCities } from '../types';

// API gratuita de OpenWeatherMap para calidad del aire
const OPENWEATHER_API_KEY = 'YOUR_API_KEY'; // Se debe configurar en variables de entorno
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

class AirQualityService {
  private readonly retryAttempts = 3;
  private readonly retryDelay = 1000;

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
