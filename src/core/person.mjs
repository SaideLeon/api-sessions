import sellerJSON from "./getSeller.mjs";
import SellerService from "../utils/vendorSearch.mjs";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { ChatGroq } from "@langchain/groq";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import MessageService from "./messageService.js";
import VendorService from "./vendorService.js"; 

// Carregar variáveis de ambiente do arquivo .env
dotenv.config();

// Inicializa o Prisma Client
const prisma = new PrismaClient();
const sellerService = new SellerService(prisma);
const vendorService = new VendorService(prisma);
const messageService = new MessageService();

// Função: Gerar Features e Público-Alvo
async function personAI(vendorId, mensagem, phoneNumber) {
  try {
    console.log("Iniciando busca de vendedores no banco de dados...");
    const database = await sellerService.findSellers({
      sessionId: vendorId,
      sellerName: null,
      product: null,
      returnType: "sellers",
    });
    console.log("Dados do banco de dados retornados:", database);

    const data = await sellerJSON(mensagem, database);

    let vendorName = data?.matched?.sellerName || null;
    const sellerProduct = data?.matched?.product || null;
    console.log("Dados processados do cliente:", data);

    // Verifica se o vendedor existe
    const exists = await vendorService.checkVendorExists(vendorId, phoneNumber);

    // Atualiza ou cria o vendedor com base nos dados
    if (exists && vendorName) {
      console.log(`Atualizando nome do vendedor para: ${vendorName}`);
      await vendorService.updateVendorName(vendorId, vendorName);
    } else if (vendorName && phoneNumber && vendorId) {
      console.log("Criando novo vendedor...");
      console.log("Dados do vendedor:", { vendorId, phoneNumber, vendorName });
      await vendorService.createVendor(vendorId, phoneNumber=phoneNumber, vendorName);

      console.error("Os campos obrigatórios estão ausentes. Dados recebidos:");
      console.error({ vendorId, phoneNumber, vendorName });
      throw new Error("Dados insuficientes para criar o vendedor.");
    }

    const vendorData = await vendorService.findVendorsBySession(vendorId, phoneNumber);
    console.log("Dados do Vendedor:", vendorData);
    
    vendorName = vendorData && vendorData.length > 0 && !vendorName?vendorData.forEach(vendor => {vendor.vendorName }) : null;
    

    // Decide qual método usar para buscar os dados
    const alldata = !vendorName && !sellerProduct
      ?  await sellerService.findMostRecentSeller(vendorId) : await sellerService.findSellers({
          sessionId: vendorId,
          sellerName: vendorName,
          product: sellerProduct,
          returnType: "results",
        });

    // Verifica se há resultados
    const [firstResult] = alldata?.results || alldata?.seller;
    if (!firstResult) {
      console.error("Nenhum resultado encontrado em alldata.results.");
      return "Nenhum vendedor ou produto foi encontrado no banco de dados.";
    }

    const {
      id,
      sessionId,
      sellerName,
      product,
      description,
      image,
      benefits,
      createdAt,
    } = firstResult;

    const db = `Banco de dados:
    ID: ${id};
    Session ID: ${sessionId};
    Seller Name: ${sellerName};
    Product: ${product};
    Description: ${description};
    Image: ${image || "Nenhuma imagem disponível"};
    Benefits: ${benefits};
    Created At: ${createdAt};
    `;

    // Inicializa o modelo de linguagem e processa o prompt
    const llm = new ChatGroq({
      model: "llama3-groq-70b-8192-tool-use-preview",
      temperature: 0.7,
      maxRetries: 2,
      apiKey: process.env.GROQ_API_KEY,
    });

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "Você é um vendedor inteligente que assume a personalidade do vendedor responsável pelo produto mencionado pelo cliente. Ao identificar um produto ou vendedor no banco de dados, você adapta seu estilo de comunicação para refletir o comportamento e tom do vendedor associado. Responda de maneira amigável, personalizada e persuasiva, ajudando o cliente a tomar a melhor decisão. Aprimore o marketing: Adicione gatilhos como vantagens adicionais na mensagem.Inclua instruções simples de como finalizar a compra diretamente.",
      ],
      ["human", "Prompt do cliente: {prompt}. Banco de dados disponível: {database}."],
    ]);

    const chain = prompt.pipe(llm);

    const response = await chain.invoke({
      prompt: mensagem,
      database: db,
    });
    try{
    	await messageService.registerMessage(
    	sessionId=vendorId, 
    	sender="Client",
    	content=mensagem,
    	mediaUrl=null,
    	phoneNumber=phoneNumber
    	);
    	await messageService.registerMessage(
    	sessionId=vendorId, 
    	sender="AI",
    	content=response.content,
    	mediaUrl=null,
    	phoneNumber=phoneNumber
    	);
    	
    	console.log("Mensagens salvas com sucesso!")
    }catch(error){
    	console.log("Erro ao salvar mensagens: ", error)
    }

    return response.content; // Retorna o texto com features e público-alvo
    
  } catch (error) {
    console.error("Erro ao executar a função personAI:", error);
    return "Ocorreu um erro ao processar sua solicitação. Tente novamente mais tarde.";
  }
}

export default personAI;
