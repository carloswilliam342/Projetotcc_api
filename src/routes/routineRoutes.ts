import { Router } from 'express';
import prisma from '../prisma';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// Listar rotinas (com filtro opcional por turma)
router.get('/', async (req: AuthRequest, res) => {
  try {
    const { classId } = req.query;
    const where: any = {};
    if (classId) where.classId = classId as string;

    if (req.user?.role !== 'master' && req.user?.role !== 'admin') {
      where.class = { teacherId: req.user?.id };
    }

    const routines = await prisma.routineItem.findMany({
      where,
      include: { class: true, activity: true },
      orderBy: [{ dayOfWeek: 'asc' }, { time: 'asc' }],
    });
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar rotinas' });
  }
});

// Criar rotina
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = { ...req.body };
    if (data.activityId === '') {
      data.activityId = null;
    }

    if (req.user?.role !== 'master' && req.user?.role !== 'admin') {
      const classItem = await prisma.class.findUnique({ where: { id: req.body.classId } });
      if (!classItem || classItem.teacherId !== req.user?.id) {
        return res.status(403).json({ error: 'Acesso negado: a turma não pertence a você' });
      }
    }

    const routine = await prisma.routineItem.create({
      data,
      include: { class: true, activity: true },
    });
    res.status(201).json(routine);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar rotina' });
  }
});

// Atualizar rotina
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const data = { ...req.body };
    if (data.activityId === '') {
      data.activityId = null;
    }

    const existingRoutine = await prisma.routineItem.findUnique({
      where: { id: (req.params.id as string) },
      include: { class: true },
    });

    if (!existingRoutine) return res.status(404).json({ error: 'Rotina não encontrada' });

    if (req.user?.role !== 'master' && req.user?.role !== 'admin' && existingRoutine.class.teacherId !== req.user?.id) {
      return res.status(403).json({ error: 'Acesso negado: a turma não pertence a você' });
    }

    const routine = await prisma.routineItem.update({
      where: { id: (req.params.id as string) },
      data,
      include: { class: true, activity: true },
    });
    res.json(routine);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar rotina' });
  }
});

// Deletar rotina
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existingRoutine = await prisma.routineItem.findUnique({
      where: { id: (req.params.id as string) },
      include: { class: true },
    });

    if (!existingRoutine) return res.status(404).json({ error: 'Rotina não encontrada' });

    if (req.user?.role !== 'master' && req.user?.role !== 'admin' && existingRoutine.class.teacherId !== req.user?.id) {
      return res.status(403).json({ error: 'Acesso negado: a turma não pertence a você' });
    }

    await prisma.routineItem.delete({
      where: { id: (req.params.id as string) },
    });
    res.json({ message: 'Rotina deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar rotina' });
  }
});

export default router;
