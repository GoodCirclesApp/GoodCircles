import { Router } from 'express';
import * as bookingController from '../controllers/bookingController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateToken);

router.post('/', bookingController.createBooking);
router.put('/:id/confirm', bookingController.confirmBooking);
router.post('/:id/complete', bookingController.completeBooking);
router.put('/:id/cancel', bookingController.cancelBooking);
router.post('/process-reminders', bookingController.processReminders);

export default router;
