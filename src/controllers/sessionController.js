// src/controllers/sessionController.js
import { SessionService } from '../services/sessionService.js';

export class SessionController {
  constructor() {
    this.sessionService = new SessionService();
  }

  async create(req, res) {
    const { userId } = req.body;
    const session = await this.sessionService.create(userId);
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

  async delete(req, res) {
    const { id } = req.params;
    await this.sessionService.delete(id);
    return res.status(204).send();
  }
}