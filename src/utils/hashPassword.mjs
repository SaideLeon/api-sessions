// utils/hashPassword.mjs
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
config();

const saltRounds = parseInt(process.env.BCRYPT_ROUNDS);

export const hashPassword = async (password) => {
  return bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (candidatePassword, hashedPassword) => {
  return bcrypt.compare(candidatePassword, hashedPassword);
};