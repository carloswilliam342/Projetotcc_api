import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar todos os professores
router.get('/', async (_req, res) => {
  try {
    const teachers = await prisma.teacher.findMany({
      omit: { password: true },
      orderBy: { name: 'asc' },
    });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar professores' });
  }
});

// Buscar professor por ID
router.get('/:id', async (req, res) => {
  try {
    const teacher = await prisma.teacher.findUnique({
      where: { id: req.params.id },
      omit: { password: true },
      include: { classes: true },
    });
    if (!teacher) return res.status(404).json({ error: 'Professor não encontrado' });
    return res.json(teacher);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar professor' });
  }
});

// Criar professor
router.post('/', async (req, res) => {
  try {
    const teacher = await prisma.teacher.create({
      data: req.body,
      omit: { password: true },
    });
    res.status(201).json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar professor' });
  }
});

// Atualizar professor
router.put('/:id', async (req, res) => {
  try {
    const teacher = await prisma.teacher.update({
      where: { id: req.params.id },
      data: req.body,
      omit: { password: true },
    });
    res.json(teacher);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar professor' });
  }
});

export default router;
