import express from 'express';
import { registerUser, loginUser, googleLogin, getUserProfile, verifyOTP } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// rutas publicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/verify-otp', verifyOTP);
router.post('/google', googleLogin);

// rutas privadas
router.get('/me', protect, getUserProfile);

export default router;