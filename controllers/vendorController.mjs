import VendorService from '../services/vendorService.js';

class VendorController {
    constructor() {
        this.vendorService = new VendorService();
    }

    async create(req, res, next) {
        try {
            const vendor = await this.vendorService.create(req.body);
            return res.status(201).json({
                status: 'success',
                data: vendor
            });
        } catch (err) {
            next(err);
        }
    }

    async findAll(req, res, next) {
        try {
            const vendors = await this.vendorService.findAll();
            return res.status(200).json({
                status: 'success',
                data: vendors
            });
        } catch (err) {
            next(err);
        }
    }

    async findOne(req, res, next) {
        try {
            const { id } = req.params;
            const vendor = await this.vendorService.findById(id);
            return res.status(200).json({
                status: 'success',
                data: vendor
            });
        } catch (err) {
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const vendor = await this.vendorService.update(id, req.body);
            return res.status(200).json({
                status: 'success',
                data: vendor
            });
        } catch (err) {
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            await this.vendorService.delete(id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

export default VendorController;