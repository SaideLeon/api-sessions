// src/middlewares/auth.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError.js';

const prisma = new PrismaClient();

export const authenticate = async (req, res, next) => {
  try {
    // 1. Pegar o token
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('Not authenticated. Please log in.', 401);
    }

    // 2. Verificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 3. Verificar se o usuário ainda existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        username: true,
        phoneNumber: true
      }
    });

    if (!user) {
      throw new AppError('User no longer exists.', 401);
    }

    // 4. Colocar o usuário na request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new AppError('Invalid token. Please log in again.', 401);
    }
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your token has expired. Please log in again.', 401);
    }
    throw error;
  }
};

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('You do not have permission to perform this action', 403);
    }
    next();
  };
};