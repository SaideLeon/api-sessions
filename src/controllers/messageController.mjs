// src/controllers/messageController.js
import MessageService from '../services/messageService.mjs';

class MessageController {
  constructor() {
    this.messageService = new MessageService();
  }

  async create(req, res) {
    const messageData = req.body;
    const message = await this.messageService.create(messageData);
    return res.status(201).json(message);
  }

  async findBySession(req, res) {
    const { sessionId } = req.params;
    const messages = await this.messageService.findBySession(sessionId);
    return res.json(messages);
  }

  async update(req, res) {
    const { id } = req.params;
    const messageData = req.body;
    const message = await this.messageService.update(id, messageData);
    return res.json(message);
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.messageService.delete(id);
    return res.status(204).send();
  }
}
export default MessageController;