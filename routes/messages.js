import express from 'express';
import { getMessages } from '../controllers/messageController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

s
router.use(protect);


router.get('/:roomId', getMessages);

export default router;
