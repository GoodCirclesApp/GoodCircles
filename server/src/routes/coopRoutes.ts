import { Router } from 'express';
import * as coopController from '../controllers/coopController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/cooperatives', coopController.formCooperative);
router.get('/cooperatives/:id', coopController.getCoopDetails);
router.post('/cooperatives/:id/join', coopController.joinCooperative);
router.post('/cooperatives/:id/patronage', coopController.calculatePatronage);
router.post('/cooperatives/:id/withdraw', coopController.withdrawMember);

export default router;
