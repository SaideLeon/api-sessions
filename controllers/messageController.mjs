import MessageService from '../services/messageService.js';

class MessageController {
    constructor() {
        this.messageService = new MessageService();
    }

    async create(req, res, next) {
        try {
            const message = await this.messageService.create(req.body);
            return res.status(201).json({
                status: 'success',
                data: message
            });
        } catch (err) {
            next(err);
        }
    }

    async findBySession(req, res, next) {
        try {
            const { sessionId } = req.params;
            const messages = await this.messageService.findBySession(sessionId);
            return res.status(200).json({
                status: 'success',
                data: messages
            });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const message = await this.messageService.update(id, req.body);
            return res.status(200).json({
                status: 'success',
                data: message
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.messageService.delete(id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

export default MessageController;