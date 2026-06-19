import { Router } from 'express';
import { getTimetable, createTimetableEntry } from '../controllers/timetable.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/:grade', getTimetable);
router.post('/', createTimetableEntry);

export default router;
