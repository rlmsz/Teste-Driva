import { MarketPotential, DemandData } from '../types';

/**
 * Gets market potential score for a state with a fallback to static value
 */
export const getPotential = (uf: string, potentialList: MarketPotential[], fallback: number): number => {
  return potentialList.find(p => p.uf === uf)?.score ?? fallback;
};

/**
 * Gets total demand volume for a state
 */
export const getDemand = (uf: string, demandList: DemandData[]): number => {
  return demandList.find(d => d.uf === uf)?.volume ?? 0;
};
