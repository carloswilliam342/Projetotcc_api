import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', async (_req, res) => {
  try {
    const now = new Date();

    // ─── Totais gerais ────────────────────────────────────────────────────
    const [totalTeachers, totalStudents, totalClasses, totalActivities] = await Promise.all([
      prisma.teacher.count({ where: { status: 'active' } }),
      prisma.student.count(),
      prisma.class.count(),
      prisma.activity.count(),
    ]);

    const studentsWithNeeds = await prisma.student.count({
      where: {
        OR: [
          { needsTea: true },
          { needsTdah: true },
          { otherNeeds: { not: '' } },
        ],
      },
    });

    // ─── Completion stats ─────────────────────────────────────────────────
    const [completed, completedWithHelp, notCompleted] = await Promise.all([
      prisma.performanceRecord.count({ where: { status: 'completed' } }),
      prisma.performanceRecord.count({ where: { status: 'completed_with_help' } }),
      prisma.performanceRecord.count({ where: { status: 'not_completed' } }),
    ]);

    // ─── Atividade semanal (últimos 7 dias) ───────────────────────────────
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklyActivity: { day: string; atividades: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD

      const count = await prisma.performanceRecord.count({
        where: { date: dateStr },
      });

      weeklyActivity.push({
        day: daysOfWeek[date.getDay()],
        atividades: count,
      });
    }

    // ─── Top performers (alunos com mais atividades concluídas) ───────────
    const topRaw = await prisma.performanceRecord.groupBy({
      by: ['studentId'],
      where: { status: 'completed' },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    const topStudents = await Promise.all(
      topRaw.map(async (t) => {
        const student = await prisma.student.findUnique({
          where: { id: t.studentId },
          select: { name: true },
        });
        return { name: student?.name ?? 'Desconhecido', completedCount: t._count.id };
      }),
    );

    // ─── Crescimento mensal de alunos ─────────────────────────────────────
    // Comparação simplificada: total atual vs alunos criados até o mês anterior
    // Como não temos createdAt no Student, usamos contagem total (placeholder)
    const recentGrowth = totalStudents;

    res.json({
      totalTeachers,
      totalStudents,
      totalClasses,
      totalActivities,
      studentsWithNeeds,
      completionStats: { completed, completedWithHelp, notCompleted },
      weeklyActivity,
      topPerformers: topStudents,
      recentGrowth,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Erro ao carregar estatísticas do dashboard' });
  }
});

export default router;
