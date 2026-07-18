import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  // Nunca expor o hash de senha em queries (includes de teacher em outras rotas).
  // Rotas que precisam do hash (login) usam `omit: { password: false }` localmente.
  omit: { teacher: { password: true } },
});

// Test database connection on startup
prisma.$connect()
  .then(() => console.log('✅ Conectado ao banco de dados'))
  .catch((err: Error) => console.error('❌ Erro ao conectar ao banco:', err.message));

export default prisma;
