import { Router } from 'express';
import * as communityFundController from '../controllers/communityFundController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticateToken);

router.get('/', communityFundController.getFunds);
router.post('/contribute', communityFundController.contribute);
router.post('/apply', communityFundController.applyForLoan);
router.get('/portfolio/:userId', communityFundController.getPortfolio);
router.post('/repayment', communityFundController.processRepayment);

export default router;
