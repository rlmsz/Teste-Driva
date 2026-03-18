import { useState, useEffect } from 'react';
import { Branch, MarketPotential, DemandData, ExpansionZone, Competitor, StateData } from '../types';
import * as api from '../services/api';

export const useMapData = (region?: string | null, period?: string) => {
  const [state, setState] = useState({
    branches: [] as Branch[],
    marketPotential: [] as MarketPotential[],
    demand: [] as DemandData[],
    expansionZones: [] as ExpansionZone[],
    competitors: [] as Competitor[],
    states: [] as StateData[],
    loading: true,
    error: null as string | null,
  });

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const loadData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const response = await api.fetchSummary(region, period, controller.signal);
        
        if (isMounted) {
          const { data } = response.data;
          setState({
            ...data,
            loading: false,
            error: null,
          });
        }
      } catch (err: any) {
        if (!isMounted || err?.name === 'CanceledError' || err?.name === 'AbortError') return;

        setState(prev => ({ 
          ...prev, 
          error: 'Falha ao carregar dados consolidados',
          loading: false 
        }));
        console.error(err);
      }
    };

    loadData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [region, period]);

  return state;
};
