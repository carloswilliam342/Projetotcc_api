import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Listar todos os alunos (com filtro opcional por turma)
router.get('/', async (req, res) => {
  try {
    const { classId } = req.query;
    const students = await prisma.student.findMany({
      where: classId ? { classId: classId as string } : undefined,
      include: { class: true, profile: true },
      orderBy: { name: 'asc' },
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar alunos' });
  }
});

// Buscar aluno por ID
router.get('/:id', async (req, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: req.params.id },
      include: { class: true, profile: true, observations: true, performanceRecords: true },
    });
    if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });
    return res.json(student);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

// Criar aluno
router.post('/', async (req, res) => {
  try {
    const student = await prisma.student.create({
      data: req.body,
      include: { class: true },
    });
    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

// Atualizar aluno
router.put('/:id', async (req, res) => {
  try {
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data: req.body,
      include: { class: true },
    });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

export default router;
