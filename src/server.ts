/**
 * Servidor HTTP - Inicialização do Express
 */

import 'dotenv/config';
import app from './app';
import { env } from './config/env';
import prisma from './config/database';

const PORT = env.PORT;

/**
 * Iniciar servidor
 */
async function startServer() {
  try {
    // Testar conexão com banco de dados
    await prisma.$connect();
    console.log('✅ Conexão com PostgreSQL estabelecida com sucesso');

    // Iniciar servidor HTTP
    app.listen(PORT, () => {
      console.log('\n🚀 ============================================');
      console.log(`   Servidor rodando na porta ${PORT}`);
      console.log(`   Ambiente: ${env.NODE_ENV}`);
      console.log(`   URL: http://localhost:${PORT}`);
      console.log(`   API: http://localhost:${PORT}/api`);
      console.log(`   Health: http://localhost:${PORT}/api/health`);
      console.log('============================================\n');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

/**
 * Graceful shutdown
 */
async function gracefulShutdown() {
  console.log('\n⏹️  Encerrando servidor...');

  try {
    await prisma.$disconnect();
    console.log('✅ Conexão com banco de dados encerrada');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao encerrar:', error);
    process.exit(1);
  }
}

// Capturar sinais de encerramento
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Iniciar
startServer();



