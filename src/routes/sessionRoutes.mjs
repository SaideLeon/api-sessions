// src/routes/sessionRoutes.mjs
import { Router } from 'express';
import SessionController from '../controllers/sessionController.mjs';
import { authenticate } from '../middlewares/auth.mjs';
import { validate, schemas } from '../middlewares/validate.mjs';

const router = Router();
const sessionController = new SessionController();

router
  .route('/')
  .post(
    authenticate,
    validate(schemas.session.create),
    sessionController.create.bind(sessionController)
  )
  .get(
    authenticate,
    sessionController.findAll.bind(sessionController)
  );

router
  .route('/:sessionId')
  .get(
    authenticate,
    sessionController.findOne.bind(sessionController)
  )
  .put(
    authenticate,
    validate(schemas.session.update),
    sessionController.update.bind(sessionController)
  )
  .delete(
    authenticate,
    sessionController.delete.bind(sessionController)
  );

export default router;