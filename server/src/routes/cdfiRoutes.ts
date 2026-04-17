import { Router } from 'express';
import * as cdfiController from '../controllers/cdfiController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticateToken);

router.get('/:id/dashboard', cdfiController.getDashboard);
router.get('/:id/applications', cdfiController.getApplications);
router.post('/applications/:id/evaluate', cdfiController.evaluateApplication);
router.put('/:cdfiId/applications/:id/approve', cdfiController.approveApplication);
router.put('/:cdfiId/applications/:id/deny', cdfiController.denyApplication);
router.get('/:id/impact', cdfiController.getImpact);

export default router;
