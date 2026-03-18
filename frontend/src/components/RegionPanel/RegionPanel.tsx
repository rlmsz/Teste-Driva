import React from 'react';
import styles from './RegionPanel.module.css';
import { StateData, MarketPotential, DemandData } from '../../types';
import { X, TrendingUp, Users, DollarSign, Store, Activity } from 'lucide-react';
import RegionChart from './RegionChart';

interface RegionPanelProps {
  state: StateData;
  allStates: StateData[];
  marketPotential: MarketPotential[];
  demand: DemandData[];
  onClose: () => void;
}

const RegionPanel: React.FC<RegionPanelProps> = ({
  state,
  allStates,
  marketPotential,
  demand,
  onClose,
}) => {
  const currentPotential =
    marketPotential.find(p => p.uf === state.uf)?.score ?? state.potentialScore;
  const currentDemand = demand.find(d => d.uf === state.uf)?.volume ?? 0;
  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {state.name} ({state.uf})
        </h2>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.sectionTitle}>Indicadores Principais</div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>
              <Users size={12} style={{ marginRight: 4 }} /> População
            </div>
            <div className={styles.statValue}>
              {(state.totalPopulation || state.population).toLocaleString('pt-BR')}
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>
              <TrendingUp size={12} style={{ marginRight: 4 }} /> Potencial
            </div>
            <div className={styles.statValue}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    flex: 1,
                    height: '6px',
                    backgroundColor: 'var(--border)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${currentPotential}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      boxShadow: '0 0 8px var(--glow-primary)',
                    }}
                  />
                </div>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                  {currentPotential}/100
                </span>
              </div>
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>
              <DollarSign size={12} style={{ marginRight: 4 }} /> PIB per Capita
            </div>
            <div className={styles.statValue}>R$ {state.gdpPerCapita.toLocaleString('pt-BR')}</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statLabel}>
              <Store size={12} style={{ marginRight: 4 }} /> Lojas Próprias
            </div>
            <div className={styles.statValue}>{state.ownStores}</div>
          </div>
          <div className={styles.statCard} style={{ gridColumn: 'span 2' }}>
            <div className={styles.statLabel}>
              <Activity size={12} style={{ marginRight: 4 }} /> Demanda (Período)
            </div>
            <div className={styles.statValue}>{currentDemand.toLocaleString('pt-BR')}</div>
          </div>
        </div>

        {state.totalPopulation && (
          <>
            <div className={styles.sectionTitle}>Dados Demográficos (Censo)</div>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Gênero (H / M)</div>
                <div className={styles.statValue} style={{ fontSize: '0.9rem' }}>
                  {state.men?.toLocaleString('pt-BR')} / {state.women?.toLocaleString('pt-BR')}
                </div>
              </div>
              <div className={styles.statCard}>
                <div className={styles.statLabel}>Distribuição (U / R)</div>
                <div className={styles.statValue} style={{ fontSize: '0.9rem' }}>
                  {state.urban?.toLocaleString('pt-BR')} / {state.rural?.toLocaleString('pt-BR')}
                </div>
              </div>
              <div className={styles.statCard} style={{ gridColumn: 'span 2' }}>
                <div className={styles.statLabel}>Taxa de Alfabetização</div>
                <div className={styles.statValue}>{state.literacyRate?.toFixed(2)}%</div>
              </div>
            </div>
          </>
        )}

        <div className={styles.sectionTitle}>Comparativo Regional</div>
        <div className={styles.chartContainer}>
          <RegionChart
            state={state}
            allStates={allStates}
            marketPotential={marketPotential}
            demand={demand}
          />
        </div>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            backgroundColor: 'var(--bg-dark)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            fontSize: '0.85rem',
            color: 'var(--text-dim)',
          }}
        >
          <strong>Nota de Análise:</strong> O estado de {state.name} apresenta um score de potencial
          de {state.potentialScore}, sendo classificado na região {state.region}. Atualmente
          possuímos {state.ownStores} filiais operando nesta UF.
        </div>
      </div>
    </div>
  );
};

export default RegionPanel;
