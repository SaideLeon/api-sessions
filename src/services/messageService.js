// src/services/messageService.js
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError.js';

export class MessageService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(messageData) {
    const { sessionId, sender, content, mediaUrl, phoneNumber } = messageData;

    const sessionExists = await this.prisma.session.findUnique({
      where: { sessionId }
    });

    if (!sessionExists) {
      throw new AppError('Session not found', 404);
    }

    const message = await this.prisma.message.create({
      data: {
        sessionId,
        sender,
        content,
        mediaUrl,
        phoneNumber
      }
    });

    return message;
  }

  async findBySession(sessionId) {
    const messages = await this.prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      include: {
        session: {
          select: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    return messages;
  }

  async update(id, messageData) {
    const { content, mediaUrl } = messageData;

    const message = await this.prisma.message.findUnique({
      where: { id: Number(id) }
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: Number(id) },
      data: {
        content,
        mediaUrl
      }
    });

    return updatedMessage;
  }

  async delete(id) {
    const message = await this.prisma.message.findUnique({
      where: { id: Number(id) }
    });

    if (!message) {
      throw new AppError('Message not found', 404);
    }

    await this.prisma.message.delete({
      where: { id: Number(id) }
    });
  }
}