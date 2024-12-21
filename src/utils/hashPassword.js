// utils/hashPassword.mjs
import bcrypt from 'bcrypt';
import env from '../config/env.mjs';

export const hashPassword = async (password) => {
  return bcrypt.hash(password, Number(env.BCRYPT_ROUNDS));
};