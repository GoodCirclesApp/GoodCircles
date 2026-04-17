import { Router } from 'express';
import * as paymentController from '../controllers/paymentController';
import { authenticateToken } from '../middleware/authMiddleware';
import express from 'express';

const router = Router();

// Webhook must use raw body (handled in server.ts)
router.post('/webhook', paymentController.handleWebhook);

// Authenticated routes
router.use(authenticateToken);
router.post('/checkout', paymentController.createCheckout);

export default router;
