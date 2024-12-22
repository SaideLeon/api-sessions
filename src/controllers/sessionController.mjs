// src/controllers/sessionController.mjs
import SessionService from '../services/sessionService.mjs';
import { PrismaClient } from '@prisma/client';

class SessionController {
  const prismaClient = new PrismaClient();
    const newSessionService = new SessionService();

    constructor() {
      this.sessionService = newSessionService(prismaClient);
    }

    async create(req, res) {
        try {
            const { userId, title, type, status } = req.body;
            console.log('Creating session with data:', { userId, title, type, status });
            
            const session = await this.sessionService.create({
                userId,
                title,
                type,
                status
            });
            
            return res.status(201).json({
                status: 'success',
                data: session
            });
        } catch (error) {
            console.error('Session creation error:', error);
            return res.status(error.statusCode || 500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async find(req, res) {
        try {
            const sessions = await this.sessionService.findAll();
            return res.json({
                status: 'success',
                data: sessions
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async findByUser(req, res) {
        try {
            const { userId } = req.params;
            const sessions = await this.sessionService.findByUser(userId);
            return res.json({
                status: 'success',
                data: sessions
            });
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;
            await this.sessionService.delete(id);
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

export default SessionController;