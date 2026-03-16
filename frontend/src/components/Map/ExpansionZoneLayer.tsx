import React from 'react';
import { GeoJSON, Marker, useMap, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { ExpansionZone, StateData } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { Target } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';

interface ExpansionZoneLayerProps {
  data: ExpansionZone[];
  statesGeoJson: any;
  regionFilter?: string | null;
  states?: any[];
  isPotentialActive?: boolean;
}

const STATE_CENTERS: Record<string, [number, number]> = {
  'AC': [-9.0238, -70.812], 'AL': [-9.5713, -36.782], 'AP': [1.41, -51.77], 'AM': [-3.4168, -64.183],
  'BA': [-12.9711, -38.5108], 'CE': [-5.4984, -39.3206], 'DF': [-15.7998, -47.8645], 'ES': [-19.1834, -40.3089],
  'GO': [-15.827, -49.836], 'MA': [-5.424, -45.441], 'MT': [-12.64, -55.42], 'MS': [-20.77, -54.7],
  'MG': [-18.5122, -44.555], 'PA': [-3.79, -52.48], 'PB': [-7.24, -36.78], 'PR': [-24.89, -51.31],
  'PE': [-8.81, -36.95], 'PI': [-7.73, -42.73], 'RJ': [-22.84, -43.15], 'RN': [-5.81, -36.59],
  'RS': [-30.03, -51.23], 'RO': [-10.83, -63.34], 'RR': [1.89, -61.35], 'SC': [-27.27, -50.49],
  'SP': [-23.55, -46.63], 'SE': [-10.57, -37.45], 'TO': [-10.25, -48.25],
};

const ExpansionZoneLayer: React.FC<ExpansionZoneLayerProps> = ({
  data,
  statesGeoJson,
  regionFilter,
  states,
  isPotentialActive,
}) => {
  const { theme } = useTheme();
  const map = useMap();
  const [paneReady, setPaneReady] = React.useState(false);

  React.useEffect(() => {
    if (!map.getPane('expansionPane')) {
      map.createPane('expansionPane');
      const pane = map.getPane('expansionPane');
      if (pane) {
        pane.style.zIndex = '700';
        pane.style.pointerEvents = 'none';
      }
    }
    setPaneReady(true);
  }, [map]);

  if (!paneReady) return null;

  const getPriorityColor = (priority: string) => {
    if (theme === 'light') {
      switch (priority) {
        case 'High': return '#b45309';
        case 'Medium': return '#1d4ed8';
        case 'Low': return '#0369a1';
        default: return 'transparent';
      }
    }
    switch (priority) {
      case 'High': return '#fbbf24';
      case 'Medium': return '#60a5fa';
      case 'Low': return '#38bdf8';
      default: return 'transparent';
    }
  };

  const style = (feature: any) => {
    const uf = feature.properties.SIGLA;
    const stateInfo = states?.find(s => s.uf === uf);
    const isInRegion = !regionFilter || stateInfo?.region === regionFilter;
    const zone = data.find(z => z.uf === uf);

    return {
      fillColor: zone && isInRegion && !isPotentialActive ? getPriorityColor(zone.priority) : 'transparent',
      weight: zone && isInRegion && !isPotentialActive ? 1.5 : 0,
      color: 'var(--map-border)',
      opacity: zone && isInRegion && !isPotentialActive ? 1 : 0,
      fillOpacity: zone && isInRegion && !isPotentialActive ? (theme === 'dark' ? 0.7 : 0.6) : 0,
      pointerEvents: 'none',
    };
  };

  return (
    <>
      <GeoJSON
        key={`expansion-bg-${regionFilter}-${theme}-${isPotentialActive}`}
        data={statesGeoJson}
        style={style}
        interactive={false}
        pane="expansionPane"
      />
      {isPotentialActive && data.map(zone => {
        const stateInfo = states?.find(s => s.uf === zone.uf);
        const isInRegion = !regionFilter || stateInfo?.region === regionFilter;
        const center = STATE_CENTERS[zone.uf];

        if (!isInRegion || !center) return null;

        const color = getPriorityColor(zone.priority);
        const iconHtml = renderToStaticMarkup(
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            color: '#ffffff',
            backgroundColor: color,
            borderRadius: '50%',
            border: '2px solid #ffffff',
            boxShadow: `0 0 15px ${color}`,
          }}>
            <Target size={20} strokeWidth={3} />
          </div>
        );

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'expansion-target-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
        });

        return (
          <Marker 
            key={`expansion-marker-${zone.uf}`} 
            position={center} 
            icon={customIcon}
            interactive={true}
            pane="expansionPane"
          >
            <Tooltip direction="top" opacity={1} sticky={true} className="custom-map-tooltip">
              <div>
                <strong style={{ color: color }}>Zona de Expansão — {zone.uf}</strong><br />
                <span>Prioridade: <strong>{zone.priority === 'High' ? 'Alta' : zone.priority === 'Medium' ? 'Média' : 'Baixa'}</strong></span><br />
                <small style={{ color: 'var(--text-dim)', fontSize: '10px' }}>{zone.reason}</small>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </>
  );
};

export default ExpansionZoneLayer;
