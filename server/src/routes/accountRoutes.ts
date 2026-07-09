import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as accountController from '../controllers/accountController';

const router = Router();

router.use(authenticateToken);

// GET /api/account/export — download the caller's own data (DSAR / portability).
router.get('/export', accountController.exportMyData);

// POST /api/account/delete — right-to-erasure (anonymize-in-place). Requires
// { confirm: true }. Retains de-identified financial/tax records per law.
router.post('/delete', accountController.deleteMyAccount);

export default router;
