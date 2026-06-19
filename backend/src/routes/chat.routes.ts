import { Router } from 'express';
import { getChatRooms, createRoom, getMessages, sendMessage } from '../controllers/chat.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/rooms', getChatRooms);
router.post('/rooms', createRoom);
router.get('/messages/:room_id', getMessages);
router.post('/messages', sendMessage);

export default router;
