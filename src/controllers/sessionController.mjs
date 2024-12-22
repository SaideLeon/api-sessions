// src/controllers/sessionController.mjs
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/AppError.mjs';
import { v4 as uuidv4 } from 'uuid';

class SessionController {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(req, res, next) {
    try {
      const { userId, title, type = 'regular' } = req.body;

      // Gerar um ID único para a sessão
      const sessionId = uuidv4();

      // Verificar se o usuário existe
      const user = await this.prisma.user.findUnique({
        where: { id: Number(userId) }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Criar a sessão
      const session = await this.prisma.session.create({
        data: {
          sessionId,
          title,
          type,
          status: 'active',
          userId: Number(userId)
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });

      return res.status(201).json({
        status: 'success',
        message: 'Session created successfully',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const sessions = await this.prisma.session.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          messages: true
        }
      });

      return res.status(200).json({
        status: 'success',
        data: sessions
      });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req, res, next) {
    try {
      const { sessionId } = req.params;

      const session = await this.prisma.session.findUnique({
        where: { sessionId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          },
          messages: true
        }
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      return res.status(200).json({
        status: 'success',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { sessionId } = req.params;
      const { title, status } = req.body;

      const session = await this.prisma.session.update({
        where: { sessionId },
        data: {
          title,
          status
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true
            }
          }
        }
      });

      return res.status(200).json({
        status: 'success',
        message: 'Session updated successfully',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { sessionId } = req.params;

      await this.prisma.session.delete({
        where: { sessionId }
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

export default SessionController;

