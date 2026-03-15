export interface Branch {
  id: string;
  name: string;
  city: string;
  uf: string;
  lat: number;
  lng: number;
  openedAt: string;
}

export interface Competitor {
  id: string;
  name: string;
  city: string;
  uf: string;
  lat: number;
  lng: number;
}

export interface StateData {
  uf: string;
  name: string;
  region: string;
  population: number;
  gdpPerCapita: number;
  avgIncome: number;
  ownStores: number;
  potentialScore: number;
  totalPopulation?: number;
  men?: number;
  women?: number;
  urban?: number;
  rural?: number;
  literacyRate?: number;
}

export interface MarketPotential {
  uf: string;
  score: number;
}

export interface DemandData {
  uf: string;
  volume: number;
}

export interface ExpansionZone {
  uf: string;
  priority: 'High' | 'Medium' | 'Low';
  potentialScore: number;
  reason: string;
}

export interface LayerConfig {
  id: string;
  label: string;
  active: boolean;
  color: string;
}

export interface IntelligenceSummary {
  branches: Branch[];
  marketPotential: MarketPotential[];
  demand: DemandData[];
  expansionZones: ExpansionZone[];
  competitors: Competitor[];
  states: StateData[];
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    total?: number;
    updatedAt: string;
  };
}
