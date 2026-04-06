import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar todas as atividades
router.get('/', async (_req, res) => {
  try {
    const activities = await prisma.activity.findMany({
      include: { 
        steps: { orderBy: { order: 'asc' } },
        student: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atividades' });
  }
});

// Buscar atividade por ID
router.get('/:id', async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: { 
        steps: { orderBy: { order: 'asc' } },
        student: true,
      },
    });
    if (!activity) return res.status(404).json({ error: 'Atividade não encontrada' });
    return res.json(activity);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar atividade' });
  }
});

// Criar atividade (com steps)
router.post('/', async (req, res) => {
  try {
    const { steps, ...activityData } = req.body;
    const activity = await prisma.activity.create({
      data: {
        ...activityData,
        steps: steps ? { create: steps } : undefined,
      },
      include: { 
        steps: { orderBy: { order: 'asc' } },
        student: true,
      },
    });
    res.status(201).json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar atividade' });
  }
});

// Atualizar atividade
router.put('/:id', async (req, res) => {
  try {
    const { steps, ...activityData } = req.body;
    // Se steps foram enviados, deleta os antigos e cria os novos
    if (steps) {
      await prisma.activityStep.deleteMany({
        where: { activityId: req.params.id },
      });
    }
    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: {
        ...activityData,
        steps: steps ? { create: steps } : undefined,
      },
      include: { 
        steps: { orderBy: { order: 'asc' } },
        student: true, 
      },
    });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar atividade' });
  }
});

// Deletar atividade (steps são deletados em cascata)
router.delete('/:id', async (req, res) => {
  try {
    await prisma.activity.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Atividade deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar atividade' });
  }
});

export default router;
