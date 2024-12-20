// src/routes/userRoutes.js
import { Router } from 'express';
import UserController from '../controllers/userController.mjs';

import { authenticate } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validate.js';
import { authLimiter } from '../middlewares/rateLimit.js';

const router = Router();
const userController = new UserController();

router
  .route('/')
  .post(authLimiter, validate(schemas.user.create), userController.create)
  .get(authenticate, userController.find);

router
  .route('/:id')
  .get(authenticate, userController.findOne)
  .put(authenticate, validate(schemas.user.update), userController.update)
  .delete(authenticate, userController.delete);

export default router;