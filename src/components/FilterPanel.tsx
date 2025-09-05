import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import type { AirQualityData, AirQualityLevel } from '../types';
import { AirQualityColors, AirQualityLevel as AQL } from '../types';
import { getQualityDescription } from '../utils';

const SidePanel = styled(motion.div)<{ isOpen: boolean }>`
  posi            <FilterButton
              active={sortBy === 'aqi'}
              onClick={() => handleSortChange('aqi')}
            >
              AQI ↓
            </FilterButton>
            <FilterButton
              active={sortBy === 'name'}
              onClick={() => handleSortChange('name')}
            >
              Nombre ↓
            </FilterButton>
            <FilterButton
              active={sortBy === 'pm25'}
              onClick={() => handleSortChange('pm25')}
            >
              PM2.5 ↓eft: ${props => props.isOpen ? '0' : '-400px'};
  top: 0;
  width: 380px;
  height: 100vh;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow-y: auto;
  transition: left 0.3s ease;
`;

const ToggleButton = styled.button<{ isOpen: boolean }>`
  position: fixed;
  left: ${props => props.isOpen ? '380px' : '0'};
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 100px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border: none;
  border-radius: 0 12px 12px 0;
  cursor: pointer;
  z-index: 1001;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #667eea;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);

  &:hover {
    background: rgba(102, 126, 234, 0.1);
    transform: translateY(-50%) translateX(2px);
  }
`;

const PanelHeader = styled.div`
  padding: 24px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
`;

const PanelTitle = styled.h2`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
`;

const PanelSubtitle = styled.p`
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
`;

const FilterSection = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;

const FilterTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  color: #2d3748;
  font-weight: 600;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-bottom: 16px;
`;

const FilterButton = styled.button<{ active: boolean; color?: string }>`
  padding: 8px 12px;
  border: 2px solid ${props => props.active ? (props.color || '#667eea') : 'rgba(0, 0, 0, 0.1)'};
  background: ${props => props.active ? (props.color || '#667eea') : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  text-align: center;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border: 2px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  font-size: 14px;
  background: white;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
  }

  &::placeholder {
    color: #a0aec0;
  }
`;

const LocationList = styled.div`
  padding: 0 20px 20px;
`;

const LocationItem = styled(motion.div)<{ qualityColor: string; isSelected?: boolean }>`
  background: ${props => props.isSelected ? 'rgba(102, 126, 234, 0.1)' : 'white'};
  border: 2px solid ${props => props.isSelected ? '#667eea' : 'rgba(0, 0, 0, 0.05)'};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    border-color: ${props => props.qualityColor};
  }

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: ${props => props.qualityColor};
  }
`;

const LocationHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: flex-start;
  margin-bottom: 12px;
`;

const LocationName = styled.h4`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
  flex: 1;
`;

const AQIBadge = styled.div<{ color: string }>`
  background: ${props => props.color};
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  min-width: 40px;
  text-align: center;
`;

const LocationDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-bottom: 8px;
`;

const DetailItem = styled.div`
  text-align: center;
  padding: 8px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
`;

const DetailLabel = styled.div`
  font-size: 10px;
  color: #718096;
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const DetailValue = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #2d3748;
`;

const QualityDescription = styled.div`
  font-size: 12px;
  color: #4a5568;
  font-style: italic;
`;

const StatsSection = styled.div`
  padding: 20px;
  background: rgba(102, 126, 234, 0.05);
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const StatCard = styled.div`
  background: white;
  padding: 16px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const StatValue = styled.div`
  font-size: 24px;
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

