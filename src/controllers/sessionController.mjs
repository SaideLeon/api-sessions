// src/controllers/sessionController.mjs
import SessionService from '../services/sessionService.mjs';

class SessionController {
    constructor() {
        this.sessionService = new SessionService();
        console.log('SessionController initialized');
    }

    async create(req, res) {
        try {
            console.log(`Request to create session: ${JSON.stringify(req.body)}`);
            const { userId, title } = req.body;
            const session = await this.sessionService.create(userId, title);
            console.log(`Session created successfully: ${JSON.stringify(session)}`);
            return res.status(201).json(session);
        } catch (error) {
            console.error(`Error creating session: ${error.message}`);
            return res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async find(req, res) {
        try {
            console.log('Request to fetch all sessions');
            const sessions = await this.sessionService.findAll();
            console.log(`Sessions fetched: ${sessions.length}`);
            return res.json(sessions);
        } catch (error) {
            console.error(`Error fetching sessions: ${error.message}`);
            return res.status(500).json({ message: error.message });
        }
    }

    async findByUser(req, res) {
        try {
            console.log(`Request to fetch sessions for user: ${req.params.userId}`);
            const { userId } = req.params;
            const sessions = await this.sessionService.findByUser(userId);
            console.log(`Sessions fetched for user ${userId}: ${sessions.length}`);
            return res.json(sessions);
        } catch (error) {
            console.error(`Error fetching sessions for user: ${error.message}`);
            return res.status(500).json({ message: error.message });
        }
    }

    async update(req, res) {
        try {
            console.log(`Request to update session: ${JSON.stringify(req.body)}, id: ${req.params.id}`);
            const { id } = req.params;
            const { title } = req.body;
            const session = await this.sessionService.update(id, { title });
            console.log(`Session updated successfully: ${JSON.stringify(session)}`);
            return res.json(session);
        } catch (error) {
            console.error(`Error updating session: ${error.message}`);
            return res.status(error.statusCode || 500).json({ message: error.message });
        }
    }

    async delete(req, res) {
        try {
            console.log(`Request to delete session with id: ${req.params.id}`);
            const { id } = req.params;
            await this.sessionService.delete(id);
            console.log(`Session with id ${id} deleted successfully`);
            return res.status(204).send();
        } catch (error) {
            console.error(`Error deleting session: ${error.message}`);
            return res.status(error.statusCode || 500).json({ message: error.message });
        }
    }
}

export default SessionController;
