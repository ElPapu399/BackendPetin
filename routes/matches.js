import express from 'express';
import { swipePet, getMyMatches } from '../controllers/matchController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/swipe', swipePet);


router.get('/:petId', getMyMatches);

export default router;