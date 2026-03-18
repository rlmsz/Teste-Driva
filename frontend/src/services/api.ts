import axios from 'axios';
import { Branch, Competitor, StateData, MarketPotential, DemandData, ExpansionZone, ApiResponse, IntelligenceSummary } from '../types';

const api = axios.create({
  baseURL: '/api'
});

export const fetchBranches = (region?: string | null, period?: string) => 
  api.get<ApiResponse<Branch[]>>('/branches', { params: { region, period } });

export const fetchMarketPotential = (region?: string | null, period?: string) => 
  api.get<ApiResponse<MarketPotential[]>>('/market-potential', { params: { region, period } });

export const fetchDemand = (region?: string | null, period?: string) => 
  api.get<ApiResponse<DemandData[]>>('/demand', { params: { region, period } });

export const fetchExpansionZones = (region?: string | null, period?: string) => 
  api.get<ApiResponse<ExpansionZone[]>>('/expansion-zones', { params: { region, period } });

export const fetchCompetitors = (region?: string | null, period?: string) => 
  api.get<ApiResponse<Competitor[]>>('/competitors', { params: { region, period } });

export const fetchStates = (region?: string | null) => 
  api.get<ApiResponse<StateData[]>>('/states', { params: { region } });

export const fetchSummary = (region?: string | null, period?: string, signal?: AbortSignal) =>
  api.get<ApiResponse<IntelligenceSummary>>('/intelligence/summary', { 
    params: { region, period },
    signal
  });

export const fetchStateDetail = (uf: string) => 
  api.get<ApiResponse<StateData>>(`/states/${uf}`);

export default api;
