// src/routes/userRoutes.mjs

import { Router } from 'express';
import UserController from '../controllers/userController.mjs';
import { validate, schemas } from '../middlewares/validate.js';
import { authenticate } from '../middlewares/auth.js';
import { authLimiter } from '../middlewares/rateLimit.js';

const router = Router();
const userController = new UserController();

// Rota para criar e listar usuários
router
  .route('/')
  .post(
    authLimiter, // Limita tentativas de requisições (proteção contra brute force)
    validate(schemas.user.create), // Valida o corpo da requisição
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
    validate(schemas.user.update), // Valida o corpo da requisição para atualização
    userController.update // Chama o método de atualização no controlador
  )
  .delete(
    authenticate, // Requer autenticação
    userController.delete // Chama o método de exclusão no controlador
  );

export default router;
