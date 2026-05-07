import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import teacherRoutes from './routes/teacherRoutes';
import classRoutes from './routes/classRoutes';
import studentRoutes from './routes/studentRoutes';
import studentProfileRoutes from './routes/studentProfileRoutes';
import activityRoutes from './routes/activityRoutes';
import routineRoutes from './routes/routineRoutes';
import observationRoutes from './routes/observationRoutes';
import performanceRoutes from './routes/performanceRoutes';
import authRoutes from './routes/authRoutes';
import aiRoutes from './routes/aiRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import passwordResetRoutes from './routes/passwordResetRoutes';
import systemLogRoutes from './routes/systemLogRoutes';
import { authenticateToken, requireRole } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Rotas públicas
app.use('/api/auth', authRoutes);
app.use('/api/auth', passwordResetRoutes);
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Rotas protegidas
app.use('/api/teachers', authenticateToken, teacherRoutes);
app.use('/api/classes', authenticateToken, classRoutes);
app.use('/api/students', authenticateToken, studentRoutes);
app.use('/api/student-profiles', authenticateToken, studentProfileRoutes);
app.use('/api/activities', authenticateToken, activityRoutes);
app.use('/api/routines', authenticateToken, routineRoutes);
app.use('/api/observations', authenticateToken, observationRoutes);
app.use('/api/performance', authenticateToken, performanceRoutes);
app.use('/api/ai', authenticateToken, aiRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/system-logs', authenticateToken, requireRole('master'), systemLogRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

