// routes/authRoutes.mjs
import { Router } from 'express';
import AuthController from '../controllers/authController.mjs';
import { validate, schemas } from '../middlewares/validate.mjs';
import { authenticate } from '../middlewares/auth.mjs';
import { authLimiter } from '../middlewares/rateLimit.mjs';

const router = Router();
const authController = new AuthController();

router.post(
  '/login',
  authLimiter,
  validate(schemas.auth.login),
  authController.login
);

router.post(
  '/logout',
  authenticate,
  authController.logout
);

router.post(
  '/refresh-token',
  authenticate,
  authController.refreshToken
);

export default router;
