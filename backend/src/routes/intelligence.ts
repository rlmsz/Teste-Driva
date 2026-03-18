import { Router, Request, Response } from 'express';
import branches from '../data/branches.json';
import marketPotential from '../data/marketPotential.json';
import demand from '../data/demand.json';
import expansionZones from '../data/expansionZones.json';
import competitors from '../data/competitors.json';
import states from '../data/states.json';

import { filterByRegion, filterByPeriod } from '../utils/filters';

const router = Router();

router.get('/summary', (req: Request, res: Response) => {
  const { region, period } = req.query;
  const r = region as string;
  const p = period as string;

  const filter = (data: any[]) => filterByPeriod(filterByRegion(data, r), p);

  const response = {
    branches: filter(branches),
    marketPotential: filter(marketPotential),
    demand: filter(demand),
    expansionZones: filter(expansionZones),
    competitors: filter(competitors),
    states: r ? states.filter(s => s.region.toLowerCase() === r.toLowerCase()) : states
  };

  res.json({ 
    data: response,
    meta: {
      updatedAt: new Date().toISOString() 
    }
  });
});

export default router;
