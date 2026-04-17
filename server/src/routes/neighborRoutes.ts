import { Router } from 'express';
import * as neighborController from '../controllers/neighborController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/nonprofit', authenticateToken, neighborController.getElectedNonprofit);
router.put('/nonprofit', authenticateToken, neighborController.setElectedNonprofit);
router.get('/impact', authenticateToken, neighborController.getImpactData);
router.post('/waive-discount', authenticateToken, neighborController.waiveDiscount);
router.get('/list-nonprofits', neighborController.listNonprofits);

router.get('/initiatives', neighborController.listInitiatives);
router.get('/initiatives/:id', neighborController.getInitiativeDetail);
router.post('/initiatives', authenticateToken, neighborController.createInitiative);

// QR token for in-person checkout
router.get('/qr-token', authenticateToken, neighborController.generateQrToken);

export default router;
