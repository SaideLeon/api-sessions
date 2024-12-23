import fs from 'fs';
import dotenv from 'dotenv';
import path from 'path';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import temp from 'temp'; 
import { Groq } from 'groq-sdk';
import personAI from "./core/person.mjs";

dotenv.config(); 

temp.track();
const visionModel = new ChatGoogleGenerativeAI({
    model: "gemini-1.5-flash",
    maxOutputTokens: 2048,
});

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const groqModel = process.env.GROQ_MODEL;

class Cerebro {
    constructor() {
        if (!groqModel) {
            throw new Error("Modelo GROQ não configurado. Verifique GROQ_MODEL no arquivo .env.");
        }
    }

    async gerarRespostaIA(userId, mensagemUsuario, sessionId) {
        try {
        	const respostaIA = await personAI(sessionid=sessionId, userPrompt=mensagemUsuario, number=userId);
         
            return respostaIA;
        } catch (error) {
            console.error("Erro ao gerar resposta da IA:", error.message);
            return "Houve um erro ao tentar gerar a resposta.";
        }
    }

    async transcreverAudio(userId, mediaData, sessionId) {
        let tempFilePath;
        try {
            tempFilePath = temp.path({ suffix: ".mp3" });
            fs.writeFileSync(tempFilePath, mediaData.data.split(",")[1], { encoding: "base64" });

            const transcription = await groq.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-large-v3-turbo",
            });

            const transcricao = transcription.text || "Não consegui transcrever o áudio.";
            return await this.gerarRespostaIA(userId, transcricao, sessionId);
        } catch (error) {
            console.error("Erro ao transcrever o áudio:", error.message);
            return "Desculpe, houve um erro ao processar o áudio.";
        } finally {
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    }

    async gerarRespostaImagem(userId, mediaData) {
        try {
            const input = [
                {
                    role: "human",
                    content: [
                        { type: "text", text: "Analise a imagem fornecida e descreva-a detalhadamente." },
                        { type: "image_url", image_url: mediaData.data },
                    ],
                },
            ];

            const res = await visionModel.invoke(input);
            const respostaIA = res?.content || "Não consegui analisar a imagem.";

            this.atualizarHistorico(userId, { role: "user", content: "[Imagem recebida do usuário]" });
            this.atualizarHistorico(userId, { role: "assistant", content: respostaIA });

            return respostaIA;
        } catch (error) {
            console.error("Erro ao processar a imagem:", error.message);
            return "Desculpe, houve um erro ao analisar a imagem.";
        }
    }
}

export default Cerebro;
