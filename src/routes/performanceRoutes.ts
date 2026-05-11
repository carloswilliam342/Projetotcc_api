import { Router } from 'express';
import prisma from '../prisma';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// Listar registros de desempenho (com filtros opcionais)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { studentId, activityId } = req.query;
    const where: any = {};
    if (studentId) where.studentId = studentId as string;
    if (activityId) where.activityId = activityId as string;

    if (req.user?.role !== 'master' && req.user?.role !== 'admin') {
      where.student = { class: { teacherId: req.user?.id } };
    }

    const records = await prisma.performanceRecord.findMany({
      where,
      include: { student: true, activity: true },
      orderBy: { date: 'desc' },
    });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar registros de desempenho' });
  }
});

// Criar registro de desempenho
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'master' && req.user?.role !== 'admin') {
      const student = await prisma.student.findUnique({
        where: { id: req.body.studentId },
        include: { class: true },
      });
      if (!student || student.class.teacherId !== req.user?.id) {
        return res.status(403).json({ error: 'Acesso negado: o aluno não pertence a sua turma' });
      }
    }

    const record = await prisma.performanceRecord.create({
      data: req.body,
      include: { student: true, activity: true },
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar registro de desempenho' });
  }
});

export default router;
