import { Router } from 'express';
import * as supplyChainController from '../controllers/supplyChainController';

const router = Router();

router.post('/declare', supplyChainController.declareRelationship);
router.get('/matches/:merchantId', supplyChainController.getMatches);
router.get('/status/:merchantId', supplyChainController.getStatus);
router.get('/admin/overview', supplyChainController.getAdminOverview);
router.post('/run-matching/:merchantId', supplyChainController.runMatching);
router.post('/matches/:matchId/accept', supplyChainController.acceptMatch);

export default router;
