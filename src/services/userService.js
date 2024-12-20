// src/services/userService.js
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { AppError } from '../utils/AppError.js';

export class UserService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(userData) {
    const { username, email, password, phoneNumber } = userData;

    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username },
          { phoneNumber }
        ]
      }
    });

    if (userExists) {
      throw new AppError('User already exists');
    }

    const hashedPassword = await hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        phoneNumber
      },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    return user;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        createdAt: true
      }
    });
  }

  async findById(id) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(id) },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  async update(id, userData) {
    const { username, email, phoneNumber } = userData;

    const user = await this.findById(id);

    const updatedUser = await this.prisma.user.update({
      where: { id: Number(id) },
      data: {
        username,
        email,
        phoneNumber
      },
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    return updatedUser;
  }

  async delete(id) {
    await this.findById(id);
    await this.prisma.user.delete({
      where: { id: Number(id) }
    });
  }
}