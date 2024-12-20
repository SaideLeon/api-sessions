// src/routes/sessionRoutes.js
import { Router } from 'express';
import { SessionController } from '../controllers/sessionController.js';
import { authenticate } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validate.js';

const router = Router();
const sessionController = new SessionController();

router
  .route('/')
  .post(authenticate, validate(schemas.session.create), sessionController.create)
  .get(authenticate, sessionController.find);

router.get('/user/:userId', authenticate, sessionController.findByUser);

router.delete('/:id', authenticate, sessionController.delete);

export default router;