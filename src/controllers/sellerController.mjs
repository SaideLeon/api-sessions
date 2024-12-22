// src/controllers/sellerController.mjs
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/AppError.mjs';

class SellerController {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(req, res, next) {
    try {
      const { sessionId, sellerName, product, description, benefits, image } = req.body;

      // Verificar se a sessão existe
      const session = await this.prisma.session.findUnique({
        where: { sessionId }
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      // Verificar se já existe um vendedor com o mesmo nome na sessão
      const existingSeller = await this.prisma.seller.findUnique({
        where: {
          sessionId_sellerName: {
            sessionId,
            sellerName
          }
        }
      });

      if (existingSeller) {
        throw new AppError('Seller already exists in this session', 400);
      }

      // Criar o vendedor
      const seller = await this.prisma.seller.create({
        data: {
          sessionId,
          sellerName,
          product,
          description,
          benefits,
          image
        },
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              type: true,
              status: true
            }
          }
        }
      });

      return res.status(201).json({
        status: 'success',
        message: 'Seller created successfully',
        data: seller
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const { sessionId } = req.query;
      
      let whereClause = {};
      if (sessionId) {
        whereClause.sessionId = sessionId;
      }

      const sellers = await this.prisma.seller.findMany({
        where: whereClause,
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              type: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({
        status: 'success',
        results: sellers.length,
        data: sellers
      });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req, res, next) {
    try {
      const { id } = req.params;

      const seller = await this.prisma.seller.findUnique({
        where: { id: Number(id) },
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              type: true,
              status: true
            }
          }
        }
      });

      if (!seller) {
        throw new AppError('Seller not found', 404);
      }

      return res.status(200).json({
        status: 'success',
        data: seller
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Verificar se o vendedor existe
      const existingSeller = await this.prisma.seller.findUnique({
        where: { id: Number(id) }
      });

      if (!existingSeller) {
        throw new AppError('Seller not found', 404);
      }

      // Atualizar o vendedor
      const seller = await this.prisma.seller.update({
        where: { id: Number(id) },
        data: updateData,
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              type: true,
              status: true
            }
          }
        }
      });

      return res.status(200).json({
        status: 'success',
        message: 'Seller updated successfully',
        data: seller
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      // Verificar se o vendedor existe
      const seller = await this.prisma.seller.findUnique({
        where: { id: Number(id) }
      });

      if (!seller) {
        throw new AppError('Seller not found', 404);
      }

      // Deletar o vendedor
      await this.prisma.seller.delete({
        where: { id: Number(id) }
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // Método adicional para buscar vendedores por sessão
  async findBySession(req, res, next) {
    try {
      const { sessionId } = req.params;

      // Verificar se a sessão existe
      const session = await this.prisma.session.findUnique({
        where: { sessionId }
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      const sellers = await this.prisma.seller.findMany({
        where: { sessionId },
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              type: true,
              status: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return res.status(200).json({
        status: 'success',
        results: sellers.length,
        data: sellers
      });
    } catch (error) {
      next(error);
    }
  }
}

export default SellerController;

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