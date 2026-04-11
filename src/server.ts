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
import prisma from './prisma';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Log de configuração na inicialização
const dbUrl = process.env.DATABASE_URL || '';
console.log(`📦 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🔗 DATABASE_URL: ${dbUrl ? dbUrl.substring(0, 30) + '...' : 'NÃO DEFINIDA'}`);
console.log(`🌐 FRONTEND_URL: ${process.env.FRONTEND_URL || 'NÃO DEFINIDA'}`);

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

// Diagnostic endpoint - testa conexão com banco
app.get('/api/diag', async (_req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT 1 as ok`;
    const teacherCount = await prisma.teacher.count();
    res.json({ db: 'connected', result, teacherCount, dbUrl: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET' });
  } catch (error: any) {
    res.status(500).json({ db: 'error', message: error.message, dbUrl: dbUrl ? dbUrl.substring(0, 30) + '...' : 'NOT SET' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});

