import Cerebro from '../cerebro.mjs';

const cerebro = new Cerebro();

class Tools {
  constructor() {}
  // Processa o texto enviado pelo usuário
  async processarTexto(userId, mensagemUsuario, sessionId) {
    return await cerebro.gerarRespostaIA(userId, mensagemUsuario, sessionId);
  }

  // Processa mídias enviadas pelo usuário
  async processarMedia(userId, mediaData, sessionId) {
    if (mediaData.mimetype.startsWith('image')) {
      return await cerebro.gerarRespostaImagem(userId, mediaData);
    } else if (mediaData.mimetype.startsWith('audio')) {
      return await cerebro.transcreverAudio(userId, mediaData, sessionId);
    }
    return 'Tipo de mídia não suportado.';
  }

  // Baixa a mídia recebida na mensagem
  async baixarMidia(message) {
    try {
      const media = await message.downloadMedia();
      return media ? {
        mimetype: media.mimetype,
        data: `data:${media.mimetype};base64,${media.data}`,
      } : null;
    } catch (error) {
      console.error('Erro ao baixar a mídia:', error);
      return { error: 'Falha ao baixar a mídia.' };
    }
  }
}

export default Tools;

 