// src/services/sessionService.js
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../utils/AppError.js';

export class SessionService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(userId) {
    const userExists = await this.prisma.user.findUnique({
      where: { id: Number(userId) }
    });

    if (!userExists) {
      throw new AppError('User not found', 404);
    }

    const session = await this.prisma.session.create({
      data: {
        sessionId: uuidv4(),
        userId: Number(userId)
      },
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    return session;
  }

  async findAll() {
    return this.prisma.session.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true
          }
        },
        messages: true,
        vendors: true,
        seller: true
      }
    });
  }

  async findByUser(userId) {
    const sessions = await this.prisma.session.findMany({
      where: { userId: Number(userId) },
      include: {
        messages: true,
        vendors: true,
        seller: true
      }
    });

    return sessions;
  }

  async delete(id) {
    const session = await this.prisma.session.findUnique({
      where: { id: Number(id) }
    });

    if (!session) {
      throw new AppError('Session not found', 404);
    }

    await this.prisma.session.delete({
      where: { id: Number(id) }
    });
  }
}