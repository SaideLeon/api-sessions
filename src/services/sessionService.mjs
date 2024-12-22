import prisma from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/AppError.mjs';

const { PrismaClient } = prisma;

class SessionService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(userId, title = null) {
        const userExists = await this.prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (!userExists) {
            throw new AppError('User not found', 404);
        }

        // Se não for fornecido um título, cria um padrão com data
        const defaultTitle = title || `Sessão de ${new Date().toLocaleDateString('pt-BR')}`;

        const session = await this.prisma.session.create({
            data: {
                sessionId: uuidv4(),
                title: defaultTitle,
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
                messages: {
                    take: 1,
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                vendors: true,
                seller: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return sessions;
    }

    async update(id, data) {
        const session = await this.prisma.session.findUnique({
            where: { id: Number(id) }
        });

        if (!session) {
            throw new AppError('Session not found', 404);
        }

        const updatedSession = await this.prisma.session.update({
            where: { id: Number(id) },
            data: {
                title: data.title
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

        return updatedSession;
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

export default SessionService;