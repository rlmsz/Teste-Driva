import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import BrazilMap from './components/Map/BrazilMap';
import RegionPanel from './components/RegionPanel/RegionPanel';
import GlobalDashboard from './components/Dashboard/GlobalDashboard';
import { useMapData } from './hooks/useMapData';
import { StateData, LayerConfig } from './types';
import { useTheme } from './contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

const INITIAL_LAYERS: LayerConfig[] = [
  { id: 'branches', label: 'Filiais Próprias', active: true, color: 'var(--primary)' },
  { id: 'potential', label: 'Potencial de Mercado', active: false, color: 'var(--highlight)' },
  { id: 'demand', label: 'Volume de Demanda', active: false, color: '#FF4500' },
  { id: 'expansion', label: 'Zonas de Expansão', active: false, color: '#1E90FF' },
  { id: 'competitors', label: 'Concorrência', active: false, color: '#FF0000' },
];

const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [layers, setLayers] = useState<LayerConfig[]>(INITIAL_LAYERS);
  const [selectedState, setSelectedState] = useState<StateData | null>(null);
  
  // Persistence states
  const [regionFilter, setRegionFilter] = useState<string | null>(() => localStorage.getItem('regionFilter'));
  const [periodFilter, setPeriodFilter] = useState(() => localStorage.getItem('periodFilter') || 'all');
  const [viewMode, setViewMode] = useState<'map' | 'dashboard'>(() => (localStorage.getItem('viewMode') as any) || 'map');
  
  const [searchFilter, setSearchFilter] = useState('');

  // Sync with localStorage
  React.useEffect(() => {
    if (regionFilter) localStorage.setItem('regionFilter', regionFilter);
    else localStorage.removeItem('regionFilter');
  }, [regionFilter]);

  React.useEffect(() => {
    localStorage.setItem('periodFilter', periodFilter);
  }, [periodFilter]);

  React.useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);
  
  const { branches, marketPotential, demand, expansionZones, competitors, states, loading, error } = useMapData(null, periodFilter);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
  };


  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--bg-dark)', color: 'var(--primary)', flexDirection: 'column', gap: 12 }}>
      <span style={{ fontSize: 32 }}>⚠️</span>
      <span style={{ fontSize: '1.1rem' }}>Falha ao carregar dados</span>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{error}</span>
    </div>
  );

  return (
    <div className="app-container" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      width: '100vw', 
      height: '100vh', 
      backgroundColor: 'var(--bg-dark)',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {isMobile && (
        <div style={{ 
          height: 60, 
          backgroundColor: 'var(--bg-card)', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          alignItems: 'center', 
          padding: '0 20px',
          zIndex: 1000
        }}>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--primary)', 
              cursor: 'pointer',
              padding: 8,
              borderRadius: 8,
              backgroundColor: 'var(--glow-primary)'
            }}
          >
            <div style={{ width: 20, height: 2, backgroundColor: 'currentColor', marginBottom: 4 }}></div>
            <div style={{ width: 20, height: 2, backgroundColor: 'currentColor', marginBottom: 4 }}></div>
            <div style={{ width: 20, height: 2, backgroundColor: 'currentColor' }}></div>
          </button>
          <div style={{ marginLeft: 16, fontWeight: 'bold', color: 'var(--text-main)' }}>Driva Intelligence</div>
        </div>
      )}

      <Sidebar 
        layers={layers} 
        viewMode={viewMode}
        onViewModeChange={(mode) => {
          setViewMode(mode);
          if (isMobile) setIsSidebarOpen(false);
        }}
        onToggleLayer={toggleLayer}
        onSearchChange={setSearchFilter}
        onRegionChange={setRegionFilter}
        onPeriodChange={setPeriodFilter}
        activeRegion={regionFilter}
        activePeriod={periodFilter}
        states={states}
        // @ts-ignore - Will fix in Sidebar.tsx
        isOpen={isMobile ? isSidebarOpen : true}
        // @ts-ignore - Will fix in Sidebar.tsx
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="main-content" style={{ 
        position: 'absolute',
        top: isMobile ? 60 : 0,
        left: 0,
        width: '100vw',
        height: isMobile ? 'calc(100vh - 60px)' : '100vh',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {/* Theme Toggle Floating Button */}
        <button 
          onClick={toggleTheme} 
          style={{
            position: 'absolute',
            top: isMobile ? 12 : 16,
            left: isMobile ? undefined : 316,
            right: isMobile ? 12 : undefined,
            zIndex: 2000,
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            color: 'var(--text-main)',
            transition: 'all 0.2s ease',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
          }}
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {loading && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 9999,
            backgroundColor: 'var(--bg-dark)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}>
            {/* Pulsing map skeleton */}
            <div style={{ position: 'relative', width: 120, height: 120 }}>
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                border: '3px solid var(--primary)',
                animation: 'pulse-ring 1.4s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 40,
              }}>🗺️</div>
            </div>
            <div style={{ color: 'var(--text-main)', fontSize: '1rem', letterSpacing: 1 }}>
              Carregando inteligência de mercado...
            </div>
          </div>
        )}
        {viewMode === 'map' ? (
          <BrazilMap 
            layers={layers}
            branches={branches}
            marketPotential={marketPotential}
            demand={demand}
            expansionZones={expansionZones}
            competitors={competitors}
            states={states}
            regionFilter={regionFilter}
            searchFilter={searchFilter}
            selectedState={selectedState}
            onStateClick={(state) => {
              setSelectedState(state);
              if (isMobile) setIsSidebarOpen(false);
            }}
          />
        ) : (
          <div style={{ marginLeft: isMobile ? 0 : 300, width: isMobile ? '100%' : 'calc(100% - 300px)', height: '100%' }}>
            <GlobalDashboard 
              allStates={states}
              marketPotential={marketPotential}
              demand={demand}
              branches={branches}
              competitors={competitors}
              activeRegion={regionFilter}
            />
          </div>
        )}
      </main>

      {selectedState && (
        <RegionPanel 
          state={selectedState}
          allStates={states}
          marketPotential={marketPotential}
          demand={demand}
          onClose={() => setSelectedState(null)} 
        />
      )}
    </div>
  );
};

export default App;
