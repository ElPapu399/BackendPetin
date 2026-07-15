import express from 'express';
import { getDashboardStats, getAllPetsAndUsers, getRecentMatches, getUsers, getUserById, updateUser, deleteUser } from '../controllers/adminController.js';
import { protect, adminProtect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// proteger las rutas con  => protect
router.get('/stats', protect, adminProtect, getDashboardStats);
router.get('/pets', protect, adminProtect, getAllPetsAndUsers);
router.get('/users', protect, adminProtect, getUsers);
router.get('/matches', protect, adminProtect, getRecentMatches);
router.get('/users/:id', protect, adminProtect, getUserById);
router.put('/users/:id', protect, adminProtect, updateUser);
router.delete('/users/:id', protect, adminProtect, deleteUser);

export default router;
