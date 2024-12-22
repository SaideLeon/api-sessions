// src/controllers/vendorController.mjs
import { PrismaClient } from '@prisma/client';
import AppError from '../utils/AppError.mjs';

class VendorController {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(req, res, next) {
    try {
      const { sessionId, phoneNumber, vendorName } = req.body;

      // Verificar se a sessão existe
      const session = await this.prisma.session.findUnique({
        where: { sessionId }
      });

      if (!session) {
        throw new AppError('Session not found', 404);
      }

      // Verificar se já existe um vendor para esta sessão
      const existingVendor = await this.prisma.vendor.findUnique({
        where: { sessionId }
      });

      if (existingVendor) {
        throw new AppError('A vendor already exists for this session', 400);
      }

      const vendor = await this.prisma.vendor.create({
        data: {
          sessionId,
          phoneNumber,
          vendorName
        },
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              status: true
            }
          }
        }
      });

      return res.status(201).json({
        status: 'success',
        message: 'Vendor created successfully',
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  }

  async findAll(req, res, next) {
    try {
      const vendors = await this.prisma.vendor.findMany({
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              status: true
            }
          }
        }
      });

      return res.status(200).json({
        status: 'success',
        results: vendors.length,
        data: vendors
      });
    } catch (error) {
      next(error);
    }
  }

  async findOne(req, res, next) {
    try {
      const { id } = req.params;

      const vendor = await this.prisma.vendor.findUnique({
        where: { id: Number(id) },
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              status: true
            }
          }
        }
      });

      if (!vendor) {
        throw new AppError('Vendor not found', 404);
      }

      return res.status(200).json({
        status: 'success',
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { vendorName, phoneNumber } = req.body;

      const vendor = await this.prisma.vendor.update({
        where: { id: Number(id) },
        data: {
          vendorName,
          phoneNumber
        },
        include: {
          session: {
            select: {
              sessionId: true,
              title: true,
              status: true
            }
          }
        }
      });

      return res.status(200).json({
        status: 'success',
        message: 'Vendor updated successfully',
        data: vendor
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;

      await this.prisma.vendor.delete({
        where: { id: Number(id) }
      });

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
export default VendorController;


