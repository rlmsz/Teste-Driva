import React, { useRef, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, ZoomControl, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
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
import { useIsMobile } from '../../hooks/useIsMobile';
import { Target } from 'lucide-react';
import { BRAZIL_CENTER } from '../../constants';

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
          background: 'linear-gradient(to right, #991b1b, #c2410c, #b45309, #065f46)',
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

const ExpansionLegend = ({
  theme,
  isPotentialActive,
}: {
  theme: string;
  isPotentialActive?: boolean;
}) => {
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
  const isMobile = useIsMobile();

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
// Hooks de eventos do mapa
// ---------------------------------------------------------------------------
const MapEvents = ({ onClick }: { onClick: () => void }) => {
  useMapEvents({
    click: e => {
      if (
        (e.originalEvent.target as HTMLElement).classList.contains('leaflet-container') ||
        ((e.originalEvent.target as any).tagName === 'path' &&
          !(e.originalEvent.target as any).classList.contains('leaflet-interactive'))
      ) {
        onClick();
      }
    },
  });
  return null;
};

// Component para inicializar Map Panes customs (precisa estar dentro do MapContainer)
const MapInitializer = ({ onReady }: { onReady: () => void }) => {
  const map = useMap();

  useEffect(() => {
    if (map) {
      if (!map.getPane('borderPane')) {
        const pane = map.createPane('borderPane');
        pane.style.zIndex = '550';
      }
      onReady();
    }
  }, [map, onReady]);

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
  const [isMapReady, setIsMapReady] = React.useState(false);

  const propsRef = useRef({
    selectedState,
    onStateClick,
    states,
    marketPotential,
    demand,
    layers,
    theme,
    regionFilter,
    searchFilter,
  });

  // ---------------------------------------------------------------------------
  // CRITICAL: Update ref DURING render to ensure that when sub-components (like GeoJSON) 
  // remount or call styles during the mount/paint phase, they see the absolute latest props.
  // This fix solves the issue where regional filter borders only worked "rarely" due to race conditions.
  // ---------------------------------------------------------------------------
  propsRef.current = {
    selectedState,
    onStateClick,
    states,
    marketPotential,
    demand,
    layers,
    theme,
    regionFilter,
    searchFilter,
  };

  const isLayerActive = (id: string) => layers.find((l: any) => l.id === id)?.active;
  const geoJsonRef = useRef<any>(null);

  const getStyle = useCallback(
    (feature: any) => {
      const { states: sList, selectedState: sel, regionFilter: rf, layers: activeLayers } = propsRef.current;
      const uf = feature.properties.SIGLA;
      const stateInfo = sList.find((s: any) => s.uf === uf);
      const isSelected = sel?.uf === uf;
      const isInActiveRegion = rf && stateInfo?.region && 
        stateInfo.region.toLowerCase().trim() === rf.toLowerCase().trim();
      
      // Se houver qualquer camada de dados ativa, aumentamos um pouco o peso base
      const hasDataLayer = activeLayers.some((l: any) => l.active && ['potential', 'demand', 'expansion'].includes(l.id));

      // 1. Regras de Borda (Topo da hierarquia visual)
      const baseWeight = hasDataLayer ? 1.5 : 1;
      const weight = isSelected ? 4 : isInActiveRegion ? 3 : baseWeight;
      const color = isSelected
        ? 'var(--highlight)'
        : isInActiveRegion
          ? 'var(--map-border-active)'
          : 'var(--map-border)';

      // 2. Regras de Preenchimento (Invisível, mas ativo para cliques)
      return {
        fillColor: 'transparent',
        fillOpacity: 0.0001,
        weight,
        color,
        opacity: 1,
        lineJoin: 'round' as const,
        lineCap: 'round' as const,
      };
    },
    [],
  );

  const getHaloStyle = useCallback(
    (feature: any) => {
      const { selectedState: sel, regionFilter: rf, states: sList, layers: activeLayers } = propsRef.current;
      const uf = feature.properties.SIGLA;
      const stateInfo = sList.find((s: any) => s.uf === uf);
      const isSelected = sel?.uf === uf;
      const isInActiveRegion = rf && stateInfo?.region && 
        stateInfo.region.toLowerCase().trim() === rf.toLowerCase().trim();
      const hasDataLayer = activeLayers.some((l: any) => l.active && ['potential', 'demand', 'expansion'].includes(l.id));

      if (!hasDataLayer && !isSelected && !isInActiveRegion) return { opacity: 0, fillOpacity: 0, weight: 0 };

      const baseWeight = hasDataLayer ? 1.5 : 1;
      const weight = isSelected ? 4 : isInActiveRegion ? 3 : baseWeight;

      return {
        fillColor: 'transparent',
        fillOpacity: 0,
        weight: weight + 1.5, // Halo é ligeiramente mais grosso que a borda real
        color: 'var(--map-border-halo)',
        opacity: 0.8,
        lineJoin: 'round' as const,
        lineCap: 'round' as const,
        pointerEvents: 'none',
      };
    },
    [],
  );

  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.getLayers().forEach((layer: any) => {
      if (layer.feature) {
        const isMatch =
          searchFilter &&
          (layer.feature.properties.Estado.toLowerCase().includes(searchFilter.toLowerCase()) ||
            layer.feature.properties.SIGLA.toLowerCase() === searchFilter.toLowerCase());
        const baseStyle = getStyle(layer.feature);
        layer.setStyle({
          ...baseStyle,
          fillOpacity: isMatch && !regionFilter ? 0.9 : baseStyle.fillOpacity,
          color: isMatch ? 'var(--highlight)' : baseStyle.color,
          weight: isMatch ? 3 : baseStyle.weight,
        });
      }
    });
  }, [selectedState, regionFilter, getStyle, searchFilter, theme]);

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
    const branchMatch = branches.find((b: Branch) => b.city.toLowerCase().includes(term));
    const compMatch = competitors.find((c: Competitor) => c.city.toLowerCase().includes(term));
    const location = branchMatch || compMatch;

    if (location) {
      // @ts-ignore
      const map = geoJsonRef.current._map;
      if (map) map.setView([location.lat, location.lng], 10);
    }
  }, [searchFilter, branches, competitors]);

  // onEachState com deps vazias — lê tudo via refs, sem stale closures
  const onEachState = useCallback(
    (feature: any, layer: any) => {
      const sigla = feature.properties.SIGLA;

      layer.bindTooltip(
        () => {
          const stateInfo = propsRef.current.states.find((s: any) => s.uf === sigla);
          const name = `<strong>${stateInfo?.name || feature.properties.Estado}</strong>`;

          // Intelligence context
          let extra = '';
          const isPotActive = propsRef.current.layers.find(
            (l: any) => l.id === 'potential',
          )?.active;
          const isDemActive = propsRef.current.layers.find((l: any) => l.id === 'demand')?.active;

          if (isPotActive) {
            const score = propsRef.current.marketPotential.find((p: any) => p.uf === sigla)?.score;
            if (score !== undefined)
              extra = `<br/><span style="color: var(--primary)">Potencial: ${score} pts</span>`;
          } else if (isDemActive) {
            const vol = propsRef.current.demand.find((d: any) => d.uf === sigla)?.volume;
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

          if (propsRef.current.selectedState?.uf === sigla) {
            propsRef.current.onStateClick(null);
            return;
          }

          const stateData = propsRef.current.states.find((s: any) => s.uf === sigla);
          if (stateData) {
            propsRef.current.onStateClick({
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
        mouseover: (e: any) => {
          const layer = e.target;
          const baseStyle = getStyle(feature);
          const { selectedState: sel, theme: t } = propsRef.current;
          const isSelected = sel?.uf === feature.properties.SIGLA;

          layer.setStyle({
            weight: baseStyle.weight + 0.5,
            color: isSelected ? 'var(--highlight)' : t === 'dark' ? '#ffffff' : '#000000',
            fillColor: isSelected ? 'var(--highlight)' : 'transparent',
            fillOpacity: 0.05, // Sutil feedback de que é clicável
          });

          if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
            layer.bringToFront();
          }
        },
        mouseout: (e: any) => {
          const layer = e.target;
          layer.setStyle(getStyle(feature));
        },
      });
    },
    [getStyle],
  );

  // Efeito adicional para garantir que todos os estilos do GeoJSON sejam atualizados
  // quando o selectedState ou searchFilter mudar (o Leaflet não faz isso sozinho no GeoJSON)
  useEffect(() => {
    if (!geoJsonRef.current) return;
    geoJsonRef.current.eachLayer((layer: any) => {
      if (layer.feature) {
        const baseStyle = getStyle(layer.feature);
        const { selectedState: sel, searchFilter: sf } = propsRef.current;
        const uf = layer.feature.properties.SIGLA;
        const isSelected = sel?.uf === uf;
        const isMatch =
          sf &&
          (layer.feature.properties.Estado.toLowerCase().includes(sf.toLowerCase()) ||
            uf.toLowerCase() === sf.toLowerCase());

        layer.setStyle({
          ...baseStyle,
          color: isSelected || isMatch ? 'var(--highlight)' : baseStyle.color,
          weight: isSelected || isMatch ? 4 : baseStyle.weight,
          fillOpacity: isMatch ? 0.1 : 0.0001,
        });

        if (isSelected || isMatch) {
          layer.bringToFront();
        }
      }
    });
  }, [selectedState, regionFilter, theme, getStyle, searchFilter]);

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
        <MapInitializer onReady={() => setIsMapReady(true)} />
        <MapEvents onClick={() => onStateClick(null)} />
        {theme === 'dark' ? (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        ) : (
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        )}

        {isMapReady && (
          <>
            {/* Camada de Halo (Brilho/Sombra de contraste) */}
            <GeoJSON
              key={`geojson-halo-${regionFilter}-${theme}`}
              data={brazilStates as any}
              style={getHaloStyle}
              pane="borderPane"
              interactive={false}
            />

            {/* Camada de Borda Principal */}
            <GeoJSON
              key={`geojson-border-${regionFilter}-${theme}`}
              ref={geoJsonRef}
              data={brazilStates as any}
              style={getStyle}
              onEachFeature={onEachState}
              pane="borderPane"
            />
          </>
        )}

        {isMapReady && geoJsonRef.current && (
          <>
            {isLayerActive('potential') && (
              <MarketHeatLayer
                data={marketPotential}
                statesGeoJson={brazilStates}
                regionFilter={regionFilter}
                states={states}
              />
            )}
            {isLayerActive('expansion') && (
              <ExpansionZoneLayer
                data={expansionZones}
                statesGeoJson={brazilStates}
                regionFilter={regionFilter}
                states={states}
                isPotentialActive={!!isLayerActive('potential')}
              />
            )}
            {isLayerActive('branches') && (
              <BranchLayer
                data={branches}
                regionFilter={regionFilter}
                searchFilter={searchFilter}
              />
            )}
            {isLayerActive('competitors') && (
              <CompetitorLayer
                data={competitors}
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
          </>
        )}
      </MapContainer>
    </div>
  );
};

export default BrazilMap;
