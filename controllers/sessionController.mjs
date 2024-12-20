import SessionService from '../services/sessionService.js';

class SessionController {
    constructor() {
        this.sessionService = new SessionService();
    }

    async create(req, res, next) {
        try {
            const { userId } = req.body;
            const session = await this.sessionService.create(userId);
            return res.status(201).json({
                status: 'success',
                data: session
            });
        } catch (err) {
            next(err);
        }
    }

    async find(req, res, next) {
        try {
            const sessions = await this.sessionService.findAll();
            return res.status(200).json({
                status: 'success',
                data: sessions
            });
        } catch (err) {
            next(err);
        }
    }

    async findByUser(req, res, next) {
        try {
            const { userId } = req.params;
            const sessions = await this.sessionService.findByUser(userId);
            return res.status(200).json({
                status: 'success',
                data: sessions
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.sessionService.delete(id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

export default SessionController;