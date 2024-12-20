import UserService from '../services/userService.mjs';
import AppError from '../utils/AppError.js';

class UserController {
    constructor() {
        this.userService = new UserService();
    }

    async create(req, res, next) {
        try {
            console.log('Creating user with data:', req.body);
            const user = await this.userService.create(req.body);
            return res.status(201).json({
                status: 'success',
                message: 'User created successfully',
                data: user,
            });
        } catch (err) {
            console.error('Error in UserController.create:', err.message);
            next(err);
        }
    }

    async find(req, res, next) {
        try {
            console.log('Fetching all users...');
            const users = await this.userService.findAll();
            return res.status(200).json({
                status: 'success',
                data: users
            });
        } catch (err) {
            console.error('Error in UserController.find:', err.message);
            next(err);
        }
    }

    async findOne(req, res, next) {
        try {
            const { id } = req.params;
            console.log(`Fetching user with ID: ${id}`);
            const user = await this.userService.findById(id);
            return res.status(200).json({
                status: 'success',
                data: user
            });
        } catch (err) {
            console.error('Error in UserController.findOne:', err.message);
            next(err);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            console.log(`Updating user with ID: ${id}`, req.body);
            const updatedUser = await this.userService.update(id, req.body);
            return res.status(200).json({
                status: 'success',
                message: 'User updated successfully',
                data: updatedUser
            });
        } catch (err) {
            console.error('Error in UserController.update:', err.message);
            next(err);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            console.log(`Deleting user with ID: ${id}`);
            await this.userService.delete(id);
            return res.status(204).send();
        } catch (err) {
            console.error('Error in UserController.delete:', err.message);
            next(err);
        }
    }
}

export default UserController;