interface FilterPanelProps {
  airQualityData: AirQualityData[];
  onLocationSelect: (data: AirQualityData) => void;
  selectedLocation: AirQualityData | null;
  // Props para filtros globales compartidos
  searchTerm?: string;
  onSearchChange?: (term: string) => void;
  selectedFilters?: AirQualityLevel[];
  onFiltersChange?: (filters: AirQualityLevel[]) => void;
  sortBy?: 'aqi' | 'name' | 'pm25';
  onSortChange?: (sort: 'aqi' | 'name' | 'pm25') => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  airQualityData,
  onLocationSelect,
  selectedLocation,
  searchTerm: externalSearchTerm,
  onSearchChange,
  selectedFilters: externalSelectedFilters,
  onFiltersChange,
  sortBy: externalSortBy,
  onSortChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Usar estado local si no hay props externas, sino usar las externas
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localSelectedFilters, setLocalSelectedFilters] = useState<AirQualityLevel[]>([]);
  const [localSortBy, setLocalSortBy] = useState<'aqi' | 'name' | 'pm25'>('aqi');
  
  // Determinar qué estado usar
  const searchTerm = externalSearchTerm !== undefined ? externalSearchTerm : localSearchTerm;
  const selectedFilters = externalSelectedFilters !== undefined ? externalSelectedFilters : localSelectedFilters;
  const sortBy = externalSortBy !== undefined ? externalSortBy : localSortBy;
  
  // Funciones para manejar cambios
  const handleSearchChange = (term: string) => {
    if (onSearchChange) {
      onSearchChange(term);
    } else {
      setLocalSearchTerm(term);
    }
  };
  
  const handleFiltersChange = (filters: AirQualityLevel[]) => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    } else {
      setLocalSelectedFilters(filters);
    }
  };
  
  const handleSortChange = (sort: 'aqi' | 'name' | 'pm25') => {
    if (onSortChange) {
      onSortChange(sort);
    } else {
      setLocalSortBy(sort);
    }
  };

  // Filtrar y ordenar datos
  const filteredData = useMemo(() => {
    let filtered = airQualityData.filter(data =>
      data.location.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (selectedFilters.length > 0) {
      filtered = filtered.filter(data => selectedFilters.includes(data.quality));
    }

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'aqi':
          return b.measurements.aqi - a.measurements.aqi;
        case 'name':
          return a.location.name.localeCompare(b.location.name);
        case 'pm25':
          return b.measurements.pm25 - a.measurements.pm25;
        default:
          return 0;
      }
    });
  }, [airQualityData, searchTerm, selectedFilters, sortBy]);

  // Estadísticas
  const stats = useMemo(() => {
    if (airQualityData.length === 0) return { avgAqi: 0, maxPM25: 0, worstCity: '', bestCity: '' };

    const aqis = airQualityData.map(d => d.measurements.aqi);
    const pm25s = airQualityData.map(d => d.measurements.pm25);
    
    const avgAqi = aqis.reduce((sum, aqi) => sum + aqi, 0) / aqis.length;
    const maxPM25 = Math.max(...pm25s);
    
    const sortedByAqi = [...airQualityData].sort((a, b) => b.measurements.aqi - a.measurements.aqi);
    const worstCity = sortedByAqi[0]?.location.name || '';
    const bestCity = sortedByAqi[sortedByAqi.length - 1]?.location.name || '';

    return {
      avgAqi: Math.round(avgAqi * 10) / 10,
      maxPM25: Math.round(maxPM25 * 10) / 10,
      worstCity,
      bestCity
    };
  }, [airQualityData]);

  const toggleFilter = (level: AirQualityLevel) => {
    const newFilters = selectedFilters.includes(level)
      ? selectedFilters.filter((f: AirQualityLevel) => f !== level)
      : [...selectedFilters, level];
    handleFiltersChange(newFilters);
  };

  const qualityLevels = [
    { level: AQL.EXCELLENT, label: 'Excelente' },
    { level: AQL.GOOD, label: 'Buena' },
    { level: AQL.MODERATE, label: 'Moderada' },
    { level: AQL.POOR, label: 'Mala' },
    { level: AQL.VERY_POOR, label: 'Muy Mala' },
    { level: AQL.HAZARDOUS, label: 'Peligrosa' }
  ];

  return (
    <>
      <ToggleButton isOpen={isOpen} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? '◀' : '▶'}
      </ToggleButton>

      <SidePanel
        isOpen={isOpen}
        initial={{ x: -400 }}
        animate={{ x: isOpen ? 0 : -400 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <PanelHeader>
          <PanelTitle>Calidad del Aire</PanelTitle>
          <PanelSubtitle>
            {filteredData.length} de {airQualityData.length} ubicaciones
          </PanelSubtitle>
        </PanelHeader>

        <FilterSection>
          <FilterTitle>🔍 Buscar ubicación</FilterTitle>
          <SearchInput
            type="text"
            placeholder="Buscar por ciudad..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </FilterSection>

        <FilterSection>
          <FilterTitle>📊 Ordenar por</FilterTitle>
          <FilterGrid>
            <FilterButton
              active={sortBy === 'aqi'}
              onClick={() => handleSortChange('aqi')}
            >
              AQI ↓
            </FilterButton>
            <FilterButton
              active={sortBy === 'name'}
              onClick={() => handleSortChange('name')}
            >
              Nombre ↑
            </FilterButton>
            <FilterButton
              active={sortBy === 'pm25'}
              onClick={() => handleSortChange('pm25')}
            >
              PM2.5 ↓
            </FilterButton>
          </FilterGrid>
        </FilterSection>

        <FilterSection>
          <FilterTitle>🎯 Filtrar por calidad</FilterTitle>
          <FilterGrid>
            {qualityLevels.map(({ level, label }) => (
              <FilterButton
                key={level}
                active={selectedFilters.includes(level)}
                color={AirQualityColors[level]}
                onClick={() => toggleFilter(level)}
              >
                {label}
              </FilterButton>
            ))}
          </FilterGrid>
        </FilterSection>

        <LocationList>
          <AnimatePresence>
            {filteredData.map((data, index) => (
              <LocationItem
                key={data.location.name}
                qualityColor={AirQualityColors[data.quality]}
                isSelected={selectedLocation?.location.name === data.location.name}
                onClick={() => onLocationSelect(data)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LocationHeader>
                  <LocationName>{data.location.name}</LocationName>
                  <AQIBadge color={AirQualityColors[data.quality]}>
                    {data.measurements.aqi}
                  </AQIBadge>
                </LocationHeader>

                <LocationDetails>
                  <DetailItem>
                    <DetailLabel>PM2.5</DetailLabel>
                    <DetailValue>{data.measurements.pm25.toFixed(1)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>PM10</DetailLabel>
                    <DetailValue>{data.measurements.pm10.toFixed(1)}</DetailValue>
                  </DetailItem>
                  <DetailItem>
                    <DetailLabel>NO2</DetailLabel>
                    <DetailValue>{data.measurements.no2.toFixed(1)}</DetailValue>
                  </DetailItem>
                </LocationDetails>

                <QualityDescription>
                  {getQualityDescription(data.quality)}
                </QualityDescription>
              </LocationItem>
            ))}
          </AnimatePresence>
        </LocationList>

        <StatsSection>
          <FilterTitle>📈 Estadísticas Generales</FilterTitle>
          <StatGrid>
            <StatCard>
              <StatValue>{stats.avgAqi}</StatValue>
              <StatLabel>AQI Promedio</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{stats.maxPM25}</StatValue>
              <StatLabel>PM2.5 Máximo</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue style={{ fontSize: '14px', lineHeight: 1.2 }}>
                {stats.worstCity}
              </StatValue>
              <StatLabel>Peor Calidad</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue style={{ fontSize: '14px', lineHeight: 1.2 }}>
                {stats.bestCity}
              </StatValue>
              <StatLabel>Mejor Calidad</StatLabel>
            </StatCard>
          </StatGrid>
        </StatsSection>
      </SidePanel>
    </>
  );
};
