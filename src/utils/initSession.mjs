// Importações
import { PrismaClient } from '@prisma/client';
import { createSession } from './createSession.mjs';

// Inicialização do Prisma
const prisma = new PrismaClient();

/**
 * Inicializa todas as sessões salvas no banco de dados
 * @param {Object} sessions - Objeto que armazena sessões ativas
 * @param {import('socket.io').Server} io - Instância do Socket.IO
 */
async function initSessions(sessions, io) {
    try {
        // Buscando todas as sessões no banco de dados
        const sessionsFromDB = await prisma.session.findMany();

        // Iterando sobre as sessões e recriando-as
        sessionsFromDB.forEach(session => {
            createSession(session.sessionId, session.userId, sessions, io, true);
        });
    } catch (error) {
        console.error("Erro ao buscar sessões:", error);
    }
}
export default initSessions;