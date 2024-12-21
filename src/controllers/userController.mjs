// src/controllers/userController.mjs
import UserService from '../services/userService.mjs';
import AppError from '../utils/AppError.mjs';

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async create(req, res, next) {
    try {
      const user = await this.userService.create(req.body);
      return res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async find(req, res, next) {
    try {
      const users = await this.userService.findAll();
      return res.status(200).json({
        status: 'success',
        data: users,
      });
    } catch (err) {
      next(err);
    }
  }

  async findOne(req, res, next) {
    try {
      const { id } = req.params;
      const user = await this.userService.findById(id);
      return res.status(200).json({
        status: 'success',
        data: user,
      });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updatedUser = await this.userService.update(id, req.body);
      return res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: updatedUser,
      });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      await this.userService.delete(id);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export default UserController;
