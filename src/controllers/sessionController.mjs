// src/controllers/sessionController.mjs
import SessionService from '../services/sessionService.mjs';

class SessionController {
    constructor() {
        this.sessionService = new SessionService();
    }

    async create(req, res) {
        const { userId, title } = req.body;
        const session = await this.sessionService.create(userId, title);
        return res.status(201).json(session);
    }

    async find(req, res) {
        const sessions = await this.sessionService.findAll();
        return res.json(sessions);
    }

    async findByUser(req, res) {
        const { userId } = req.params;
        const sessions = await this.sessionService.findByUser(userId);
        return res.json(sessions);
    }

    async update(req, res) {
        const { id } = req.params;
        const { title } = req.body;
        const session = await this.sessionService.update(id, { title });
        return res.json(session);
    }

    async delete(req, res) {
        const { id } = req.params;
        await this.sessionService.delete(id);
        return res.status(204).send();
    }
}

export default SessionController;