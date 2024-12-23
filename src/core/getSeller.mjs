import { ChatGroq } from '@langchain/groq'; 
import dotenv from 'dotenv'; 

import buildMessages from '../utils/buildMessage.js';  
 
// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Configuração do modelo
const llm = new ChatGroq({
  model: "mixtral-8x7b-32768",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  apiKey: process.env.GROQ_API_KEY,
});

async function sellerJSON(userPrompt, database) {
  const system =
    "Você é um analisador de texto que verifica se o prompt do usuário contém nomes de vendedores ou produtos presentes no banco de dados. Caso encontre correspondência apenas no produto, deve adicionar no seu JSON o nome do vendedor do banco de dados. Retorne o resultado em JSON no formato: { found: boolean, matched: { sellerName: string | null, product: string | null } }.";

  try {
    // Construção das mensagens
    const mensagens = await buildMessages(system, userPrompt, database);

    // Vincular o formato de resposta
    const llmComFormatoResposta = llm.bind({
      response_format: { type: "json_object" },
    });

    // Chamada ao modelo
    const mensagemVinculadaIA = await llmComFormatoResposta.invoke(mensagens);

    // Analise o conteúdo como JSON
    const data = JSON.parse(mensagemVinculadaIA.content);
    

    return data;
  } catch (error) {
    console.error("Erro ao executar o modelo:", error);
    return null; // Retorne null em caso de erro
  }
}

export default sellerJSON;

 
