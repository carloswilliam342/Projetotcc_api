import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Buscar perfil por studentId
router.get('/:studentId', async (req, res) => {
  try {
    const profile = await prisma.studentProfile.findUnique({
      where: { studentId: req.params.studentId },
      include: { student: true },
    });
    if (!profile) return res.status(404).json({ error: 'Perfil não encontrado' });
    return res.json(profile);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao buscar perfil' });
  }
});

// Upsert perfil (criar ou atualizar)
router.put('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
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
