import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const SALT_ROUNDS = 10;

const router = Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, login, password, subject } = req.body;

    if (!name || !email || !login || !password || !subject) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios: name, email, login, password, subject' });
    }

    const existingTeacher = await prisma.teacher.findUnique({ where: { login } });
    if (existingTeacher) {
      return res.status(409).json({ error: 'Login já está em uso' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const teacher = await prisma.teacher.create({
      data: { name, email, login, password: hashedPassword, subject, status: 'active' },
    });

    const { password: _, ...teacherWithoutPassword } = teacher;
    return res.status(201).json({ user: teacherWithoutPassword });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { login, password } = req.body;

    const teacher = await prisma.teacher.findFirst({
      where: { OR: [{ login }, { email: login }] },
    });

    const passwordMatch = teacher ? await bcrypt.compare(password, teacher.password) : false;

    if (!teacher || !passwordMatch || teacher.status !== 'active') {
      return res.status(401).json({ error: 'Credenciais inválidas ou usuário inativo' });
    }

    const { password: _, ...teacherWithoutPassword } = teacher;

    const token = jwt.sign(
      { id: teacher.id, role: teacher.role },
      process.env.JWT_SECRET!,
      { expiresIn: 8 * 60 * 60 } // 8 horas em segundos
    );

    return res.json({ user: teacherWithoutPassword, token });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

export default router;
