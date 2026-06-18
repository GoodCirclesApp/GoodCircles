import { Router } from 'express';
import * as walletController from '../controllers/walletController';
import { authenticateToken } from '../middleware/authMiddleware';
import { requireFlag } from '../middleware/featureFlagMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/balance', walletController.getBalance);
router.get('/credits/balance', walletController.getCreditBalance);
router.get('/history', walletController.getHistory);
// Custodial top-up + cash withdrawal are MT/stored-value triggers — gated OFF until a BaaS phase.
router.post('/fund/intent', requireFlag('enable_internal_banking'), walletController.createFundIntent);   // Stripe Elements: create PaymentIntent
router.post('/withdraw', requireFlag('enable_internal_banking'), walletController.withdraw);
router.post('/qr-token', walletController.generateQrToken);       // HMAC-signed QR token

export default router;
