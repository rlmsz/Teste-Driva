export const REGIONS = ['Norte', 'Nordeste', 'Centro-Oeste', 'Sudeste', 'Sul'];

export const PERIODS = [
  { id: 'all', label: 'Histórico Completo' },
  { id: '12m', label: 'Últimos 12 Meses' },
  { id: '24m', label: 'Últimos 24 Meses' },
];

export const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253];

export const STATE_CENTROIDS: Record<string, [number, number]> = {
  AC: [-9.97, -67.81], AL: [-9.66, -35.73], AP: [0.03, -51.06], AM: [-3.11, -60.02],
  BA: [-12.97, -38.50], CE: [-3.71, -38.54], DF: [-15.79, -47.88], ES: [-20.31, -40.31],
  GO: [-16.68, -49.26], MA: [-2.53, -44.30], MT: [-15.60, -56.09], MS: [-20.44, -54.64],
  MG: [-19.81, -43.95], PA: [-1.45, -48.50], PB: [-7.11, -34.86], PR: [-25.42, -49.27],
  PE: [-8.05, -34.88], PI: [-5.08, -42.80], RJ: [-22.90, -43.17], RN: [-5.79, -35.20],
  RS: [-30.03, -51.21], RO: [-8.76, -63.90], RR: [2.82, -60.67], SC: [-27.59, -48.54],
  SP: [-23.55, -46.63], SE: [-10.91, -37.07], TO: [-10.21, -48.32]
};
