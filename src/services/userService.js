// src/services/userService.js
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
import { AppError } from '../utils/AppError.js';

export class UserService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Cria um novo usuário no banco de dados.
   * @param {Object} userData - Dados do usuário.
   * @returns {Object} - Usuário criado.
   */
  async create(userData) {
    const { username, email, password, phoneNumber } = userData;

    console.log('Validating user data...');
    // Verificar se o usuário já existe com o mesmo email, username ou telefone
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
      console.error('User already exists:', userExists);
      throw new AppError('User already exists', 400);
    }

    console.log('Hashing password...');
    // Criptografar a senha
    const hashedPassword = await hash(password, 10);

    console.log('Creating user in the database...');
    // Criar o usuário
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

    console.log('User created successfully:', user);
    return user;
  }

  /**
   * Retorna todos os usuários.
   * @returns {Array} - Lista de usuários.
   */
  async findAll() {
    console.log('Fetching all users...');
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

  /**
   * Busca um usuário por ID.
   * @param {number} id - ID do usuário.
   * @returns {Object} - Dados do usuário.
   */
  async findById(id) {
    console.log(`Fetching user with ID: ${id}`);
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
      console.error('User not found:', id);
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Atualiza os dados de um usuário.
   * @param {number} id - ID do usuário.
   * @param {Object} userData - Novos dados do usuário.
   * @returns {Object} - Usuário atualizado.
   */
  async update(id, userData) {
    console.log(`Updating user with ID: ${id}`);
    await this.findById(id); // Garante que o usuário existe

    const updatedUser = await this.prisma.user.update({
      where: { id: Number(id) },
      data: userData,
      select: {
        id: true,
        username: true,
        email: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    console.log('User updated successfully:', updatedUser);
    return updatedUser;
  }

  /**
   * Exclui um usuário.
   * @param {number} id - ID do usuário.
   */
  async delete(id) {
    console.log(`Deleting user with ID: ${id}`);
    await this.findById(id); // Garante que o usuário existe

    await this.prisma.user.delete({
      where: { id: Number(id) }
    });

    console.log('User deleted successfully.');
  }
}
