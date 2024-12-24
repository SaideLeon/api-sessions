// Importações// utils/createSession.mjs
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
 * Configurações do Puppeteer para o cliente WhatsApp
 */
const puppeteerConfig = {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-accelerated-2d-canvas',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-infobars',
        '--no-default-browser-check',
        '--no-experiments',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--ignore-ssl-errors'
    ],
    headless: true,
    defaultViewport: null,
    timeout: 60000
};

/**
 * Tenta inicializar o cliente com retry em caso de falha
 * @param {Client} client - Cliente WhatsApp
 * @param {number} maxRetries - Número máximo de tentativas
 * @returns {Promise<boolean>}
 */
async function initializeWithRetry(client, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await client.initialize();
            console.log(`Cliente inicializado com sucesso na tentativa ${i + 1}`);
            return true;
        } catch (error) {
            console.error(`Tentativa ${i + 1} de ${maxRetries} falhou:`, error);
            if (i === maxRetries - 1) throw error;
            console.log(`Aguardando 5 segundos antes da próxima tentativa...`);
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
}

/**
 * Limpa recursos do cliente
 * @param {Client} client - Cliente WhatsApp
 */
async function cleanupClient(client) {
    try {
        await client.destroy();
        console.log('Cliente destruído com sucesso');
    } catch (error) {
        console.error('Erro ao destruir cliente:', error);
    }
}

/**
 * Atualiza o status da sessão no banco de dados
 * @param {string} sessionId - ID da sessão
 * @param {string} status - Novo status
 * @param {string} [errorMessage] - Mensagem de erro opcional
 */
async function updateSessionStatus(sessionId, status, errorMessage = null) {
    try {
        await prisma.session.update({
            where: { sessionId },
            data: { 
                status,
                ...(errorMessage && { errorMessage })
            }
        });
    } catch (error) {
        console.error(`Erro ao atualizar status da sessão ${sessionId}:`, error);
    }
}

/**
 * Processa mensagens recebidas
 * @param {Object} message - Mensagem recebida
 * @param {string} sessionId - ID da sessão
 */
async function handleIncomingMessage(message, sessionId) {
    if (message.fromMe) return;

    const chatId = message.from;
    if (chatId.includes('status')) return;

    try {
        let resposta;

        if (message.hasMedia) {
            console.log(`Processando mídia da mensagem de ${chatId}`);
            const mediaData = await tools.baixarMidia(message);
            resposta = mediaData
                ? await tools.processarMedia(chatId, mediaData, sessionId)
                : "Não foi possível processar a mídia. Por favor, tente novamente.";
        } else {
            console.log(`Processando texto da mensagem de ${chatId}: "${message.body.substring(0, 50)}..."`);
            resposta = await tools.processarTexto(chatId, message.body, sessionId);
        }

        if (resposta) {
            await message.reply(resposta.replace(/\*\*/g, '*'));
            console.log(`Resposta enviada para ${chatId}`);
        }
    } catch (error) {
        console.error(`Erro ao processar mensagem para ${chatId}:`, error);
        try {
            await message.reply("Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente em alguns instantes.");
        } catch (replyError) {
            console.error(`Erro ao enviar mensagem de erro para ${chatId}:`, replyError);
        }
    }
}

/**
 * Cria e gerencia uma sessão do WhatsApp
 * @param {string} sessionId - ID único da sessão
 * @param {string} userId - ID do usuário associado
 * @param {Object} sessions - Objeto contendo as sessões ativas
 * @param {Server} io - Instância do Socket.IO para comunicação
 */
export async function createSession(sessionId, userId, sessions, io) {
    console.log(`Iniciando criação de sessão para ${sessionId}`);

    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
        puppeteer: puppeteerConfig
    });

    // Configuração dos eventos do cliente
    client.on('qr', async (qr) => {
        console.log(`QR code gerado para a sessão ${sessionId}`);
        sessions[sessionId] = { ...sessions[sessionId], qr };
        io.emit(`qr-${sessionId}`, qr);
    });

    client.on('ready', async () => {
        console.log(`Cliente ${sessionId} está pronto!`);
        sessions[sessionId] = { ...sessions[sessionId], ready: true };

        try {
            await prisma.session.upsert({
                where: { sessionId },
                update: { 
                    createdAt: new Date(),
                    status: 'ACTIVE'
                },
                create: { 
                    sessionId, 
                    userId,
                    status: 'ACTIVE',
                    createdAt: new Date()
                },
            });
            io.emit(`ready-${sessionId}`);
        } catch (error) {
            console.error(`Erro ao salvar a sessão ${sessionId}:`, error);
            io.emit(`error-${sessionId}`, {
                type: 'DATABASE_ERROR',
                message: 'Erro ao salvar sessão no banco de dados'
            });
        }
    });

    client.on('message', async (message) => {
        await handleIncomingMessage(message, sessionId);
    });

    client.on('disconnected', async () => {
        console.log(`Cliente ${sessionId} desconectado`);
        await updateSessionStatus(sessionId, 'DISCONNECTED');
        
        if (sessions[sessionId]?.client) {
            await cleanupClient(sessions[sessionId].client);
        }
        
        delete sessions[sessionId];
        io.emit(`disconnected-${sessionId}`);
    });

    client.on('auth_failure', async () => {
        console.error(`Falha de autenticação na sessão ${sessionId}`);
        await updateSessionStatus(sessionId, 'AUTH_FAILURE');
        io.emit(`auth-failure-${sessionId}`);
    });

    // Inicialização do cliente
    try {
        console.log(`Tentando inicializar cliente para sessão ${sessionId}`);
        await initializeWithRetry(client);
        sessions[sessionId] = { client, qr: null, ready: false };
        console.log(`Cliente ${sessionId} inicializado com sucesso`);
    } catch (error) {
        console.error(`Erro fatal ao inicializar cliente para sessão ${sessionId}:`, error);
        
        if (sessions[sessionId]?.client) {
            await cleanupClient(sessions[sessionId].client);
        }
        
        delete sessions[sessionId];
        await updateSessionStatus(sessionId, 'ERROR', error.message);
        
        io.emit(`error-${sessionId}`, {
            type: 'INITIALIZATION_ERROR',
            message: error.message
        });
        
        throw error;
    }
}
