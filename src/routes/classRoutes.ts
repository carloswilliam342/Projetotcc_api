import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma';

const router = Router();

const classSchema = z.object({
  name: z.string().min(1, 'Nome da turma é obrigatório'),
  year: z.string().min(1, 'Ano é obrigatório'),
  shift: z.enum(['morning', 'afternoon', 'evening']),
  teacherId: z.string().uuid('ID do professor inválido'),
});

const updateClassSchema = classSchema.partial();

// Listar todas as turmas
router.get('/', async (_req, res) => {
  try {
    const classes = await prisma.class.findMany({
      include: { teacher: true, students: { include: { profile: true } } },
      orderBy: { name: 'asc' },
    });
    res.json(classes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar turmas' });
  }
});

// Buscar turma por ID
router.get('/:id', async (req, res) => {
  try {
    const classItem = await prisma.class.findUnique({
      where: { id: req.params.id },
      include: { teacher: true, students: true },
    });
    if (!classItem) return res.status(404).json({ error: 'Turma não encontrada' });
    return res.json(classItem);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar turma' });
  }
});

// Criar turma
router.post('/', async (req, res) => {
  try {
    const data = classSchema.parse(req.body);
    const classItem = await prisma.class.create({
      data,
      include: { teacher: true },
    });
    res.status(201).json(classItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    res.status(500).json({ error: 'Erro ao criar turma' });
  }
});

// Atualizar turma
router.put('/:id', async (req, res) => {
  try {
    const data = updateClassSchema.parse(req.body);
    const classItem = await prisma.class.update({
      where: { id: req.params.id },
      data,
      include: { teacher: true },
    });
    res.json(classItem);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    res.status(500).json({ error: 'Erro ao atualizar turma' });
  }
});

// Deletar turma
router.delete('/:id', async (req, res) => {
  try {
    await prisma.class.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Turma deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar turma' });
  }
});

export default router;
