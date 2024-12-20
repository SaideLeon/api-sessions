// src/services/vendorService.js
import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/AppError.js';

export class VendorService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(vendorData) {
    const { sessionId, phoneNumber, vendorName } = vendorData;

    const sessionExists = await this.prisma.session.findUnique({
      where: { sessionId }
    });

    if (!sessionExists) {
      throw new AppError('Session not found', 404);
    }

    // Verificar se já existe um vendor com esse sessionId
    const existingVendor = await this.prisma.vendor.findUnique({
      where: { sessionId }
    });

    if (existingVendor) {
      throw new AppError('Vendor already exists for this session', 400);
    }

    const vendor = await this.prisma.vendor.create({
      data: {
        sessionId,
        phoneNumber,
        vendorName
      }
    });

    return vendor;
  }

  async findAll() {
    const vendors = await this.prisma.vendor.findMany({
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

    return vendors;
  }

  async findById(id) {
    const vendor = await this.prisma.vendor.findUnique({
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

    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }

    return vendor;
  }

  async update(id, vendorData) {
    const { phoneNumber, vendorName } = vendorData;

    const vendor = await this.findById(id);

    const updatedVendor = await this.prisma.vendor.update({
      where: { id: Number(id) },
      data: {
        phoneNumber,
        vendorName
      }
    });

    return updatedVendor;
  }

  async delete(id) {
    const vendor = await this.findById(id);

    await this.prisma.vendor.delete({
      where: { id: Number(id) }
    });
  }
}