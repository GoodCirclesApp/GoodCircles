import { Router } from 'express';
import * as nettingController from '../controllers/nettingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/status', nettingController.getStatus);
router.get('/history', nettingController.getHistory);
router.get('/savings', nettingController.getSavings);
router.get('/activation', nettingController.getActivationHistory);
router.post('/evaluate', nettingController.triggerEvaluation);
router.post('/run', nettingController.runCycle);
router.get('/compliance/:merchantId', nettingController.getCompliance);

export default router;
