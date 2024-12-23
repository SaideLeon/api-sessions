// Importações
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import personAI from "../core/person.mjs";


import Tools from './tools.mjs';
import { PrismaClient } from '@prisma/client';
import { Server } from 'socket.io';

// Inicializações
const tools = new Tools();
const prisma = new PrismaClient();

/**
 * Cria e gerencia uma sessão do WhatsApp
 * @param {string} sessionId - ID único da sessão
 * @param {string} userId - ID do usuário associado
 * @param {Object} sessions - Objeto contendo as sessões ativas
 * @param {Server} io - Instância do Socket.IO para comunicação
 */
export async function createSession(sessionId, userId, sessions, io) {
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
    });

    // Evento de QR Code gerado
    client.on('qr', async (qr) => {
        console.log(`QR code gerado para a sessão ${sessionId}`);
        sessions[sessionId] = { ...sessions[sessionId], qr };
        io.emit(`qr-${sessionId}`, qr);
    });

    // Evento quando o cliente está pronto
    client.on('ready', async () => {
        console.log(`Cliente ${sessionId} está pronto!`);
        sessions[sessionId] = { ...sessions[sessionId], ready: true };

        try {
            await prisma.session.upsert({
                where: { sessionId },
                update: { createdAt: new Date() },
                create: { sessionId, userId },
            });
            io.emit(`ready-${sessionId}`);
        } catch (error) {
            console.error(`Erro ao salvar a sessão ${sessionId} no banco de dados:`, error);
        }
    });

    // Evento para mensagens recebidas
    client.on('message', async (message) => {
        if (message.fromMe) return;

        const userId = message.from;
        if (userId.includes('status')) return; // Ignora mensagens de status

        try {
            let resposta;

            if (message.hasMedia) {
                const mediaData = await tools.baixarMidia(message);
                resposta = mediaData
                    ? await tools.processarMedia(userId, mediaData, sessionId)
                    : "Não consegui baixar a mídia.";
            } else {
                resposta = await tools.processarTexto(userId, message.body, sessionId);
            }

            if (resposta) {
                await message.reply(resposta.replace(/\*\*/g, '*'));
            }
        } catch (error) {
            console.error(`Erro ao processar mensagem para o usuário ${userId}:`, error);
        }
    });

    // Evento quando o cliente é desconectado
    client.on('disconnected', () => {
        console.log(`Cliente ${sessionId} desconectado.`); 
        io.emit(`disconnected-${sessionId}`);
    });

    // Inicialização do cliente
    try {
        await client.initialize();
        sessions[sessionId] = { client, qr: null, ready: false };
    } catch (error) {
        console.error(`Erro ao inicializar o cliente para a sessão ${sessionId}:`, error);
        delete sessions[sessionId];
    }
}
