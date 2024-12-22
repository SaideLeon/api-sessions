// src/controllers/messageController.mjs
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/AppError.mjs';

class MessageController {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(req, res, next) {
    try {
      const { sessionId, sender, content, phoneNumber, mediaUrl } = req.body;

      // Verificar se a sessão existe
      const session = await this.prisma.session.findUnique({
        where: { sessionId }
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      const message = await this.prisma.message.create({
        data: {
          sessionId,
          sender,
          content,
          phoneNumber,
          mediaUrl
        },
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              status: true
            }
          }
        }
      });

      return res.status(201).json({
        status: 'success',
        message: 'Message created successfully',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { sessionId } = req.query;
      
      const whereClause = sessionId ? { sessionId } : {};

      const messages = await this.prisma.message.findMany({
        where: whereClause,
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'asc'
        }
      });

      return res.status(200).json({
        status: 'success',
        results: messages.length,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req, res, next) {
    try {
      const { id } = req.params;

      const message = await this.prisma.message.findUnique({
        where: { id: Number(id) },
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              status: true
            }
          }
        }
      });

      if (!message) {
        throw new AppError('Message not found', 404);
      }

      return res.status(200).json({
        status: 'success',
        data: message
      });
    } catch (error) {
      next(error);
    }
  }

  async getBatchMessages(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { lastMessageId, limit = 50 } = req.query;

      const whereClause = {
        sessionId,
        ...(lastMessageId && { id: { gt: parseInt(lastMessageId) } })
      };

      const messages = await this.prisma.message.findMany({
        where: whereClause,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'asc'
        },
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              status: true
            }
          }
        }
      });

      return res.status(200).json({
        status: 'success',
        results: messages.length,
        data: messages
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await this.prisma.message.delete({
        where: { id: Number(id) }
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
export default MessageController;