// src/services/sessionService.mjs
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/AppError.mjs';

const prisma = new PrismaClient();

class SessionService {
    async create(data) {
        const { userId, title, type, status } = data;
        console.log('SessionService.create called with:', { userId, title, type, status });

        try {
            const userExists = await prisma.user.findUnique({
                where: { id: Number(userId) }
            });

            if (!userExists) {
                throw new AppError('User not found', 404);
            }

            const session = await prisma.session.create({
                data: {
                    sessionId: uuidv4(),
                    title: title || `Sessão de ${new Date().toLocaleDateString('pt-BR')}`,
                    type: type || 'regular',
                    status: status || 'active',
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

            console.log('Session created:', session);
            return session;
        } catch (error) {
            console.error('Error in SessionService.create:', error);
            throw new AppError(error.message || 'Error creating session', 500);
        }
    }

    async findAll() {
        try {
            return await prisma.session.findMany({
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
        } catch (error) {
            throw new AppError('Error fetching sessions', 500);
        }
    }

    async findByUser(userId) {
        try {
            return await prisma.session.findMany({
                where: { userId: Number(userId) },
                include: {
                    messages: {
                        take: 1,
                        orderBy: { createdAt: 'desc' }
                    },
                    vendors: true,
                    seller: true
                },
                orderBy: { createdAt: 'desc' }
            });
        } catch (error) {
            throw new AppError('Error fetching user sessions', 500);
        }
    }

    async delete(id) {
        try {
            const session = await prisma.session.findUnique({
                where: { id: Number(id) }
            });

            if (!session) {
                throw new AppError('Session not found', 404);
            }

            await prisma.session.delete({
                where: { id: Number(id) }
            });
        } catch (error) {
            throw new AppError('Error deleting session', 500);
        }
    }
}

export default SessionService;