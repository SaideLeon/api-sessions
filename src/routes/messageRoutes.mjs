// src/routes/messageRoutes.mjs
import { Router } from 'express';
import MessageController from '../controllers/messageController.mjs';
import { authenticate } from '../middlewares/auth.mjs';
import { validate, schemas } from '../middlewares/validate.mjs';

const router = Router();
const messageController = new MessageController();

router
  .route('/')
  .post(
    authenticate,
    validate(schemas.message.create),
    messageController.create.bind(messageController)
  )
  .get(
    authenticate,
    messageController.findAll.bind(messageController)
  );

router
  .route('/:id')
  .get(
    authenticate,
    messageController.findOne.bind(messageController)
  )
  .delete(
    authenticate,
    messageController.delete.bind(messageController)
  );

// Rota para buscar mensagens em lote de uma sessão específica
router.get(
  '/batch/:sessionId',
  authenticate,
  messageController.getBatchMessages.bind(messageController)
);

export default router;