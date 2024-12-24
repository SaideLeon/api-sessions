import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { PrismaClient } from '@prisma/client';
import qrcode from 'qrcode';
import { createLogger, format, transports } from 'winston';
import Tools from './tools.mjs';

const logger = createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp(),
        format.json()
    ),
    transports: [
        new transports.File({ filename: 'error.log', level: 'error' }),
        new transports.File({ filename: 'combined.log' })
    ]
});
const puppeteerConfig = {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security',
        '--no-first-run',
        '--no-zygote',
        '--single-process'
    ],
    headless: true,
    defaultViewport: null, // Remove configurações específicas de viewport
    timeout: 60000
};



const tools = new Tools();
const prisma = new PrismaClient();

/**
 * Cria e gerencia uma sessão do WhatsApp
 * @param {string} sessionId - ID único da sessão.
 * @param {string} userId - ID do usuário associado.
 * @param {Map} sessions - Objeto contendo as sessões ativas.
 * @param {Server} io - Instância do Socket.IO para comunicação em tempo real.
 */
export async function createSession(sessionId, userId, sessions, io) {
    if (sessions.has(sessionId)) {
        console.log(`Sessão ${sessionId} já está ativa.`);
        return sessions.get(sessionId);
    }

    console.log(`Iniciando nova sessão para ${sessionId}`);
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
      
         puppeteer: puppeteerConfig,
            qrMaxRetries: 5,
            restartOnAuthFail: true
    });

    // Estado inicial da sessão
   
    /**
     * Sincroniza o estado da sessão com o banco de dados.
     */
    async function syncSessionState(state) {
        try {
            await prisma.session.upsert({
                where: { sessionId },
                update: { ...state, updatedAt: new Date() },
                create: { sessionId, userId, ...state, createdAt: new Date() },
            });
        } catch (error) {
            console.error(`Erro ao sincronizar estado da sessão ${sessionId}:`, error);
        }
    }

    // Evento: QR Code gerado
    client.on('qr', async (qr) => {
        console.log(`QR Code gerado para a sessão ${sessionId}`);
        const qrCodeImage = await qrcode.toDataURL(qr);
        sessionState.qr = qrCodeImage;
        sessionState.status = 'WAITING_QR';
        await syncSessionState(sessionState);
        io.emit(`qr-${sessionId}`, qrCodeImage);
    });

    // Evento: Cliente pronto
    client.on('ready', async () => {
        console.log(`Cliente ${sessionId} está pronto.`);
        sessionState.ready = true;
        sessionState.qr = null;
        sessionState.status = 'CONNECTED';
        await syncSessionState(sessionState);
        io.emit(`ready-${sessionId}`);
    });

    // Evento: Cliente autenticado
    client.on('authenticated', async () => {
        console.log(`Sessão ${sessionId} autenticada.`);
        sessionState.status = 'AUTHENTICATED';
        await syncSessionState(sessionState);
        io.emit(`authenticated-${sessionId}`);
    });

    // Evento: Falha de autenticação
    client.on('auth_failure', async (error) => {
        console.error(`Falha de autenticação na sessão ${sessionId}:`, error.message);
        sessionState.status = 'AUTH_FAILURE';
        sessionState.error = error.message;
        await syncSessionState(sessionState);
        io.emit(`auth-failure-${sessionId}`, { error: error.message });
    });

    // Evento: Mensagem recebida
    client.on('message', async (message) => {
        if (message.fromMe || message.from.includes('status')) return;

        try {
            let resposta;

            if (message.hasMedia) {
                const mediaData = await tools.baixarMidia(message);
                resposta = mediaData
                    ? await tools.processarMedia(message.from, mediaData, sessionId)
                    : 'Não consegui baixar a mídia.';
            } else {
                resposta = await tools.processarTexto(message.from, message.body, sessionId);
            }

            if (resposta) {
                await message.reply(resposta.replace(/\*\*/g, '*'));
            }
        } catch (error) {
            console.error(`Erro ao processar mensagem para o usuário ${message.from}:`, error);
        }
    });

    // Evento: Cliente desconectado
    client.on('disconnected', async (reason) => {
        console.log(`Sessão ${sessionId} desconectada. Motivo: ${reason}`);
        sessionState.ready = false;
        sessionState.qr = null;
        sessionState.status = 'DISCONNECTED';
        await syncSessionState(sessionState);
        sessions.delete(sessionId);
        io.emit(`disconnected-${sessionId}`, { reason });
    });

    // Inicialização do cliente
    try {
        await client.initialize();
        sessionState.status = 'INITIALIZED';
        await syncSessionState(sessionState);
    } catch (error) {
        console.error(`Erro ao inicializar a sessão ${sessionId}:`, error);
        sessionState.status = 'ERROR';
        sessionState.error = error.message;
        await syncSessionState(sessionState);
        sessions.delete(sessionId);
    }
}

