import { Router } from 'express';
import prisma from '../prisma';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// Buscar perfil por studentId
router.get('/:studentId', async (req: AuthRequest, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { studentId: (req.params.studentId as string) },
      include: { student: { include: { class: true } } },
    });
    if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });

    if (req.user?.role !== 'master' && req.user?.role !== 'admin' && profile.student.class.teacherId !== req.user?.id) {
      return res.status(403).json({ error: 'Acesso negado: o aluno não pertence a sua turma' });
    }

    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Upsert perfil (criar ou atualizar)
router.put('/:studentId', async (req: AuthRequest, res) => {
  try {
    const studentId = req.params.studentId as string;

    if (req.user?.role !== 'master' && req.user?.role !== 'admin') {
      const student = await prisma.student.findUnique({
        where: { id: studentId },
        include: { class: true },
      });
      if (!student || student.class.teacherId !== req.user?.id) {
        return res.status(403).json({ error: 'Acesso negado: o aluno não pertence a sua turma' });
      }
    }

    const profile = await prisma.studentProfile.upsert({
      where: { studentId },
      update: req.body,
      create: { ...req.body, studentId },
    });
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar perfil' });
  }
});

export default router;
