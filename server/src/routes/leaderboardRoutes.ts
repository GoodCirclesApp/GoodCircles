import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getLeaderboard } from '../controllers/leaderboardController';

const router = Router();
router.use(authenticateToken);
router.get('/', getLeaderboard);
export default router;
