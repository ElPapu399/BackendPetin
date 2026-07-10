import express from 'express';
import { createCheckoutSession, verifyPayment } from '../controllers/paymentController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas protegidas para que los usuarios se puedan suscribir 
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/verify-payment', protect, verifyPayment);

export default router;
