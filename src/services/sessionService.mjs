// src/services/sessionService.mjs
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import AppError from '../utils/AppError.mjs';

class SessionService {
    constructor() {
        this.prisma = new PrismaClient();
        console.log('SessionService initialized with Prisma client');
    }

    async create(userId, title = null) {
        console.log(`Attempting to create session for userId: ${userId}, title: ${title}`);

        try {
            const userExists = await this.prisma.user.findUnique({
                where: { id: Number(userId) }
            });

            if (!userExists) {
                console.error(`User not found for userId: ${userId}`);
                throw new AppError('User not found', 404);
            }

            const defaultTitle = title || `Sessão de ${new Date().toLocaleDateString('pt-BR')}`;
            console.log(`Default title generated: ${defaultTitle}`);

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

            console.log(`Session created successfully: ${JSON.stringify(session)}`);
            return session;
        } catch (error) {
            console.error('Error in session creation:', error);
            throw new AppError(error.message || 'Error creating session', 500);
        }
    }

    async findAll() {
        console.log('Fetching all sessions...');
        const sessions = await this.prisma.session.findMany({
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
        console.log(`Total sessions fetched: ${sessions.length}`);
        return sessions;
    }

    async findByUser(userId) {
        console.log(`Fetching sessions for userId: ${userId}`);

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

        console.log(`Total sessions fetched for userId ${userId}: ${sessions.length}`);
        return sessions;
    }

    async update(id, data) {
        console.log(`Attempting to update session with id: ${id}, data: ${JSON.stringify(data)}`);

        const session = await this.prisma.session.findUnique({
            where: { id: Number(id) }
        });

        if (!session) {
            console.error(`Session not found for id: ${id}`);
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

        console.log(`Session updated successfully: ${JSON.stringify(updatedSession)}`);
        return updatedSession;
    }

    async delete(id) {
        console.log(`Attempting to delete session with id: ${id}`);

        const session = await this.prisma.session.findUnique({
            where: { id: Number(id) }
        });

        if (!session) {
            console.error(`Session not found for id: ${id}`);
            throw new AppError('Session not found', 404);
        }

        await this.prisma.session.delete({
            where: { id: Number(id) }
        });

        console.log(`Session with id: ${id} deleted successfully`);
    }
}

export default SessionService;