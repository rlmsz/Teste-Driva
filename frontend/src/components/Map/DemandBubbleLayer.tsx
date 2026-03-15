import React, { useEffect, useRef } from 'react';
import { Circle, Tooltip, useMap } from 'react-leaflet';
import { DemandData } from '../../types';

interface DemandBubbleLayerProps {
  data: DemandData[];
  states: any[];
  regionFilter?: string | null;
  active: boolean;
}

const STATE_CENTROIDS: Record<string, [number, number]> = {
  SP: [-23.55, -46.63], RJ: [-22.90, -43.17], MG: [-19.81, -43.95],
  RS: [-30.03, -51.21], PR: [-25.42, -49.27], BA: [-12.97, -38.50],
  SC: [-27.59, -48.54], CE: [-3.71, -38.54], PE: [-8.05, -34.88],
  DF: [-15.79, -47.88], GO: [-16.68, -49.26], PA: [-1.45, -48.50],
  MT: [-15.60, -56.09], ES: [-20.31, -40.31], MA: [-2.53, -44.30],
  MS: [-20.44, -54.64], AM: [-3.11, -60.02], RN: [-5.79, -35.20],
  PB: [-7.11, -34.86], AL: [-9.66, -35.73], PI: [-5.08, -42.80],
  SE: [-10.91, -37.07], TO: [-10.21, -48.32], RO: [-8.76, -63.90],
  AC: [-9.97, -67.81], AP: [0.03, -51.06], RR: [2.82, -60.67]
};

const DemandBubbleLayer: React.FC<DemandBubbleLayerProps> = ({ data, states, regionFilter, active }) => {
  const map = useMap();
  const paneCreated = useRef(false);

  useEffect(() => {
    if (!paneCreated.current && !map.getPane('demandBubblePane')) {
      const pane = map.createPane('demandBubblePane');
      pane.style.zIndex = '650';
      pane.style.pointerEvents = 'auto';
      paneCreated.current = true;
    }
  }, [map]);

  if (!active) return null;

  // Filtragem básica
  const filteredData = regionFilter 
    ? data.filter(item => states.find(s => s.uf === item.uf)?.region === regionFilter)
    : data;

  // Evitar duplicidade no frontend caso o backend falhe em filtrar perfeitamente
  const uniqueData: DemandData[] = [];
  const seenUfs = new Set();
  
  for (const item of filteredData) {
    if (!seenUfs.has(item.uf)) {
      uniqueData.push(item);
      seenUfs.add(item.uf);
    }
  }

  // Usamos um valor fixo de referência (ex: o maior volume do histórico de SP)
  // para que, ao mudar o período, as bolhas diminuam de tamanho proporcionalmente
  // aos valores absolutos, em vez de ficarem sempre relativas ao maior do período atual.
  const ABSOLUTE_MAX_VOLUME = 1500000; 

  return (
    <>
      {uniqueData.map(item => {
        const center = STATE_CENTROIDS[item.uf];
        if (!center) return null;

        const baseRadiusMeters = 200000; // 200km para o volume máximo
        const radius = Math.sqrt(item.volume / ABSOLUTE_MAX_VOLUME) * baseRadiusMeters;

        return (
          <Circle
            key={`${item.uf}-demand-bubble`}
            center={center}
            radius={radius}
            pane="demandBubblePane"
            pathOptions={{
              fillColor: '#FF4500',
              color: 'var(--bg-card)',
              weight: 2,
              fillOpacity: 0.6,
            }}
          >
            <Tooltip direction="top" opacity={1} sticky={false} className="demand-bubble-tooltip">
              <div style={{ color: 'var(--text-main)', lineHeight: '1.4' }}>
                <strong>{item.uf} — Demanda Estimada</strong>
                <br />
                Volume: <strong>{item.volume.toLocaleString('pt-BR')}</strong>
              </div>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
};

export default DemandBubbleLayer;
