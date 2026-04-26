import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as impactController from '../controllers/impactController';

const router = Router();
router.use(authenticateToken);

router.get('/overview', impactController.getOverview);
router.get('/state/:state', impactController.getStateDetail);

export default router;
