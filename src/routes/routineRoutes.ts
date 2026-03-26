import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar rotinas (com filtro opcional por turma)
router.get('/', async (req, res) => {
  try {
    const { classId } = req.query;
    const routines = await prisma.routineItem.findMany({
      where: classId ? { classId: classId as string } : undefined,
      include: { class: true, activity: true },
      orderBy: [{ dayOfWeek: 'asc' }, { time: 'asc' }],
    });
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar rotinas' });
  }
});

// Criar rotina
router.post('/', async (req, res) => {
  try {
    const routine = await prisma.routineItem.create({
      data: req.body,
      include: { class: true, activity: true },
    });
    res.status(201).json(routine);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar rotina' });
  }
});

// Atualizar rotina
router.put('/:id', async (req, res) => {
  try {
    const routine = await prisma.routineItem.update({
      where: { id: req.params.id },
      data: req.body,
      include: { class: true, activity: true },
    });
    res.json(routine);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar rotina' });
  }
});

// Deletar rotina
router.delete('/:id', async (req, res) => {
  try {
    await prisma.routineItem.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Rotina deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar rotina' });
  }
});

export default router;
