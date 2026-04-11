import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Test database connection on startup
prisma.$connect()
  .then(() => console.log('✅ Conectado ao banco de dados'))
  .catch((err: Error) => console.error('❌ Erro ao conectar ao banco:', err.message));

export default prisma;
