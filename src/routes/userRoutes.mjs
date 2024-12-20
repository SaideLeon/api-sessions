// src/routes/userRoutes.mjs

import { Router } from 'express';
import UserController from '../controllers/userController.mjs';
import { authenticate } from '../middlewares/auth.mjs';
import { authLimiter } from '../middlewares/rateLimit.mjs';

const router = Router();
const userController = new UserController();

// Rota para criar e listar usuários
router
  .route('/')
  .post(
    authLimiter, // Limita tentativas de requisições (proteção contra brute force)
    userController.create // Chama o método de criação no controlador
  )
  .get(
    authenticate, // Requer autenticação
    userController.find // Chama o método de busca de todos os usuários
  );

// Rota para operações específicas por ID de usuário
router
  .route('/:id')
  .get(
    authenticate, // Requer autenticação
    userController.findOne // Chama o método para buscar um usuário específico
  )
  .put(
    authenticate, // Requer autenticação
    userController.update // Chama o método de atualização no controlador
  )
  .delete(
    authenticate, // Requer autenticação
    userController.delete // Chama o método de exclusão no controlador
  );

export default router;
