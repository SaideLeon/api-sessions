import { PrismaClient } from '@prisma/client';

class MessageService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // Função para registrar uma nova mensagem
  async registerMessage({ sessionId, sender, content, mediaUrl, phoneNumber }) {
    try {
      await this.prisma.message.create({
        data: {
          sessionId,
          sender,
          content,
          mediaUrl: mediaUrl || null,
          phoneNumber,
        },
      });
      console.info('Mensagem registrada!'); 
    } catch (error) {
      console.error('Erro ao registrar mensagem:', error);
      throw error;
    }
  }

  // Função para filtrar mensagens por sessionId e phoneNumber
  async filterMessagesBySessionAndPhone(sessionId, phoneNumber) {
    try {
      const messages = await this.prisma.message.findMany({
        where: {
          sessionId,
          phoneNumber,
        },
      });
      console.log('Mensagens filtradas:', messages);
      return messages;
    } catch (error) {
      console.error('Erro ao filtrar mensagens:', error);
      throw error;
    }
  }

  // Método para desconectar o Prisma Client (opcional, usado em scripts)
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export default MessageService;
