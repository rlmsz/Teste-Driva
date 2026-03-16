import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Branch } from '../../types';

// Custom blue icon for branches
const branchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
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

interface BranchLayerProps {
  data: Branch[];
  regionFilter: string | null;
  searchFilter: string;
}

const BranchLayer: React.FC<BranchLayerProps> = ({ data, regionFilter, searchFilter }) => {
  const filtered = data.filter(b => {
    const term = searchFilter.toLowerCase();
    const matchesSearch = !term || b.name.toLowerCase().includes(term) || b.city.toLowerCase().includes(term);
    const matchesRegion = !regionFilter || UF_REGION[b.uf] === regionFilter;
    return matchesSearch && matchesRegion;
  });

  return (
    <>
      {filtered.map(branch => (
        <Marker 
          key={branch.id} 
          position={[branch.lat, branch.lng]} 
          icon={branchIcon}
        >
          <Tooltip direction="top" opacity={1} sticky={true} className="custom-map-tooltip">
            <div>
              <strong style={{ color: 'var(--primary)' }}>{branch.name}</strong><br />
              <span>{branch.city} - {branch.uf}</span><br />
              <small style={{ color: 'var(--text-dim)', fontSize: '10px' }}>Inaugurada em: {branch.openedAt}</small>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </>
  );
};

export default BranchLayer;
