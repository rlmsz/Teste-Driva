import { useState, useEffect } from 'react';
import { Branch, MarketPotential, DemandData, ExpansionZone, Competitor, StateData } from '../types';
import * as api from '../services/api';

export const useMapData = (region?: string | null, period?: string) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [marketPotential, setMarketPotential] = useState<MarketPotential[]>([]);
  const [demand, setDemand] = useState<DemandData[]>([]);
  const [expansionZones, setExpansionZones] = useState<ExpansionZone[]>([]);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [states, setStates] = useState<StateData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const response = await api.fetchSummary(region, period);
        
        if (isMounted) {
          const { data } = response.data;
          setBranches(data.branches);
          setMarketPotential(data.marketPotential);
          setDemand(data.demand);
          setExpansionZones(data.expansionZones);
          setCompetitors(data.competitors);
          setStates(data.states);
        }
      } catch (err) {
        if (isMounted) {
          setError('Falha ao carregar dados consolidados');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [region, period]);

  return { branches, marketPotential, demand, expansionZones, competitors, states, loading, error };
};
