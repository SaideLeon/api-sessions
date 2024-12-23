import { PrismaClient } from '@prisma/client';

class VendorService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // Atualizar nome do vendedor
  async updateVendorName(vendorId, newName) {
    try {
      // Encontre o vendedor com o sessionId
    const vendor = await this.prisma.vendor.findFirst({
      where: {sessionId: vendorId },
    });

    if (!vendor) {
      throw new Error("Vendedor não encontrado.");
    }

      await this.prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          vendorName: newName, // Atualiza o nome do vendedor
        },
      });
      console.info('Nome do vendedor atualizado!'); 
    } catch (error) {
      console.error('Erro ao atualizar o nome do vendedor:', error);
      throw error;
    }
  }

  // Criar um novo vendedor
  async createVendor(vendorId, phoneNumber, vendorName) {
    console.log("Dados do vendedor:", { vendorId, phoneNumber, vendorName }); 
  
    try {
      await this.prisma.vendor.create({
        data: {
          sessionId: vendorId,
          phoneNumber,
          vendorName,
        },
      });
      console.info('Vendedor criado com sucesso:', vendorName);
    } catch (error) {
      console.error('Erro ao criar vendedor:', error);
      throw error;
    }
  }
  
  
  

  // Buscar vendedores por sessionId
  async findVendorsBySession(sessionId, phoneNumber) {
    try {
      const vendors = await this.prisma.vendor.findMany({
        where: {
          sessionId,
          phoneNumber,
        },
      });
      console.info('Vendedor encontrado!',);
      return vendors;
    } catch (error) {
      console.error('Erro ao buscar vendedor!', error);
      throw error;
    }
  }

  // Verificar se existe um vendedor na sessão com o número de telefone
  async checkVendorExists(sessionId, phoneNumber) {
    try {
      const existingVendor = await this.prisma.vendor.findFirst({
        where: {
          sessionId,
          phoneNumber,
        },
      });
      return !!existingVendor; // Retorna true se encontrar, false caso contrário
    } catch (error) {
      console.error('Erro ao verificar vendedor:', error);
      throw error;
    }
  } 
  
  // Desconectar o Prisma Client
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export default VendorService;
