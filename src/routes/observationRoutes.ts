import { Router } from 'express';
import prisma from '../prisma';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// Listar observações (com filtros opcionais)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { studentId, classId } = req.query;
    const where: any = {};
    if (studentId) where.studentId = studentId as string;
    if (classId) where.classId = classId as string;

    if (req.user?.role !== 'master' && req.user?.role !== 'admin') {
      where.class = { teacherId: req.user?.id };
    }

    const observations = await prisma.lessonObservation.findMany({
      where,
      include: { student: true, class: true, activity: true },
      orderBy: { date: 'desc' },
    });
    res.json(observations);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar observações' });
  }
});

// Criar observação
router.post('/', async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'master' && req.user?.role !== 'admin') {
      const classItem = await prisma.class.findUnique({ where: { id: req.body.classId } });
      if (!classItem || classItem.teacherId !== req.user?.id) {
        return res.status(403).json({ error: 'Acesso negado: a turma não pertence a você' });
      }
    }

    const observation = await prisma.lessonObservation.create({
      data: req.body,
      include: { student: true, class: true },
    });
    res.status(201).json(observation);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar observação' });
  }
});

export default router;
