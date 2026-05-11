import { Router } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { logAction } from '../auditLogger';
import type { AuthRequest } from '../middleware/auth';

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
router.get('/', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string || '';
    const { classId } = req.query;
    const skip = (page - 1) * limit;

    const baseWhere: any = {};
    if (classId) baseWhere.classId = classId as string;
    
    if ((req.user?.role !== 'master' && req.user?.role !== 'admin')) {
      baseWhere.class = { teacherId: req.user?.id };
    }
    
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
router.get('/:id', async (req: AuthRequest, res) => {
  try {
    const student = await prisma.student.findUnique({
      where: { id: (req.params.id as string) },
      include: { class: true, profile: true, observations: true, performanceRecords: true },
    });
    if (!student) return res.status(404).json({ error: 'Aluno não encontrado' });
    
    if ((req.user?.role !== 'master' && req.user?.role !== 'admin') && student.class.teacherId !== req.user?.id) {
      return res.status(403).json({ error: 'Acesso negado a este aluno' });
    }
    
    return res.json(student);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar aluno' });
  }
});

// Criar aluno
router.post('/', async (req: AuthRequest, res) => {
  try {
    const data = studentSchema.parse(req.body);
    const student = await prisma.student.create({
      data,
      include: { class: true },
    });

    await logAction({
      userId: req.user!.id,
      userName: req.user!.role,
      action: 'CREATE',
      entity: 'student',
      entityId: student.id,
      details: `Cadastrou o aluno "${student.name}"`,
      ip: req.ip,
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
router.put('/:id', async (req: AuthRequest, res) => {
  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id: (req.params.id as string) },
      include: { class: true },
    });

    if (!existingStudent) return res.status(404).json({ error: 'Aluno não encontrado' });

    if ((req.user?.role !== 'master' && req.user?.role !== 'admin') && existingStudent.class.teacherId !== req.user?.id) {
      return res.status(403).json({ error: 'Acesso negado a este aluno' });
    }

    const data = updateStudentSchema.parse(req.body);
    const student = await prisma.student.update({
      where: { id: (req.params.id as string) },
      data,
      include: { class: true },
    });

    await logAction({
      userId: req.user!.id,
      userName: req.user!.role,
      action: 'UPDATE',
      entity: 'student',
      entityId: student.id,
      details: `Atualizou o aluno "${student.name}"`,
      ip: req.ip,
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
