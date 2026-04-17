import { Router } from 'express';
import * as checkoutController from '../controllers/checkoutController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/preview', checkoutController.previewCheckout);

export default router;
