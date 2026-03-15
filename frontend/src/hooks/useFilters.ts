import { useState, useMemo } from 'react';

interface Filters {
  region: string | null;
  searchTerm: string;
}

export const useFilters = <T extends { uf?: string; city?: string; name?: string }>(data: T[], statesInfo: any[]) => {
  const [filters, setFilters] = useState<Filters>({
    region: null,
    searchTerm: '',
  });

  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Find state info for the item
      const state = statesInfo.find(s => s.uf === item.uf);
      
      const matchesRegion = !filters.region || state?.region === filters.region;
      
      const term = filters.searchTerm.toLowerCase();
      const matchesSearch = !term || 
        item.name?.toLowerCase().includes(term) || 
        item.city?.toLowerCase().includes(term) || 
        item.uf?.toLowerCase().includes(term);

      return matchesRegion && matchesSearch;
    });
  }, [data, filters, statesInfo]);

  return { filteredData, filters, setFilters };
};
