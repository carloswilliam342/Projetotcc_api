import { Router } from 'express';
import prisma from '../prisma';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// Listar todas as atividades
router.get('/', async (req: AuthRequest, res) => {
  try {
    const whereClause = (req.user?.role === 'master' || req.user?.role === 'admin') ? {} : { teacherId: req.user?.id };

    const activities = await prisma.activity.findMany({
      where: whereClause,
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
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const activity = await prisma.activity.findUnique({
      where: { id: req.params.id },
      include: { 
        steps: { orderBy: { order: 'asc' } },
        student: true,
      },
    });
    if (!activity) return res.status(404).json({ error: 'Atividade não encontrada' });

    if ((req.user?.role !== 'master' && req.user?.role !== 'admin') && activity.teacherId !== req.user?.id) {
      return res.status(403).json({ error: 'Acesso negado a esta atividade' });
    }

    return res.json(activity);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar atividade' });
  }
});

// Criar atividade (com steps)
router.post('/', async (req: AuthRequest, res) => {
  try {
    const { steps, ...activityData } = req.body;
    
    if ((req.user?.role !== 'master' && req.user?.role !== 'admin')) {
      activityData.teacherId = req.user?.id;
    }

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
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const existingActivity = await prisma.activity.findUnique({ where: { id: req.params.id } });
    if (!existingActivity) return res.status(404).json({ error: 'Atividade não encontrada' });

    if ((req.user?.role !== 'master' && req.user?.role !== 'admin') && existingActivity.teacherId !== req.user?.id) {
      return res.status(403).json({ error: 'Acesso negado a esta atividade' });
    }

    const { title, subject, description, visualResources, difficulty, adaptedFor, studentId, steps } = req.body;

    // Se steps foram enviados, deleta os antigos e cria os novos
    if (steps) {
      await prisma.activityStep.deleteMany({
        where: { activityId: req.params.id },
      });
    }

    const activity = await prisma.activity.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(subject !== undefined && { subject }),
        ...(description !== undefined && { description }),
        ...(visualResources !== undefined && { visualResources }),
        ...(difficulty !== undefined && { difficulty }),
        ...(adaptedFor !== undefined && { adaptedFor }),
        ...(studentId !== undefined && { studentId: studentId || null }),
        steps: steps ? { create: steps } : undefined,
      },
      include: { 
        steps: { orderBy: { order: 'asc' } },
        student: true, 
      },
    });
    res.json(activity);
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    res.status(500).json({ error: 'Erro ao atualizar atividade' });
  }
});

// Deletar atividade (steps são deletados em cascata)
router.delete('/:id', async (req: AuthRequest, res) => {
  try {
    const existingActivity = await prisma.activity.findUnique({ where: { id: req.params.id } });
    if (!existingActivity) return res.status(404).json({ error: 'Atividade não encontrada' });

    if (req.user?.role !== 'admin' && existingActivity.teacherId !== req.user?.id) {
      return res.status(403).json({ error: 'Acesso negado a esta atividade' });
    }

    await prisma.activity.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Atividade deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar atividade' });
  }
});

export default router;
