import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Competitor } from '../../types';

// Custom red icon for competitors
const competitorIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Mapeamento UF → Região para filtro
const UF_REGION: Record<string, string> = {
  AC: 'Norte', AM: 'Norte', AP: 'Norte', PA: 'Norte', RO: 'Norte', RR: 'Norte', TO: 'Norte',
  AL: 'Nordeste', BA: 'Nordeste', CE: 'Nordeste', MA: 'Nordeste', PB: 'Nordeste',
  PE: 'Nordeste', PI: 'Nordeste', RN: 'Nordeste', SE: 'Nordeste',
  DF: 'Centro-Oeste', GO: 'Centro-Oeste', MS: 'Centro-Oeste', MT: 'Centro-Oeste',
  ES: 'Sudeste', MG: 'Sudeste', RJ: 'Sudeste', SP: 'Sudeste',
  PR: 'Sul', RS: 'Sul', SC: 'Sul',
};

interface CompetitorLayerProps {
  data: Competitor[];
  regionFilter: string | null;
  searchFilter: string;
}

const CompetitorLayer: React.FC<CompetitorLayerProps> = ({ data, regionFilter, searchFilter }) => {
  const filtered = data.filter(c => {
    const term = searchFilter.toLowerCase();
    const matchesSearch = !term || c.name.toLowerCase().includes(term) || c.city.toLowerCase().includes(term);
    const matchesRegion = !regionFilter || UF_REGION[c.uf] === regionFilter;
    return matchesSearch && matchesRegion;
  });

  return (
    <>
      {filtered.map(comp => (
        <Marker 
          key={comp.id} 
          position={[comp.lat, comp.lng]} 
          icon={competitorIcon}
        >
          <Popup>
            <div style={{ color: 'var(--text-main)', backgroundColor: 'var(--bg-card)', padding: '4px', borderRadius: '4px' }}>
              <strong>{comp.name}</strong> (Concorrente)<br />
              {comp.city} - {comp.uf}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default CompetitorLayer;
