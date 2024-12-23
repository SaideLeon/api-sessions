// Função para construir mensagens para a IA
async function buildMessages(system, prompt, database) {
    return [
      {
        role: "system",
        content: system
      }
      ,
      {
        role: "user",
        content: `Prompt: "${prompt}". Banco de dados: ${JSON.stringify(
          database
        )}.`,
      },
    ];
  }

export default buildMessages;