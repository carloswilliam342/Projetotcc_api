import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/system-logs — Lista paginada com filtros
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const action = req.query.action as string | undefined;
    const entity = req.query.entity as string | undefined;
    const search = (req.query.search as string) || '';

    const where: any = {};
    if (action) where.action = action;
    if (entity) where.entity = entity;
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' as const } },
        { details: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.systemLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.systemLog.count({ where }),
    ]);

    res.json({
      data: logs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('SystemLogs error:', error);
    res.status(500).json({ error: 'Erro ao buscar logs do sistema' });
  }
});

export default router;
