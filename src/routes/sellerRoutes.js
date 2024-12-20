// src/routes/sellerRoutes.js
import { Router } from 'express';
import { SellerController } from '../controllers/sellerController.js';
import { authenticate } from '../middlewares/auth.mjs';
import { validate, schemas } from '../middlewares/validate.mjs';

const router = Router();
const sellerController = new SellerController();

router
  .route('/')
  .post(authenticate, validate(schemas.seller.create), sellerController.create)
  .get(authenticate, sellerController.findAll);

router
  .route('/:id')
  .get(authenticate, sellerController.findOne)
  .put(authenticate, sellerController.update)
  .delete(authenticate, sellerController.delete);

export default router;