import React, { useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Branch,
  MarketPotential,
  DemandData,
  ExpansionZone,
  Competitor,
  StateData,
  LayerConfig,
} from '../../types';
import brazilStates from '../../assets/brazil-states.json';
import BranchLayer from './BranchLayer';
import MarketHeatLayer from './MarketHeatLayer';
import DemandBubbleLayer from './DemandBubbleLayer';
import ExpansionZoneLayer from './ExpansionZoneLayer';
import CompetitorLayer from './CompetitorLayer';
import { useTheme } from '../../contexts/ThemeContext';
import { Target } from 'lucide-react';

interface BrazilMapProps {
  layers: LayerConfig[];
  branches: Branch[];
  marketPotential: MarketPotential[];
  demand: DemandData[];
  expansionZones: ExpansionZone[];
  competitors: Competitor[];
  states: StateData[];
  regionFilter: string | null;
  searchFilter: string;
  selectedState: StateData | null;
  onStateClick: (state: StateData | null) => void;
}

const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253];

// ---------------------------------------------------------------------------
// Componentes de Legenda específicos
// ---------------------------------------------------------------------------
const PotentialLegend = () => (
  <div>
    <div style={{ marginBottom: 5 }}>Potencial de Mercado</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      <div
        style={{
          width: '100%',
          height: 10,
          borderRadius: 4,
          background:
            'linear-gradient(to right, #991b1b, #c2410c, #b45309, #065f46)',
        }}
        className="potential-gradient"
      />
    </div>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: 9,
        color: 'var(--text-dim)',
        marginTop: 2,
      }}
    >
      <span>Baixo</span>
      <span>Alto</span>
    </div>
    <style>{`
      [data-theme='dark'] .potential-gradient {
        background: linear-gradient(to right, #f87171, #fb923c, #fbbf24, #10b981) !important;
      }
    `}</style>
  </div>
);

