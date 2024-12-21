// src/routes/messageRoutes.js
import { Router } from 'express';
import MessageController from '../controllers/messageController.mjs';
import { authenticate } from '../middlewares/auth.mjs';
import { validate, schemas } from '../middlewares/validate.mjs';

const router = Router();
const messageController = new MessageController();

router
  .route('/')
  .post(authenticate, validate(schemas.message.create), messageController.create);

router.get('/session/:sessionId', authenticate, messageController.findBySession);

router
  .route('/:id')
  .put(authenticate, messageController.update)
  .delete(authenticate, messageController.delete);

export default router;