// src/routes/vendorRoutes.js
import { Router } from 'express';
import VendorController from '../controllers/vendorController.mjs';
import { authenticate } from '../middlewares/auth.js';
import { validate, schemas } from '../middlewares/validate.js';

const router = Router();
const vendorController = new VendorController();

router
  .route('/')
  .post(authenticate, validate(schemas.vendor.create), vendorController.create)
  .get(authenticate, vendorController.findAll);

router
  .route('/:id')
  .get(authenticate, vendorController.findOne)
  .put(authenticate, vendorController.update)
  .delete(authenticate, vendorController.delete);

export default router;