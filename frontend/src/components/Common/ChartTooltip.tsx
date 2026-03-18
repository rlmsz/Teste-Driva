import React from 'react';

interface ChartTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
  prefix?: string;
  valueSuffix?: string;
  valueName?: string;
}

const ChartTooltip: React.FC<ChartTooltipProps> = ({ 
  active, 
  payload, 
  label, 
  prefix = '', 
  valueSuffix = '', 
  valueName = '' 
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const name = label || payload[0].name || data.uf || data.name;
    const value = payload[0].value;

    return (
      <div
        style={{
          backgroundColor: 'var(--tooltip-bg)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '10px 12px',
          boxShadow: 'var(--shadow-main)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <p style={{ color: 'var(--text-main)', fontWeight: 'bold', margin: '0 0 4px 0', fontSize: 13 }}>
          {prefix}{name}
        </p>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 12 }}>
          <span style={{ color: payload[0].color || payload[0].fill, fontWeight: 'medium' }}>
            {value.toLocaleString('pt-BR')}
            {valueSuffix}
          </span>
          <span style={{ color: 'var(--text-dim)' }}>{valueName}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default ChartTooltip;
