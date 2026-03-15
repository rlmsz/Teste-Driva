import React from 'react';
import { Layers } from 'lucide-react';
import { LayerConfig } from '../../types';
import styles from './Sidebar.module.css';

interface LayerControlProps {
  layers: LayerConfig[];
  onToggleLayer: (id: string) => void;
}

const LayerControl: React.FC<LayerControlProps> = ({ layers, onToggleLayer }) => {
  return (
    <div className={styles.section}>
      <div className={styles.sectionTitle}>
        <Layers size={14} style={{ marginRight: 8 }} />
        Camadas de Dados
      </div>
      <div className={styles.layersContainer}>
        {layers.map(layer => (
          <div key={layer.id} className={styles.layerItem} onClick={() => onToggleLayer(layer.id)}>
            <div className={styles.layerLabel}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: layer.color, boxShadow: `0 0 8px ${layer.color}` }} />
              {layer.label}
            </div>
            <div className={`${styles.toggle} ${layer.active ? styles.toggleActive : ''}`}>
              <div className={`${styles.toggleCircle} ${layer.active ? styles.toggleCircleActive : ''}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerControl;
