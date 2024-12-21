// src/controllers/vendorController.js
import VendorService from '../services/vendorService.mjs';

class VendorController {
  constructor() {
    this.vendorService = new VendorService();
  }

  async create(req, res) {
    const vendorData = req.body;
    const vendor = await this.vendorService.create(vendorData);
    return res.status(201).json(vendor);
  }

  async findAll(req, res) {
    const vendors = await this.vendorService.findAll();
    return res.json(vendors);
  }

  async findOne(req, res) {
    const { id } = req.params;
    const vendor = await this.vendorService.findById(id);
    return res.json(vendor);
  }

  async update(req, res) {
    const { id } = req.params;
    const vendorData = req.body;
    const vendor = await this.vendorService.update(id, vendorData);
    return res.json(vendor);
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.vendorService.delete(id);
    return res.status(204).send();
  }
}
export default VendorController;