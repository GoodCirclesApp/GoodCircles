import { Router } from 'express';
import * as communityFundController from '../controllers/communityFundController';

const router = Router();

router.get('/', communityFundController.getFunds);
router.post('/contribute', communityFundController.contribute);
router.post('/apply', communityFundController.applyForLoan);
router.get('/portfolio/:userId', communityFundController.getPortfolio);
router.post('/repayment', communityFundController.processRepayment);

export default router;
