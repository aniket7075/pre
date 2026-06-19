import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import attendanceRoutes from './routes/attendance.routes';
import feeRoutes from './routes/fee.routes';
import transportRoutes from './routes/transport.routes';
import chatRoutes from './routes/chat.routes';
import adminRoutes from './routes/admin.routes';
import resultRoutes from './routes/result.routes';
import progressRoutes from './routes/progress.routes';
import homeworkRoutes from './routes/homework.routes';
import noticeRoutes from './routes/notice.routes';
import leaveRoutes from './routes/leave.routes';
import timetableRoutes from './routes/timetable.routes';
import galleryRoutes from './routes/gallery.routes';
import examRoutes from './routes/exam.routes';
import lessonPlanRoutes from './routes/lesson_plan.routes';
import libraryRoutes from './routes/library.routes';
import certificateRoutes from './routes/certificate.routes';
import classesRoutes from './routes/classes.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Pre-School API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/homework', homeworkRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/lesson-plans', lessonPlanRoutes);
app.use('/api/library', libraryRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/classes', classesRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

export default app;
