import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default class Seller {
    constructor() {
        this.prisma = prisma;
    }

    // Criar vendedor
    async create({ sessionId, sellerName, product, description, benefits, image = null }) {
        try {
            // Validação simples dos dados antes de criar o vendedor
            if (!sellerName || !sessionId || !product || !description || !benefits) {
                return {
                    success: false,
                    message: 'Todos os campos obrigatórios devem ser preenchidos.',
                };
            }

            const seller = await this.prisma.seller.create({
                data: {
                    sessionId,
                    sellerName,
                    product,
                    description,
                    benefits,
                    image: image ?? null,
                },
            });
            return { success: true, message: 'Vendedor criado com sucesso!', seller };
        } catch (error) {
            if (error.code === 'P2002') {
                // Erro P2002 é retornado quando uma restrição de unicidade é violada
                return {
                    success: false,
                    message: `O vendedor "${sellerName}" já está registrado nesta sessão.`,
                };
            }
            console.error("Erro ao criar vendedor:", error);
            throw new Error('Erro ao criar vendedor');
        }
    }

    // Buscar todos os vendedores de uma sessão
    async findSeller(sessionId) {
        try {
            const sellers = await this.prisma.seller.findMany({
                where: { sessionId },
                orderBy: { createdAt: 'asc' },
            });
            return sellers;
        } catch (error) {
            console.error("Erro ao buscar vendedores:", error);
            throw new Error('Erro ao buscar vendedores');
        }
    }

    // Buscar vendedor por nome em uma sessão (retorna o primeiro encontrado)
    async findSellerByName(sessionId, sellerName) {
        try {
            const seller = await this.prisma.seller.findFirst({
                where: {
                    sessionId,
                    sellerName: {
                        contains: sellerName,
                        mode: 'insensitive',
                    },
                },
            });
            return seller;
        } catch (error) {
            console.error("Erro ao buscar vendedor por nome:", error);
            throw new Error('Erro ao buscar vendedor por nome');
        }
    }
}

