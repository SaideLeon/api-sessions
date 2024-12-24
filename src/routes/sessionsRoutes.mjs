
// sessionsRoutes.mjs - Atualização Completa
import express from 'express';
import Joi from 'joi';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.mjs';
import { createSession } from '../utils/createSession.mjs';
import { rateLimit } from 'express-rate-limit';

const prisma = new PrismaClient();
const router = express.Router();

// Rate limiting específico para criação de sessões
const sessionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // limite por IP
    message: 'Muitas tentativas de criar sessão. Tente novamente mais tarde.'
});

// Validação de schema
const sessionSchema = Joi.object({
    sessionId: Joi.string().required().min(3).max(50),
    userId: Joi.number().integer().required(),
});

// Middleware de validação de sessão
async function validateSession(req, res, next) {
    try {
        const session = await prisma.session.findUnique({
            where: { sessionId: req.params.sessionId }
        });

        if (!session) {
            return res.status(404).json({
                status: 'error',
                message: 'Sessão não encontrada'
            });
        }

        req.session = session;
        next();
    } catch (error) {
        next(error);
    }
}

export const createNewSession = (io, sessions) =>
    router.post('/create', sessionLimiter, async (req, res) => {
        try {
            const { error, value } = sessionSchema.validate(req.body);
            if (error) {
                return res.status(400).json({
                    status: 'error',
                    message: error.details[0].message
                });
            }

            const { sessionId, userId } = value;

            // Verifica se já existe uma sessão ativa
            const existingSession = sessions.get(sessionId);
            if (existingSession) {
                return res.status(409).json({
                    status: 'error',
                    message: 'Sessão já existe',
                    sessionStatus: existingSession.state.status
                });
            }

            // Verifica se o usuário existe
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });

            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Usuário não encontrado'
                });
            }

            // Cria a sessão
            const sessionManager = await createSession(sessionId, userId, sessions, io);
            
            res.status(201).json({
                status: 'success',
                message: 'Sessão criada com sucesso',
                sessionStatus: sessionManager.state.status
            });

        } catch (error) {
            console.error('Erro ao criar sessão:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erro interno ao criar sessão',
                error: error.message
            });
        }
    });

export const getQrCode = (sessions) =>
    router.get('/get-qr/:sessionId', validateSession, async (req, res) => {
        try {
            const sessionManager = sessions.get(req.params.sessionId);

            if (!sessionManager) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Sessão não encontrada'
                });
            }

            if (sessionManager.state.ready) {
                return res.status(200).json({
                    status: 'success',
                    message: 'Sessão já está conectada'
                });
            }

            if (sessionManager.state.status === 'INITIALIZING') {
                return res.status(202).json({
                    status: 'pending',
                    message: 'Sessão está inicializando'
                });
            }

            if (!sessionManager.state.qr) {
                return res.status(202).json({
                    status: 'pending',
                    message: 'QR Code ainda não gerado'
                });
            }

            res.status(200).json({
                status: 'success',
                qrCode: sessionManager.state.qr
            });

        } catch (error) {
            console.error('Erro ao obter QR Code:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erro ao obter QR Code',
                error: error.message
            });
        }
    });

export const getUserSessions = router.get(
    '/user-sessions/:userId',
    authenticate,
    async (req, res) => {
        try {
            const userId = parseInt(req.params.userId, 10);
            if (isNaN(userId)) {
                return res.status(400).json({
                    status: 'error',
                    message: 'ID de usuário inválido'
                });
            }

            const userSessions = await prisma.session.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' }
            });

            res.status(200).json({
                status: 'success',
                data: userSessions
            });
        } catch (error) {
            console.error('Erro ao buscar sessões:', error);
            res.status(500).json({
                status: 'error',
                message: 'Erro ao buscar sessões',
                error: error.message
            });
        }
    }
);

export default router;