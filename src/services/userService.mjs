import prisma from '@prisma/client';
import bcrypt from 'bcrypt';
import AppError from '../utils/AppError.mjs';

import { PrismaClient } from '@prisma/client';

class UserService {
    constructor() {
        this.prisma = new PrismaClient();
    }

    async create(userData) {
        const { username, email, password, phoneNumber } = userData;

        console.log('Validating user data...');
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
        const hashedPassword = await bcrypt.hash(password, 10);

        console.log('Creating user in the database...');
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

    async update(id, userData) {
        console.log(`Updating user with ID: ${id}`);
        await this.findById(id);

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

    async delete(id) {
        console.log(`Deleting user with ID: ${id}`);
        await this.findById(id);

        await this.prisma.user.delete({
            where: { id: Number(id) }
        });

        console.log('User deleted successfully.');
    }
}

export default UserService;