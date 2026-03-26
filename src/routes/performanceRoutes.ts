import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar registros de desempenho (com filtros opcionais)
router.get('/', async (req, res) => {
  try {
    const { studentId, activityId } = req.query;
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (activityId) where.activityId = activityId;

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
router.post('/', async (req, res) => {
  try {
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
