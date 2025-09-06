import { useState, useEffect, useCallback } from 'react';
import type { AirQualityData } from '../types';
import { airQualityService } from '../services/airQualityService';

interface UseAirQualityReturn {
  data: AirQualityData[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  lastUpdate: Date | null;
}

export const useAirQuality = (autoRefresh: boolean = true, refreshInterval: number = 300000): UseAirQualityReturn => {
  const [data, setData] = useState<AirQualityData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      console.log('🌍 Iniciando carga de datos de todas las ciudades españolas...');
      const airQualityData = await airQualityService.getAllSpainCitiesData();
      setData(airQualityData);
      setLastUpdate(new Date());
      console.log(`✅ Datos cargados: ${airQualityData.length} ciudades`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al obtener datos de calidad del aire: ${errorMessage}`);
      console.error('Error fetching air quality data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  return {
    data,
    loading,
    error,
    refreshData,
    lastUpdate
  };
};
