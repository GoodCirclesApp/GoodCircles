import { Router } from 'express';
import * as walletController from '../controllers/walletController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.get('/balance', walletController.getBalance);
router.get('/credits/balance', walletController.getCreditBalance);
router.get('/history', walletController.getHistory);
router.post('/fund', walletController.fundWallet);
router.post('/withdraw', walletController.withdraw);

export default router;
