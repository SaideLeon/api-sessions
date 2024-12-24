// createSession.mjs - Atualização Completa
import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import { PrismaClient } from '@prisma/client';
import qrcode from 'qrcode';
import { createLogger, format, transports } from 'winston';

const prisma = new PrismaClient();
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

// Configuração otimizada do Puppeteer para iOS e outros dispositivos
const puppeteerConfig = {
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-accelerated-2d-canvas',
        '--disable-web-security',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--force-mobile',
        '--disable-features=IsolateOrigins,site-per-process'
    ],
    headless: true,
    platform: process.platform,
    defaultViewport: {
        width: 375,
        height: 812,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3
    },
    timeout: 60000,
    userDataDir: './whatsapp-sessions'
};

class SessionManager {
    constructor(sessionId, userId) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.state = {
            status: 'INITIALIZING',
            qr: null,
            ready: false,
            error: null,
            retryCount: 0,
            lastActivity: Date.now()
        };
        this.client = null;
    }

    updateState(newState) {
        this.state = {
            ...this.state,
            ...newState,
            lastActivity: Date.now()
        };
        return this.state;
    }

    async cleanup() {
        try {
            if (this.client) {
                await this.client.destroy();
                this.client = null;
            }
            this.updateState({
                status: 'DISCONNECTED',
                ready: false,
                qr: null
            });
        } catch (error) {
            logger.error(`Erro ao limpar sessão ${this.sessionId}:`, error);
        }
    }
}

async function initializeWithRetry(sessionManager, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await sessionManager.client.initialize();
            return true;
        } catch (error) {
            logger.error(`Tentativa ${i + 1}/${maxRetries} falhou para sessão ${sessionManager.sessionId}:`, error);
            
            if (i === maxRetries - 1) {
                throw error;
            }
            
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    return false;
}

async function syncSessionState(sessionManager) {
    try {
        await prisma.session.upsert({
            where: { sessionId: sessionManager.sessionId },
            update: {
                status: sessionManager.state.status,
                lastActivity: new Date(sessionManager.state.lastActivity),
                errorMessage: sessionManager.state.error,
                updatedAt: new Date()
            },
            create: {
                sessionId: sessionManager.sessionId,
                userId: sessionManager.userId,
                status: sessionManager.state.status,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        });
    } catch (error) {
        logger.error(`Erro ao sincronizar estado da sessão ${sessionManager.sessionId}:`, error);
    }
}

export async function createSession(sessionId, userId, sessions, io) {
    logger.info(`Iniciando criação de sessão para ${sessionId}`);

    const sessionManager = new SessionManager(sessionId, userId);
    sessions.set(sessionId, sessionManager);

    try {
        const client = new Client({
            authStrategy: new LocalAuth({ 
                clientId: sessionId,
                dataPath: './whatsapp-sessions'
            }),
            puppeteer: puppeteerConfig,
            qrMaxRetries: 5,
            restartOnAuthFail: true
        });

        sessionManager.client = client;

        client.on('qr', async (qr) => {
            try {
                const qrImage = await qrcode.toDataURL(qr);
                sessionManager.updateState({
                    status: 'WAITING_QR',
                    qr: qrImage
                });
                await syncSessionState(sessionManager);
                io.emit(`qr-${sessionId}`, qrImage);
            } catch (error) {
                logger.error(`Erro ao processar QR code para ${sessionId}:`, error);
            }
        });

        client.on('ready', async () => {
            sessionManager.updateState({
                status: 'CONNECTED',
                ready: true,
                qr: null
            });
            await syncSessionState(sessionManager);
            io.emit(`ready-${sessionId}`);
        });

        client.on('authenticated', async () => {
            sessionManager.updateState({
                status: 'AUTHENTICATED',
                qr: null
            });
            await syncSessionState(sessionManager);
            io.emit(`authenticated-${sessionId}`);
        });

        client.on('auth_failure', async (error) => {
            sessionManager.updateState({
                status: 'AUTH_FAILURE',
                error: error.message
            });
            await syncSessionState(sessionManager);
            io.emit(`auth-failure-${sessionId}`, { error: error.message });
        });

        client.on('disconnected', async (reason) => {
            await sessionManager.cleanup();
            await syncSessionState(sessionManager);
            io.emit(`disconnected-${sessionId}`, { reason });
        });

        await initializeWithRetry(sessionManager);
        return sessionManager;

    } catch (error) {
        logger.error(`Erro fatal ao criar sessão ${sessionId}:`, error);
        sessions.delete(sessionId);
        throw error;
    }
}