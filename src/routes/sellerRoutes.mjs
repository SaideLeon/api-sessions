// src/routes/sellerRoutes.mjs
import { Router } from 'express';
import SellerController from '../controllers/sellerController.mjs';
import { authenticate } from '../middlewares/auth.mjs';
import { validate, schemas } from '../middlewares/validate.mjs';

const router = Router();
const sellerController = new SellerController();

router
  .route('/')
  .post(
    authenticate,
    validate(schemas.seller.create),
    sellerController.create.bind(sellerController)
  )
  .get(
    authenticate,
    sellerController.findAll.bind(sellerController)
  );

router
  .route('/:id')
  .get(
    authenticate,
    sellerController.findOne.bind(sellerController)
  )
  .put(
    authenticate,
    sellerController.update.bind(sellerController)
  )
  .delete(
    authenticate,
    sellerController.delete.bind(sellerController)
  );

// Rota adicional para buscar vendedores por sessão
router.get(
  '/session/:sessionId',
  authenticate,
  sellerController.findBySession.bind(sellerController)
);

export default router;