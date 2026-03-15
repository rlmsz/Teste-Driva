import { Router, Request, Response } from 'express';
import expansionZones from '../data/expansionZones.json';
import { filterByRegion, filterByPeriod } from '../utils/filters';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { region, period } = req.query;
  let filtered = filterByRegion(expansionZones, region as string);
  filtered = filterByPeriod(filtered, period as string);

  res.json({
    data: filtered,
    meta: {
      total: filtered.length,
      updatedAt: new Date().toISOString()
    }
  });
});

export default router;
