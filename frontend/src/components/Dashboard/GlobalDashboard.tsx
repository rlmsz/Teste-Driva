import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { StateData, MarketPotential, DemandData, Branch, Competitor } from '../../types';
import { Globe, TrendingUp, Users, Store } from 'lucide-react';

interface GlobalDashboardProps {
  allStates: StateData[];
  marketPotential: MarketPotential[];
  demand: DemandData[];
  branches: Branch[];
  competitors: Competitor[];
  activeRegion: string | null;
}

const GlobalDashboard: React.FC<GlobalDashboardProps> = ({ 
  allStates, marketPotential, demand, branches, competitors, activeRegion 
}) => {
  const REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

  // Helper para métricas dinâmicas
  const getPotential = (uf: string, staticScore: number) => marketPotential.find(p => p.uf === uf)?.score ?? staticScore;
  const getDemand = (uf: string) => demand.find(d => d.uf === uf)?.volume ?? 0;

  // 1. Dados Regionais (Imutável)
  const regionalData = React.useMemo(() => {
    return REGIONS.map(reg => {
      const statesInReg = allStates.filter(s => s.region === reg);
      const avgPot = statesInReg.reduce((acc, s) => acc + getPotential(s.uf, s.potentialScore), 0) / (statesInReg.length || 1);
      const totalDemand = statesInReg.reduce((acc, s) => acc + getDemand(s.uf), 0);
      const totalBranches = branches.filter(b => statesInReg.some(s => s.uf === b.uf)).length;
      
      return {
        name: reg,
        potential: Math.round(avgPot),
        demand: totalDemand,
        branches: totalBranches
      };
    }).sort((a, b) => b.potential - a.potential);
  }, [allStates, marketPotential, demand, branches]);

  const topPotential = regionalData[0];
  const topDemand = [...regionalData].sort((a, b) => b.demand - a.demand)[0];

  const CustomTooltip: React.FC<{
    active?: boolean;
    payload?: any[];
    label?: string;
    prefix?: string;
    valueSuffix?: string;
    valueName?: string;
  }> = ({ active, payload, label, prefix = 'Região: ', valueSuffix = '', valueName = '' }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const name = label || payload[0].name || data.name;
      const value = payload[0].value;

      return (
        <div style={{ backgroundColor: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', boxShadow: '0 4px 16px rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}>
          <p style={{ color: 'var(--text-main)', fontWeight: 'bold', margin: '0 0 4px 0', fontSize: 13 }}>{prefix}{name}</p>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
            <span style={{ color: payload[0].color || payload[0].fill, fontWeight: 'medium' }}>
              {value.toLocaleString('pt-BR')}{valueSuffix}
            </span>
            <span style={{ color: 'var(--text-dim)' }}>{valueName}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ padding: isMobile ? 20 : 40, color: 'var(--text-main)', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: isMobile ? 24 : 40 }}>
        <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', display: 'flex', alignItems: 'center', gap: 12, margin: 0 }}>
          <Globe size={isMobile ? 24 : 32} color="var(--primary)" /> Visão Geral Brasil
        </h1>
        <p style={{ color: 'var(--text-dim)', marginTop: 8, fontSize: isMobile ? '0.85rem' : '1rem' }}>Análise comparativa de inteligência de mercado por região.</p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: isMobile ? 16 : 24, 
        marginBottom: isMobile ? 24 : 40 
      }}>
        {/* Card 1: Potencial de Mercado */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: isMobile ? 16 : 24 }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '1rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--primary)' }}>
            <TrendingUp size={18} /> Potencial de Mercado
          </h3>
          <div style={{ height: isMobile ? 200 : 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'var(--text-dim)', fontSize: 10 }} 
                  axisLine={false} 
                  tickLine={false}
                  interval={0}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip valueSuffix=" pts" valueName="Média de Potencial" />} cursor={{ fill: 'var(--border)', opacity: 0.4 }} />
                <Bar dataKey="potential" radius={[4, 4, 0, 0]} barSize={isMobile ? 24 : 40}>
                  {regionalData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={activeRegion ? (entry.name === activeRegion ? 'var(--primary)' : 'var(--border)') : 'var(--primary)'} 
                      fillOpacity={activeRegion ? (entry.name === activeRegion ? 1 : 0.4) : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Distribuição de Demanda */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: isMobile ? 16 : 24 }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '1rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: 10, color: 'var(--highlight)' }}>
            <Users size={18} /> Demanda por Região
          </h3>
          <div style={{ height: isMobile ? 200 : 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={regionalData}
                  dataKey="demand"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={isMobile ? 40 : 60}
                  outerRadius={isMobile ? 60 : 80}
                  paddingAngle={5}
                >
                  {regionalData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={activeRegion 
                        ? (entry.name === activeRegion ? 'var(--highlight)' : 'var(--border)') 
                        : ['var(--primary)', 'var(--highlight)', '#FF8C00', '#1E90FF', '#87CEFA'][index % 5]
                      } 
                      stroke={entry.name === activeRegion ? 'var(--highlight)' : 'none'}
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip valueSuffix=" unidades" valueName="Demanda Total" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 3: Filiais Próprias */}
        <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: isMobile ? 16 : 24 }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '1rem' : '1.2rem', display: 'flex', alignItems: 'center', gap: 10, color: '#1E90FF' }}>
            <Store size={18} /> Filiais Próprias
          </h3>
          <div style={{ height: isMobile ? 200 : 250 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalData} margin={{ left: -20, top: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: 'var(--text-dim)', fontSize: 10 }} 
                  axisLine={false} 
                  tickLine={false} 
                  interval={0}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip valueSuffix=" un" valueName="Lojas Ativas" />} cursor={{ fill: 'var(--border)', opacity: 0.4 }} />
                <Bar dataKey="branches" radius={[4, 4, 0, 0]} barSize={isMobile ? 24 : 40} animationDuration={1000}>
                  {regionalData.map((entry, index) => (
                    <Cell 
                      key={index} 
                      fill={activeRegion ? (entry.name === activeRegion ? '#1E90FF' : 'var(--border)') : '#1E90FF'} 
                      fillOpacity={activeRegion ? (entry.name === activeRegion ? 1 : 0.4) : 0.8}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--glow-primary)', border: '1px solid var(--primary)', borderRadius: 12, padding: 24 }}>
        <h4 style={{ margin: '0 0 12px 0', color: 'var(--primary)' }}>Destaque Estratégico</h4>
        <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: 1.6, fontSize: '0.95rem' }}>
          A região <strong>{topPotential.name}</strong> lidera o potencial de mercado com uma média de <strong>{topPotential.potential} pontos</strong>. 
          Enquanto isso, a região <strong>{topDemand.name}</strong> concentra o maior volume de demanda total do país. 
          Considere expandir operações para zonas de alto potencial onde a presença de filiais ainda é baixa (ex: Norte e Nordeste).
        </p>
      </div>
    </div>
  );
};

export default GlobalDashboard;
