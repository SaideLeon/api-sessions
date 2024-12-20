import SellerService from '../services/sellerService.js';

class SellerController {
    constructor() {
        this.sellerService = new SellerService();
    }

    async create(req, res, next) {
        try {
            const seller = await this.sellerService.create(req.body);
            return res.status(201).json({
                status: 'success',
                data: seller
            });
        } catch (err) {
            next(err);
        }
    }

    async findAll(req, res, next) {
        try {
            const { sessionId } = req.query;
            const sellers = await this.sellerService.findAll(sessionId);
            return res.status(200).json({
                status: 'success',
                data: sellers
            });
        } catch (err) {
            next(err);
        }
    }

    async findOne(req, res, next) {
        try {
            const { id } = req.params;
            const seller = await this.sellerService.findById(id);
            return res.status(200).json({
                status: 'success',
                data: seller
            });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const seller = await this.sellerService.update(id, req.body);
            return res.status(200).json({
                status: 'success',
                data: seller
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.sellerService.delete(id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

export default SellerController;