// src/middlewares/rateLimit.js
import rateLimit from 'express-rate-limit';
import { AppError } from '../utils/AppError.js';

export const limiter = rateLimit({
  max: 100, // limite de 100 requisições
  windowMs: 60 * 60 * 1000, // 1 hora
  message: 'Too many requests from this IP, please try again in an hour!',
  handler: (req, res) => {
    throw new AppError('Too many requests from this IP, please try again in an hour!', 429);
  }
});

export const authLimiter = rateLimit({
  max: 5, // limite de 5 tentativas
  windowMs: 15 * 60 * 1000, // 15 minutos
  message: 'Too many login attempts from this IP, please try again in 15 minutes!',
  handler: (req, res) => {
    throw new AppError('Too many login attempts from this IP, please try again in 15 minutes!', 429);
  }
});