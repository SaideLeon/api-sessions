// Importação de módulos
import express from 'express';
import Joi from 'joi';
import qrcode from 'qrcode';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../middlewares/auth.mjs';
import { createSession } from '../utils/createSession.mjs';

const prisma = new PrismaClient();
const router = express.Router();

// Validação do schema de sessão
const sessionSchema = Joi.object({
  sessionId: Joi.string().required(),
  userId: Joi.number().integer().required(),
});

/**
 * Criar uma nova sessão para um usuário
 */
export const createNewSession = (io, sessions) =>
  router.post('/create', async (req, res) => {
    const { error } = sessionSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { sessionId, userId } = req.body;

    try {
      if (!sessionId || !userId) {
        return res.status(400).json({ error: 'sessionId e userId são obrigatórios.' });
      }

      if (sessions[sessionId]) {
        return res.status(400).json({ error: 'Sessão já existe.' });
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      // Criar sessão usando a função utilitária
      createSession(sessionId, userId, sessions, io, false);
      res.status(200).json({ message: 'Sessão criada. Aguarde o QR code.' });
    } catch (err) {
      console.error('Erro ao criar sessão:', err);
      res.status(500).json({ error: 'Erro ao criar sessão.', details: err.message });
    }
  });

/**
 * Obter todas as sessões de um usuário
 */
export const getUserSessions = router.get('/user-sessions/:userId', authenticate, async (req, res) => {
  const { userId } = req.params;

  try {
    const userIdParsed = parseInt(userId, 10);
    if (isNaN(userIdParsed)) {
      return res.status(400).json({ error: 'ID de usuário inválido.' });
    }

    const userSessions = await prisma.session.findMany({
      where: { userId: userIdParsed },
    });
    res.status(200).json(userSessions);
  } catch (error) {
    console.error('Erro ao buscar sessões:', error);
    res.status(500).json({ error: 'Erro ao buscar sessões.' });
  }
});

/**
 * Obter QR Code de uma sessão
 */
export const getQrCode = (sessions) =>
  router.get('/get-qr/:sessionId', async (req, res) => {
    const { sessionId } = req.params;

    try {
      if (!sessions[sessionId]) {
        return res.status(404).json({ error: 'Sessão não encontrada.' });
      }

      const { qr, ready } = sessions[sessionId];
      if (ready) {
        return res.status(400).json({ error: 'Sessão já conectada.' });
      }

      if (!qr) {
        return res.status(400).json({ error: 'QR Code ainda não gerado. Tente novamente.' });
      }

      const qrImage = await qrcode.toDataURL(qr);
      res.status(200).json({ qrCode: qrImage });
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      res.status(500).json({ error: 'Erro ao gerar QR Code.', details: err.message });
    }
  });
 
