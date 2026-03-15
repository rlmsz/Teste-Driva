import { Router, Request, Response } from 'express';
import competitors from '../data/competitors.json';
import { filterByRegion, filterByPeriod } from '../utils/filters';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { region, period } = req.query;
  let filtered = filterByRegion(competitors, region as string);
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
