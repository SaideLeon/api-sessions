// utils/generateToken.mjs
import jwt from 'jsonwebtoken';
import env from '../config/env.mjs';

export const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
};