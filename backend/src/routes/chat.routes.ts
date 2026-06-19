import { Router } from 'express';
import { getChatRooms, sendMessage } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/rooms', getChatRooms);
router.post('/messages', sendMessage);

export default router;
