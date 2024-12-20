import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { AppError } from '../utils/AppError.js';

export class UserController {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(req, res, next) {
    try {
      const { username, email, password, phoneNumber } = req.body;

      // Verificar se o usuário já existe
      const userExists = await this.prisma.user.findFirst({
        where: { OR: [{ email }, { username }, { phoneNumber }] }
      });

      if (userExists) {
        throw new AppError('User already exists', 400);
      }

      // Hash da senha
      const hashedPassword = await hash(password, 10);

      // Criar usuário
      const user = await this.prisma.user.create({
        data: { username, email, password: hashedPassword, phoneNumber },
        select: { id: true, username: true, email: true, phoneNumber: true, createdAt: true }
      });

      return res.status(201).json({ status: 'success', message: 'User created successfully', data: user });
    } catch (err) {
      next(err);
    }
  }

  async find(req, res, next) {
    try {
      const users = await this.prisma.user.findMany({
        select: { id: true, username: true, email: true, phoneNumber: true, createdAt: true }
      });
      return res.status(200).json({ status: 'success', data: users });
    } catch (err) {
      next(err);
    }
  }

  async findOne(req, res, next) {
    try {
      const { id } = req.params;
      const user = await this.prisma.user.findUnique({
        where: { id: Number(id) },
        select: { id: true, username: true, email: true, phoneNumber: true, createdAt: true }
      });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      return res.status(200).json({ status: 'success', data: user });
    } catch (err) {
      next(err);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const userData = req.body;

      // Garante que o usuário existe
      await this.prisma.user.findUnique({ where: { id: Number(id) } });

      const updatedUser = await this.prisma.user.update({
        where: { id: Number(id) },
        data: userData,
        select: { id: true, username: true, email: true, phoneNumber: true, createdAt: true }
      });

      return res.status(200).json({ status: 'success', message: 'User updated successfully', data: updatedUser });
    } catch (err) {
      next(err);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Garante que o usuário existe
      await this.prisma.user.findUnique({ where: { id: Number(id) } });

      await this.prisma.user.delete({ where: { id: Number(id) } });

      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}
