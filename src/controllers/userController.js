// src/controllers/userController.js
import { UserService } from '../services/userService.js';

export class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async create(req, res) {
    const userData = req.body;
    const user = await this.userService.create(userData);
    return res.status(201).json(user);
  }

  async find(req, res) {
    const users = await this.userService.findAll();
    return res.json(users);
  }

  async findOne(req, res) {
    const { id } = req.params;
    const user = await this.userService.findById(id);
    return res.json(user);
  }

  async update(req, res) {
    const { id } = req.params;
    const userData = req.body;
    const user = await this.userService.update(id, userData);
    return res.json(user);
  }

  async delete(req, res) {
    const { id } = req.params;
    await this.userService.delete(id);
    return res.status(204).send();
  }
}