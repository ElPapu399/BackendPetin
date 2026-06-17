import express from 'express';
import { registerUser, loginUser, googleLogin, getUserProfile } from '../controllers/authController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Rutas públicas
router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleLogin);

// Rutas privadas (requieren token)
// Ejemplo: usamos el middleware `protect` antes de llamar al controlador
router.get('/me', protect, getUserProfile);

export default router;