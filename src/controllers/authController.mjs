// controllers/authController.mjs
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/AppError.mjs';
import { generateToken } from '../utils/generateToken.js';
import { comparePasswords } from '../utils/hashPassword.mjs';

const prisma = new PrismaClient();

class AuthController {
  constructor() {
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // 1. Verificar se usuário existe
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          username: true,
          phoneNumber: true
        }
      });

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // 2. Verificar senha
      const isPasswordValid = await comparePasswords(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // 3. Gerar token
      const token = generateToken(user.id);

      // 4. Remover senha do objeto de resposta
      const { password: _, ...userWithoutPassword } = user;

      // 5. Criar sessão de login
      await prisma.loginSession.create({
        data: {
          userId: user.id,
          token,
          userAgent: req.headers['user-agent'] || 'unknown',
          ipAddress: req.ip
        }
      });

      res.status(200).json({
        status: 'success',
        data: {
          user: userWithoutPassword,
          token
        }
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const { token } = req;

      // Invalidar token atual
      await prisma.loginSession.update({
        where: { token },
        data: { isValid: false }
      });

      res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (err) {
      next(err);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { user } = req;
      const newToken = generateToken(user.id);

      res.status(200).json({
        status: 'success',
        data: {
          token: newToken
        }
      });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;