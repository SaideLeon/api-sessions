// utils/hashPassword.mjs
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
config();
// Obtendo o número de rounds do ambiente ou usando um valor padrão
const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;



export const hashPassword = async (password) => {
  return bcrypt.hash(password, saltRounds
  );
};