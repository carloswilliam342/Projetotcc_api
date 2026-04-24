import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma';

const router = Router();

const studentSchema = z.object({
  name: z.string().min(1, 'Nome do aluno é obrigatório'),
  classId: z.string().uuid('ID da turma inválido'),
  registrationNumber: z.string().min(1, 'Matrícula é obrigatória'),
  birthDate: z.string().min(1, 'Data de nascimento é obrigatória'),
  needsTea: z.boolean().default(false),
  needsTdah: z.boolean().default(false),
  otherNeeds: z.string().default(''),
  needsObservations: z.string().default(''),
});

const updateStudentSchema = studentSchema.partial();

// Listar alunos (com paginação e busca)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const { classId } = req.query;
    const skip = (page - 1) * limit;

    const baseWhere: any = {};
    if (classId) baseWhere.classId = classId as string;
    
    if (search) {
      baseWhere.OR = [
        { name: { contains: search, mode: 'insensitive' as const } },
        { registrationNumber: { contains: search, mode: 'insensitive' as const } }
      ];
    }

    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where: baseWhere,
        skip,
        take: limit,
        include: { class: true, profile: true },
        orderBy: { name: 'asc' },
      }),
      prisma.student.count({ where: baseWhere })
    ]);

    res.json({
      data: students,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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
    const data = studentSchema.parse(req.body);
    const student = await prisma.student.create({
      data,
      include: { class: true },
    });
    res.status(201).json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    res.status(500).json({ error: 'Erro ao criar aluno' });
  }
});

// Atualizar aluno
router.put('/:id', async (req, res) => {
  try {
    const data = updateStudentSchema.parse(req.body);
    const student = await prisma.student.update({
      where: { id: req.params.id },
      data,
      include: { class: true },
    });
    res.json(student);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Dados inválidos', details: error.issues });
    }
    res.status(500).json({ error: 'Erro ao atualizar aluno' });
  }
});

export default router;