const ExpansionLegend = ({ theme, isPotentialActive }: { theme: string; isPotentialActive?: boolean }) => {
  const colors =
    theme === 'light'
      ? ([
          ['#b45309', 'Alta'],
          ['#1d4ed8', 'Média'],
          ['#0369a1', 'Baixa'],
        ] as const)
      : ([
          ['#fbbf24', 'Alta'],
          ['#60a5fa', 'Média'],
          ['#38bdf8', 'Baixa'],
        ] as const);

  return (
    <div>
      <div style={{ marginBottom: 5 }}>Zonas de Expansão</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {colors.map(([color, label]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div
              style={{
                width: 16,
                height: 16,
                backgroundColor: color,
                borderRadius: '50%',
                border: '1px solid #ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isPotentialActive ? `0 0 5px ${color}` : 'none',
              }}
            >
              <Target size={10} color="#ffffff" strokeWidth={3} />
            </div>
            <span style={{ fontSize: 9 }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const LAYER_LEGENDS: Record<string, (props: any) => React.ReactNode> = {
  branches: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <img
        src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"
        alt="filial"
        style={{ width: 12, height: 20, objectFit: 'contain' }}
      />
      <span>Filiais Próprias</span>
    </div>
  ),
  competitors: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
      <img
        src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
        alt="concorrente"
        style={{ width: 12, height: 20, objectFit: 'contain' }}
      />
      <span>Concorrência</span>
    </div>
  ),
  potential: () => <PotentialLegend />,
  demand: () => (
    <div>
      <div style={{ marginBottom: 5 }}>Volume de Demanda</div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4 }}>
        {[8, 14, 22].map((r, i) => (
          <div
            key={i}
            style={{
              width: r,
              height: r,
              borderRadius: '50%',
              backgroundColor: 'rgba(255,69,0,0.6)',
              border: '1.5px solid var(--bg-card)',
            }}
          />
        ))}
        <span style={{ fontSize: 9, color: 'var(--text-dim)', marginLeft: 2 }}>menor → maior</span>
      </div>
    </div>
  ),
  expansion: ({ theme }) => <ExpansionLegend theme={theme} />,
};

const MapLegend = ({ layers }: { layers: LayerConfig[] }) => {
  const { theme } = useTheme();
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const active = layers.filter(l => l.active);
  if (active.length === 0) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: isMobile ? 12 : 24,
        left: isMobile ? 12 : 316,
        zIndex: 1100,
        backgroundColor: 'var(--tooltip-bg)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: isMobile ? '8px 10px' : '10px 14px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        pointerEvents: 'none',
        maxWidth: isMobile ? 150 : 200,
        animation: 'fadeIn 0.3s ease-out',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          fontSize: isMobile ? 8 : 10,
          color: 'var(--text-dim)',
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginBottom: isMobile ? 6 : 8,
        }}
      >
        Camadas ativas
      </div>
      {active.map(l => {
        const LegendItem = LAYER_LEGENDS[l.id];
        return (
          <div
            key={l.id}
            style={{
              fontSize: isMobile ? 10 : 12,
              color: 'var(--text-main)',
              marginBottom: l.id !== active[active.length - 1].id ? (isMobile ? 6 : 10) : 0,
            }}
          >
            {LegendItem ? (
              <LegendItem 
                theme={theme} 
                isMobile={isMobile} 
                isPotentialActive={layers.find(l => l.id === 'potential')?.active} 
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div
                  style={{
                    width: '100%',
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: l.color,
                  }}
                />
                {l.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Captura cliques no fundo do mapa para desselecionar estados
// ---------------------------------------------------------------------------
const MapEvents = ({ onClick }: { onClick: () => void }) => {
  const map = useMap();
  useEffect(() => {
    const handleMapClick = (e: any) => {
      if (
        e.originalEvent.target === map.getContainer() ||
        ((e.originalEvent.target as any).tagName === 'path' &&
          !(e.originalEvent.target as any).classList.contains('leaflet-interactive'))
      ) {
        onClick();
      }
    };
    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [map, onClick]);
  return null;
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------
const BrazilMap: React.FC<BrazilMapProps> = ({
  layers,
  branches,
  marketPotential,
  demand,
  expansionZones,
  competitors,
  states,
  regionFilter,
  searchFilter,
  selectedState,
  onStateClick,
}) => {
  const { theme } = useTheme();
  const isLayerActive = (id: string) => layers.find(l => l.id === id)?.active;
  const geoJsonRef = useRef<any>(null);
  const [hoveredUf, setHoveredUf] = React.useState<string | null>(null);

  // --- Refs para evitar stale closures nos handlers do Leaflet ---
  const selectedStateRef = useRef(selectedState);
  const onStateClickRef = useRef(onStateClick);
  const statesRef = useRef(states);
  const marketPotentialRef = useRef(marketPotential);
  const demandRef = useRef(demand);
  const layersRef = useRef(layers);

  useEffect(() => {
    selectedStateRef.current = selectedState;
  }, [selectedState]);
  useEffect(() => {
    onStateClickRef.current = onStateClick;
  }, [onStateClick]);
  useEffect(() => {
    statesRef.current = states;
  }, [states]);
  useEffect(() => {
    marketPotentialRef.current = marketPotential;
  }, [marketPotential]);
  useEffect(() => {
    demandRef.current = demand;
  }, [demand]);
  useEffect(() => {
    layersRef.current = layers;
  }, [layers]);

  // Computa o estilo completo do feature, incluindo estado de hover.
  const getStyle = useCallback(
    (feature: any) => {
      const uf = feature.properties.SIGLA;
      const stateInfo = statesRef.current.find(s => s.uf === uf);
      const isSelected = selectedStateRef.current?.uf === uf;
      const isHovered = hoveredUf === uf;
      const isInActiveRegion = regionFilter && stateInfo?.region === regionFilter;

      return {
        fillColor: 'var(--bg-dark)',
        weight: isSelected ? 3 : isInActiveRegion ? 2.5 : isHovered ? 1.5 : 1.2,
        opacity: 1,
        color: isSelected 
          ? 'var(--highlight)' 
          : isInActiveRegion 
            ? (theme === 'dark' ? '#ffffff' : '#30363d')
            : (theme === 'dark' ? '#444c56' : '#94a3b8'),
        fillOpacity: isSelected ? 0.9 : (regionFilter ? (isInActiveRegion ? 0 : 0.85) : 0),
      };
    },
    [regionFilter, hoveredUf, theme],
  );

  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.getLayers().forEach((layer: any) => {
      if (layer.feature) {
        const isMatch =
          searchFilter &&
          (layer.feature.properties.Estado.toLowerCase().includes(searchFilter.toLowerCase()) ||
            layer.feature.properties.SIGLA.toLowerCase() === searchFilter.toLowerCase());
        layer.setStyle({
          ...getStyle(layer.feature),
          fillOpacity: isMatch ? 0.9 : getStyle(layer.feature).fillOpacity,
          color: isMatch ? 'var(--highlight)' : getStyle(layer.feature).color,
          weight: isMatch ? 3 : getStyle(layer.feature).weight,
        });
      }
    });
  }, [selectedState, regionFilter, hoveredUf, getStyle, searchFilter]);

  // Zoom no mapa quando buscar um estado ou cidade
  useEffect(() => {
    if (!geoJsonRef.current || !searchFilter || searchFilter.length < 2) return;
    const term = searchFilter.toLowerCase();

    // Tenta achar estado
    const stateMatch = geoJsonRef.current
      .getLayers()
      .find(
        (l: any) =>
          l.feature.properties.Estado.toLowerCase().includes(term) ||
          l.feature.properties.SIGLA.toLowerCase() === term,
      );

    if (stateMatch) {
      // @ts-ignore
      const map = geoJsonRef.current._map;
      if (map) map.fitBounds(stateMatch.getBounds(), { padding: [20, 20], maxZoom: 6 });
      return;
    }

    // Tenta achar cidade em branches ou competitors
    const branchMatch = branches.find(b => b.city.toLowerCase().includes(term));
    const compMatch = competitors.find(c => c.city.toLowerCase().includes(term));
    const location = branchMatch || compMatch;

    if (location) {
      // @ts-ignore
      const map = geoJsonRef.current._map;
      if (map) map.setView([location.lat, location.lng], 10);
    }
  }, [searchFilter, branches, competitors]);

  // onEachState com deps vazias — lê tudo via refs, sem stale closures
  const onEachState = useCallback((feature: any, layer: any) => {
    const sigla = feature.properties.SIGLA;

    layer.bindTooltip(
      () => {
        const stateInfo = statesRef.current.find(s => s.uf === sigla);
        const name = `<strong>${stateInfo?.name || feature.properties.Estado}</strong>`;

        // Intelligence context
        let extra = '';
        const isPotActive = layersRef.current.find(l => l.id === 'potential')?.active;
        const isDemActive = layersRef.current.find(l => l.id === 'demand')?.active;

        if (isPotActive) {
          const score = marketPotentialRef.current.find(p => p.uf === sigla)?.score;
          if (score !== undefined)
            extra = `<br/><span style="color: var(--primary)">Potencial: ${score} pts</span>`;
        } else if (isDemActive) {
          const vol = demandRef.current.find(d => d.uf === sigla)?.volume;
          if (vol !== undefined)
            extra = `<br/><span style="color: #FF4500">Demanda: ${vol.toLocaleString('pt-BR')} un</span>`;
        }

        return `<div>${name}${extra}</div>`;
      },
      { sticky: true, direction: 'top', permanent: false, className: 'custom-map-tooltip' },
    );

    layer.on({
      click: (e: any) => {
        if (e.originalEvent) e.originalEvent.stopPropagation();
        layer.closeTooltip();

        if (selectedStateRef.current?.uf === sigla) {
          onStateClickRef.current(null);
          return;
        }

        const stateData = statesRef.current.find(s => s.uf === sigla);
        if (stateData) {
          onStateClickRef.current({
            ...stateData,
            totalPopulation: feature.properties.Total,
            men: feature.properties.Homens,
            women: feature.properties.Mulheres,
            urban: feature.properties.Urbana,
            rural: feature.properties.Rural,
            literacyRate: feature.properties.TX_Alfab,
          });
        }
      },
      mouseover: (_e: any) => {
        setHoveredUf(sigla);
      },
      mouseout: (_e: any) => {
        setHoveredUf(null);
      },
    });
  }, []); // deps vazias — lê tudo via refs

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapLegend layers={layers} />
      
      <MapContainer
        center={BRAZIL_CENTER}
        zoom={4}
        minZoom={3}
        maxZoom={10}
        style={{ width: '100%', height: '100%', background: 'var(--bg-dark)' }}
        attributionControl={false}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <MapEvents onClick={() => onStateClick(null)} />
        {theme === 'dark' ? (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        ) : (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        )}

        {/* Prevent rendering intel layers until GeoJSON/Map is ready to avoid reference errors */}
        <GeoJSON
          key={`geojson-${regionFilter}-${theme}`}
          ref={geoJsonRef}
          data={brazilStates as any}
          style={getStyle}
          onEachFeature={onEachState}
        />

        {geoJsonRef.current && (
          <>
            {isLayerActive('potential') && (
              <MarketHeatLayer
                data={marketPotential}
                statesGeoJson={brazilStates}
                regionFilter={regionFilter}
                states={states}
              />
            )}
            {isLayerActive('branches') && (
              <BranchLayer
                data={branches}
                regionFilter={regionFilter}
                searchFilter={searchFilter}
              />
            )}
            <DemandBubbleLayer
              data={demand}
              states={states}
              regionFilter={regionFilter}
              active={!!isLayerActive('demand')}
            />
            {isLayerActive('expansion') && (
              <ExpansionZoneLayer
                data={expansionZones}
                statesGeoJson={brazilStates}
                regionFilter={regionFilter}
                states={states}
                isPotentialActive={!!isLayerActive('potential')}
              />
            )}
            {isLayerActive('competitors') && (
              <CompetitorLayer
                data={competitors}
                regionFilter={regionFilter}
                searchFilter={searchFilter}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default BrazilMap;
