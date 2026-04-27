import { Router } from 'express';
import * as walletController from '../controllers/walletController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/balance', walletController.getBalance);
router.get('/credits/balance', walletController.getCreditBalance);
router.get('/history', walletController.getHistory);
router.post('/fund/intent', walletController.createFundIntent);   // Stripe Elements: create PaymentIntent
router.post('/withdraw', walletController.withdraw);
router.post('/qr-token', walletController.generateQrToken);       // HMAC-signed QR token

export default router;
