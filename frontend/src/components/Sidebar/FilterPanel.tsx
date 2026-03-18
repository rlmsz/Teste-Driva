import React from 'react';
import { Filter } from 'lucide-react';
import styles from './Sidebar.module.css';

interface FilterPanelProps {
  activeRegion: string | null;
  activePeriod: string;
  onRegionChange: (region: string | null) => void;
  onPeriodChange: (period: string) => void;
}

import { REGIONS, PERIODS } from '../../constants';

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  activeRegion, 
  activePeriod, 
  onRegionChange, 
  onPeriodChange 
}) => {
  return (
    <>
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Filter size={14} style={{ marginRight: 8 }} />
          Período de Análise
        </div>
        <select 
          className={styles.periodSelect}
          value={activePeriod}
          onChange={(e) => onPeriodChange(e.target.value)}
        >
          {PERIODS.map(p => (
            <option key={p.id} value={p.id}>{p.label}</option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <Filter size={14} style={{ marginRight: 8 }} />
          Filtro Regional
        </div>
        <div className={styles.regionGrid}>
          <button 
            className={`${styles.regionButton} ${activeRegion === null ? styles.regionButtonActive : ''}`}
            onClick={() => onRegionChange(null)}
          >
            Todas
          </button>
          {REGIONS.map(region => (
            <button 
              key={region}
              className={`${styles.regionButton} ${activeRegion === region ? styles.regionButtonActive : ''}`}
              onClick={() => onRegionChange(region)}
            >
              {region}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

export default FilterPanel;
