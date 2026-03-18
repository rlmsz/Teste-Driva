import React, { useEffect, useRef } from 'react';
import { Circle, Tooltip, useMap } from 'react-leaflet';
import { DemandData } from '../../types';
import { STATE_CENTROIDS } from '../../constants';

interface DemandBubbleLayerProps {
  data: DemandData[];
  states: any[];
  regionFilter?: string | null;
  active: boolean;
}


const DemandBubbleLayer: React.FC<DemandBubbleLayerProps> = ({ data, states, regionFilter, active }) => {
  const map = useMap();
  const [paneReady, setPaneReady] = React.useState(false);

  useEffect(() => {
    if (!map.getPane('demandBubblePane')) {
      const pane = map.createPane('demandBubblePane');
      pane.style.zIndex = '500';
      pane.style.pointerEvents = 'auto';
    }
    setPaneReady(true);
  }, [map]);

  if (!active || !paneReady) return null;

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
            <Tooltip direction="top" opacity={1} sticky={true} className="custom-map-tooltip">
              <div style={{ lineHeight: '1.4' }}>
                <strong>{item.uf} — Demanda Estimada</strong>
                <br />
                <span style={{ color: 'var(--primary)' }}>Volume: {item.volume.toLocaleString('pt-BR')} un</span>
              </div>
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
};

export default DemandBubbleLayer;
