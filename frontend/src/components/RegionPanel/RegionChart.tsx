import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { StateData, MarketPotential, DemandData } from '../../types';
import { TrendingUp, Activity } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';
import ChartTooltip from '../Common/ChartTooltip';
import { getPotential } from '../../utils/mapUtils';
import { REGIONS } from '../../constants';

interface RegionChartProps {
  state: StateData;
  allStates: StateData[];
  marketPotential: MarketPotential[];
  demand: DemandData[];
}

const RegionChart: React.FC<RegionChartProps> = ({ state, allStates, marketPotential, demand }) => {
  const isMobile = useIsMobile();

  // Helpers para pegar valores dinâmicos
  // 1. DADOS: Ranking de Estados na mesma Região
  const peerStates = allStates.filter(s => s.region === state.region);
  const peerData = peerStates
    .map(s => ({
      uf: s.uf,
      name: s.name,
      potential: getPotential(s.uf, marketPotential, s.potentialScore),
      isCurrent: s.uf === state.uf,
    }))
    .sort((a, b) => b.potential - a.potential);

  // 2. DADOS: Comparativo entre Regiões (Nacional)
  const regionalData = REGIONS.map(reg => {
    const statesInReg = allStates.filter(s => s.region === reg);
    const avgPot =
      statesInReg.reduce((acc, s) => acc + getPotential(s.uf, marketPotential, s.potentialScore), 0) /
      (statesInReg.length || 1);
    return {
      name: reg,
      potential: Math.round(avgPot),
      isCurrentRegion: reg === state.region,
    };
  }).sort((a, b) => b.potential - a.potential);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Chart 1: Peer States */}
      <div>
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'var(--primary)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <TrendingUp size={16} /> Ranking Estadual ({state.region})
        </div>
        <div style={{ height: isMobile ? 220 : 200, backgroundColor: 'var(--bg-card)', borderRadius: 12, padding: '16px ', border: '1px solid var(--border)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={peerData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                dataKey="uf"
                type="category"
                width={isMobile ? 30 : 40}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={({ x, y, payload }) => (
                  <text
                    x={0}
                    y={y}
                    dy={4}
                    fill="var(--text-dim)"
                    fontSize={isMobile ? 10 : 11}
                    fontWeight="500"
                    textAnchor="start"
                  >
                    {payload.value}
                  </text>
                )}
              />
              <Tooltip
                content={<ChartTooltip valueSuffix=" pts" valueName="Potencial" />}
                cursor={{ fill: 'var(--border)', opacity: 0.4 }}
              />
              <Bar dataKey="potential" radius={[0, 4, 4, 0]} barSize={16}>
                {peerData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.isCurrent ? 'var(--primary)' : 'var(--border)'}
                    fillOpacity={entry.isCurrent ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Regional Comparison */}
      <div>
        <div
          style={{
            fontSize: '0.85rem',
            fontWeight: '600',
            color: 'var(--highlight)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Activity size={16} /> Comparativo Nacional (Média)
        </div>
        <div style={{ height: isMobile ? 200 : 180, backgroundColor: 'var(--bg-card)', borderRadius: 12, padding: '16px', border: '1px solid var(--border)' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={regionalData}
              layout="vertical"
              margin={{ top: 0, right: 30, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                dataKey="name"
                type="category"
                width={isMobile ? 70 : 85}
                axisLine={false}
                tickLine={false}
                interval={0}
                tick={({ x, y, payload }) => (
                  <text
                    x={0}
                    y={y}
                    dy={4}
                    fill="var(--text-dim)"
                    fontSize={isMobile ? 9 : 10}
                    fontWeight="500"
                    textAnchor="start"
                  >
                    {payload.value}
                  </text>
                )}
              />
              <Tooltip
                content={<ChartTooltip valueSuffix=" pts" valueName="Média Região" />}
                cursor={{ fill: 'var(--border)', opacity: 0.4 }}
              />
              <Bar dataKey="potential" radius={[0, 4, 4, 0]} barSize={14}>
                {regionalData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.isCurrentRegion ? 'var(--highlight)' : 'var(--border)'}
                    fillOpacity={entry.isCurrentRegion ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default RegionChart;
