import React from 'react';
import styles from './Sidebar.module.css';
import { LayerConfig, StateData } from '../../types';
import { Map as MapIcon, X } from 'lucide-react';
import LayerControl from './LayerControl';
import FilterPanel from './FilterPanel';
import SearchBar from './SearchBar';

interface SidebarProps {
  layers: LayerConfig[];
  viewMode: 'map' | 'dashboard';
  onViewModeChange: (mode: 'map' | 'dashboard') => void;
  onToggleLayer: (id: string) => void;
  onSearchChange: (term: string) => void;
  onRegionChange: (region: string | null) => void;
  onPeriodChange: (period: string) => void;
  activeRegion: string | null;
  activePeriod: string;
  states: StateData[];
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  layers, 
  viewMode,
  onViewModeChange,
  onToggleLayer, 
  onSearchChange,
  onRegionChange,
  onPeriodChange,
  activeRegion,
  activePeriod,
  states,
  isOpen = true,
  onClose
}) => {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.isOpen : ''}`}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <MapIcon size={24} color="var(--primary)" />
          <span>MarketIntel</span>
        </div>
        {onClose && (
          <button className={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        )}
      </div>

      <div className={styles.section} style={{ display: 'flex', gap: 8, padding: '0 0 20px 0' }}>
        <button 
          className={`${styles.regionButton} ${viewMode === 'map' ? styles.regionButtonActive : ''}`}
          style={{ flex: 1, margin: 0 }}
          onClick={() => onViewModeChange('map')}
        >
          Mapa
        </button>
        <button 
          className={`${styles.regionButton} ${viewMode === 'dashboard' ? styles.regionButtonActive : ''}`}
          style={{ flex: 1, margin: 0 }}
          onClick={() => onViewModeChange('dashboard')}
        >
          Dashboard
        </button>
      </div>

      <SearchBar states={states} onSearchChange={onSearchChange} />

      <FilterPanel 
        activeRegion={activeRegion}
        activePeriod={activePeriod}
        onRegionChange={onRegionChange}
        onPeriodChange={onPeriodChange}
      />

      <LayerControl layers={layers} onToggleLayer={onToggleLayer} />
    </aside>
  );
};

export default Sidebar;
