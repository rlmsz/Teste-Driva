import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { MarketPotential } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface MarketHeatLayerProps {
  data: MarketPotential[];
  statesGeoJson: any;
  regionFilter?: string | null;
  states?: any[];
}

const MarketHeatLayer: React.FC<MarketHeatLayerProps> = ({
  data,
  statesGeoJson,
  regionFilter,
  states,
}) => {
  const { theme } = useTheme();

  const getColor = (score: number) => {
    if (theme === 'light') {
      return score > 80
        ? '#065f46' // Emerald 800
        : score > 60
          ? '#b45309' // Amber 700
          : score > 40
            ? '#c2410c' // Orange 700
            : '#991b1b'; // Red 800
    }

    return score > 80
      ? '#00ffaa' // Vibrant Primary-like Cyan/Emerald
      : score > 60
        ? '#ffcc00' // Gold
        : score > 40
          ? '#ff8800' // Orange
          : '#ff4444'; // Red vibrant
  };

  const style = (feature: any) => {
    const uf = feature.properties.SIGLA;
    const stateInfo = states?.find(s => s.uf === uf);
    const isInRegion = !regionFilter || stateInfo?.region === regionFilter;
    const potential = data.find(p => p.uf === uf);

    return {
      fillColor: potential && isInRegion ? getColor(potential.score) : 'transparent',
      weight: potential && isInRegion ? 1 : 0,
      color: 'var(--map-border)', // Theme-aware border
      fillOpacity: potential && isInRegion ? (theme === 'dark' ? 0.8 : 0.7) : 0,
      opacity: potential && isInRegion ? 1 : 0,
      pointerEvents: 'none',
    };
  };

  return (
    <GeoJSON
      key={`heat-${regionFilter}-${theme}`}
      data={statesGeoJson}
      style={style}
      interactive={false}
    />
  );
};

export default MarketHeatLayer;
