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
    ],
    headless: true
};



const tools = new Tools();
const prisma = new PrismaClient();

export async function createSession(sessionId, userId, sessions, io) {
    if (sessions.has(sessionId)) {
        console.log(`Sessão ${sessionId} já está ativa.`);
        return sessions.get(sessionId);
    }

    console.log(`Iniciando nova sessão para ${sessionId}`);
    const client = new Client({
        authStrategy: new LocalAuth({ clientId: sessionId }),
      
         puppeteer: puppeteerConfig,
            qrMaxRetries: 25,
    });


    // Evento: QR Code gerado
    client.on('qr', async (qr) => {
        console.log(`QR Code gerado para a sessão ${sessionId}`);
        const qrCodeImage = await qrcode.toDataURL(qr);
        
        io.emit(`qr-${sessionId}`, qrCodeImage);
    });

    // Evento: Cliente pronto
    client.on('ready', async () => {
        console.log(`Cliente ${sessionId} está pronto.`);
        io.emit(`ready-${sessionId}`);
    });

    // Evento: Cliente autenticado
    client.on('authenticated', async () => {
        console.log(`Sessão ${sessionId} autenticada.`);
        io.emit(`authenticated-${sessionId}`);
    });

    // Evento: Falha de autenticação
    client.on('auth_failure', async (error) => {
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
        
        io.emit(`disconnected-${sessionId}`, { reason });
    });

}

