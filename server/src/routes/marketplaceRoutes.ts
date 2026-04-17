import { Router } from 'express';
import * as marketplaceController from '../controllers/marketplaceController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/search', marketplaceController.searchMarketplace);
router.get('/categories', marketplaceController.getCategories);
router.get('/orders', authenticateToken, marketplaceController.listOrders);
router.get('/listings/:id', marketplaceController.getListingDetail);
router.get('/listings/:id/availability', marketplaceController.getAvailability);

router.post('/checkout', authenticateToken, marketplaceController.checkout);

export default router;
