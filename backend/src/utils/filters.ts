import states from '../data/states.json';

export const getUfsByRegion = (region: string) => {
  return states
    .filter(s => s.region.toLowerCase() === region.toLowerCase())
    .map(s => s.uf);
};

export const filterByRegion = (data: any[], region?: string) => {
  if (!region) return data;
  const validUfs = getUfsByRegion(region);
  return data.filter(item => validUfs.includes(item.uf));
};

export const filterByPeriod = (data: any[], period?: string) => {
  if (!period || period === 'all') {
    // Para métricas, se não houver filtro, pegamos o consolidado ('all')
    // Para entidades, pegamos tudo (comportamento padrão)
    return data.filter(item => !item.period || item.period === 'all');
  }
  
  return data.filter(item => {
    // 1. Se o item tem um período específico definido (ex: demanda de 12m)
    if (item.period) {
      return item.period === period;
    }

    // 2. Se o item tem data de abertura (ex: filiais/concorrentes)
    if (item.openedAt) {
      const now = new Date();
      const months = period === '12m' ? 12 : 24;
      const limitDate = new Date(now.setMonth(now.getMonth() - months));
      return new Date(item.openedAt) >= limitDate;
    }

    // 3. Se não tem nenhum dos dois, é estático e sempre aparece
    return true;
  });
};
