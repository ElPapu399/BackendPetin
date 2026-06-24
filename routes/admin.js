import express from 'express';
import { getDashboardStats, getAllPetsAndUsers, getRecentMatches } from '../controllers/adminController.js';
import { protect, adminProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// proteger las rutas con  => protect
router.get('/stats', protect, adminProtect, getDashboardStats);
router.get('/pets', protect, adminProtect, getAllPetsAndUsers);
router.get('/matches', protect, adminProtect, getRecentMatches);

export default router;
