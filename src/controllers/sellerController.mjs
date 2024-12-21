// src/controllers/sellerController.js
import SellerService from '../services/sellerService.mjs';

class SellerController {
  constructor() {
    this.sellerService = new SellerService();
  }

  async create(req, res) {
    const sellerData = req.body;
    const seller = await this.sellerService.create(sellerData);
    return res.status(201).json(seller);
  }

  async findAll(req, res) {
    const { sessionId } = req.query;
    const sellers = await this.sellerService.findAll(sessionId);
    return res.json(sellers);
  }

  async findOne(req, res) {
    const { id } = req.params;
    const seller = await this.sellerService.findById(id);
    return res.json(seller);
  }

  async update(req, res) {
    const { id } = req.params;
    const sellerData = req.body;
    const seller = await this.sellerService.update(id, sellerData);
    return res.json(seller);
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.sellerService.delete(id);
    return res.status(204).send();
  }
}
export default SellerController;