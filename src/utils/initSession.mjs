// Importações
import { PrismaClient } from '@prisma/client';
import { createSession } from './createSession.mjs';
import logger from '../log/logger.mjs';
// Inicialização do Prisma
const prisma = new PrismaClient();

/**
 * Inicializa todas as sessões salvas no banco de dados
 * @param {Object} sessions - Objeto que armazena sessões ativas
 * @param {import('socket.io').Server} io - Instância do Socket.IO
 */// initSessions.mjs - Correção da inicialização
async function initSessions(io, sessions) {
  try {
    const activeSessions = await prisma.session.findMany({
      where: {
        status: 'ACTIVE'
      }
    });

    for (const session of activeSessions) {
      try {
        const sessionManager = await createSession(
          session.sessionId,
          session.userId,
          sessions,
          io
        );
        
        // Agora usando Map.set
        sessions.set(session.sessionId, sessionManager);
        
      } catch (error) {
        logger.error(
          `Erro ao reinicializar sessão ${session.sessionId}:`,
          error
        );
        
        await prisma.session.update({
          where: { sessionId: session.sessionId },
          data: { 
            status: 'ERROR',
            errorMessage: error.message
          }
        });
      }
    }

    logger.info(`${activeSessions.length} sessões reinicializadas`);
  } catch (error) {
    logger.error('Erro ao inicializar sessões:', error);
    throw error;
  }
}

export default initSessions;
