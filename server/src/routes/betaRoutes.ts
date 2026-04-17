import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import * as betaController from '../controllers/betaController';

const router = Router();

// Public — special beta registration (auto-verify, auto-fund)
router.post('/register', betaController.betaRegister);

// Admin-only — reset beta transaction data
router.post('/reset-transactions', authenticateToken, betaController.resetBetaTransactions);

// Public — get current feature flags
router.get('/feature-flags', betaController.getFeatureFlags);

// Admin-only — update feature flags
router.put('/feature-flags', authenticateToken, betaController.updateFeatureFlag);

// Admin-only — activate Phase 3 features
router.post('/activate-phase-3', authenticateToken, betaController.activatePhase3);

export default router;
