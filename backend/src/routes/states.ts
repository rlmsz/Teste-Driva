import { Router, Request, Response } from 'express';
import states from '../data/states.json';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const { region } = req.query;
  const filtered = region 
    ? states.filter((s: any) => s.region.toLowerCase() === (region as string).toLowerCase())
    : states;

  res.json({
    data: filtered,
    meta: {
      total: filtered.length,
      updatedAt: new Date().toISOString()
    }
  });
});

router.get('/:uf', (req: Request, res: Response) => {
  const { uf } = req.params;
  const state = states.find((s: { uf: string }) => s.uf.toUpperCase() === uf.toUpperCase());

  if (!state) {
    return res.status(404).json({ error: 'Estado não encontrado' });
  }

  res.json({
    data: state,
    meta: {
      updatedAt: new Date().toISOString()
    }
  });
});

export default router;
