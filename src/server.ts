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

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/student-profiles', studentProfileRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/observations', observationRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
