// src/routes/vendorRoutes.mjs
import { Router } from 'express';
import VendorController from '../controllers/vendorController.mjs';
import { authenticate } from '../middlewares/auth.mjs';
import { validate, schemas } from '../middlewares/validate.mjs';

const router = Router();
const vendorController = new VendorController();

router
  .route('/')
  .post(
    authenticate,
    validate(schemas.vendor.create),
    vendorController.create.bind(vendorController)
  )
  .get(
    authenticate,
    vendorController.findAll.bind(vendorController)
  );

router
  .route('/:id')
  .get(
    authenticate,
    vendorController.findOne.bind(vendorController)
  )
  .put(
    authenticate,
    vendorController.update.bind(vendorController)
  )
  .delete(
    authenticate,
    vendorController.delete.bind(vendorController)
  );

export default router;