import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as accountController from '../controllers/accountController';

const router = Router();

router.use(authenticateToken);

// GET /api/account/export — download the caller's own data (DSAR / portability).
router.get('/export', accountController.exportMyData);

export default router;
