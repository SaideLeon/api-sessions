// src/services/sellerService.js
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError.js';

export class SellerService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(sellerData) {
    const { sessionId, sellerName, product, description, image, benefits } = sellerData;

    const sessionExists = await this.prisma.session.findUnique({
      where: { sessionId }
    });

    if (!sessionExists) {
      throw new AppError('Session not found', 404);
    }

    // Verificar se já existe um vendedor com mesmo nome na sessão
    const existingSeller = await this.prisma.seller.findFirst({
      where: {
        AND: [
          { sessionId },
          { sellerName }
        ]
      }
    });

    if (existingSeller) {
      throw new AppError('Seller already exists in this session', 400);
    }

    const seller = await this.prisma.seller.create({
      data: {
        sessionId,
        sellerName,
        product,
        description,
        image,
        benefits
      }
    });

    return seller;
  }

  async findAll(sessionId) {
    const where = sessionId ? { sessionId } : {};

    const sellers = await this.prisma.seller.findMany({
      where,
      include: {
        session: {
          select: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    return sellers;
  }

  async findById(id) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: Number(id) },
      include: {
        session: {
          select: {
            user: {
              select: {
                username: true
              }
            }
          }
        }
      }
    });

    if (!seller) {
      throw new AppError('Seller not found', 404);
    }

    return seller;
  }

  async update(id, sellerData) {
    const { product, description, image, benefits } = sellerData;

    const seller = await this.findById(id);

    const updatedSeller = await this.prisma.seller.update({
      where: { id: Number(id) },
      data: {
        product,
        description,
        image,
        benefits
      }
    });

    return updatedSeller;
  }

  async delete(id) {
    const seller = await this.findById(id);

    await this.prisma.seller.delete({
      where: { id: Number(id) }
    });
  }
}