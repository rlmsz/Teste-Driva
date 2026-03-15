import { Router } from 'express';
import branchesRouter from './branches';
import marketPotentialRouter from './marketPotential';
import demandRouter from './demand';
import expansionZonesRouter from './expansionZones';
import competitorsRouter from './competitors';
import statesRouter from './states';
import intelligenceRouter from './intelligence';

const router = Router();

router.use('/branches', branchesRouter);
router.use('/market-potential', marketPotentialRouter);
router.use('/demand', demandRouter);
router.use('/expansion-zones', expansionZonesRouter);
router.use('/competitors', competitorsRouter);
router.use('/states', statesRouter);
router.use('/intelligence', intelligenceRouter);

export default router;
