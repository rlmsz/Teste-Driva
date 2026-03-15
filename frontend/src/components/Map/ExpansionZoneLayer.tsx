import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { ExpansionZone } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';

interface ExpansionZoneLayerProps {
  data: ExpansionZone[];
  statesGeoJson: any;
  regionFilter?: string | null;
  states?: any[];
}

const ExpansionZoneLayer: React.FC<ExpansionZoneLayerProps> = ({
  data,
  statesGeoJson,
  regionFilter,
  states,
}) => {
  const { theme } = useTheme();

  const getPriorityColor = (priority: string) => {
    if (theme === 'light') {
      switch (priority) {
        case 'High':
          return '#b45309'; // Amber 700
        case 'Medium':
          return '#1d4ed8'; // Blue 700
        case 'Low':
          return '#0369a1'; // Sky 700
        default:
          return 'transparent';
      }
    }

    switch (priority) {
      case 'High':
        return '#fbbf24'; // Amber 400
      case 'Medium':
        return '#60a5fa'; // Blue 400
      case 'Low':
        return '#38bdf8'; // Sky 400
      default:
        return 'transparent';
    }
  };

  const style = (feature: any) => {
    const uf = feature.properties.SIGLA;
    const stateInfo = states?.find(s => s.uf === uf);
    const isInRegion = !regionFilter || stateInfo?.region === regionFilter;
    const zone = data.find(z => z.uf === uf);

    return {
      fillColor: zone && isInRegion ? getPriorityColor(zone.priority) : 'transparent',
      weight: zone && isInRegion ? 1.5 : 0,
      color: 'var(--map-border)', // Theme-aware border
      opacity: zone && isInRegion ? 1 : 0,
      fillOpacity: zone && isInRegion ? (theme === 'dark' ? 0.8 : 0.7) : 0,
      pointerEvents: 'none',
    };
  };

  return (
    <GeoJSON
      key={`expansion-${regionFilter}-${theme}`}
      data={statesGeoJson}
      style={style}
      interactive={false}
    />
  );
};

export default ExpansionZoneLayer;
