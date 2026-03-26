import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar observações (com filtros opcionais)
router.get('/', async (req, res) => {
  try {
    const { studentId, classId } = req.query;
    const where: any = {};
    if (studentId) where.studentId = studentId;
    if (classId) where.classId = classId;

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
router.post('/', async (req, res) => {
  try {
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
