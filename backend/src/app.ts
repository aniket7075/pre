import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Routes
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

// ─── Security & Utilities ──────────────────────────────────────────────────────
// CORS – allow all origins in dev (restrict in production via env)
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['*'];
app.use(cors({
  origin: allowedOrigins.includes('*') ? '*' : allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsers
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Pre-School API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
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

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global Error Handler ──────────────────────────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err.stack);
  res.status(err.status || 500).json({ 
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message 
  });
});

export default app;
