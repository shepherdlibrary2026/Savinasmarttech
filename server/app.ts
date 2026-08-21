import express from 'express';
import { authMiddleware } from './middleware/auth';
import { authRouter } from './routes/auth';
import { schoolsRouter } from './routes/schools';
import { usersRouter } from './routes/users';
import { classesRouter } from './routes/classes';
import { gradesRouter } from './routes/grades';
import { attendanceRouter } from './routes/attendance';
import { bursarRouter } from './routes/bursar';
import { moeRouter } from './routes/moe';
import { liveClassroomRouter } from './routes/liveClassroom';
import { aiRouter } from './routes/ai';

export const app = express();

// Parse incoming JSON & URL-encoded bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Authentication Context Middleware to /api
app.use('/api', authMiddleware);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'Savina K-12 Multi-Tenant Backend',
    region: 'Liberia & West Africa',
    version: '2.4.0-prod',
    activeFeatures: [
      'FERPA & GDPR Row-Level Security',
      'MTN & Orange Mobile Money Payments',
      'Liberia MoE Curriculum Repository',
      'Low-Bandwidth Adaptive Classroom Broadcasts',
      'Gemini 3.7 Flash AI Lesson Designer',
    ],
    timestamp: new Date().toISOString(),
  });
});

// Mount modular sub-routers
app.use('/api/auth', authRouter);
app.use('/api/schools', schoolsRouter);
app.use('/api/users', usersRouter);
app.use('/api/classes', classesRouter);
app.use('/api/grades', gradesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/bursar', bursarRouter);
app.use('/api/moe', moeRouter);
app.use('/api/live', liveClassroomRouter);
app.use('/api/ai', aiRouter);

// Standard 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});
