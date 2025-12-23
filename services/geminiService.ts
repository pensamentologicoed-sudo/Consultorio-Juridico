
import { GoogleGenAI } from "@google/genai";

// O API Key é obtido exclusivamente das variáveis de ambiente
// Modelo recomendado para tarefas de texto complexas (raciocínio jurídico)
const modelId = 'gemini-3-pro-preview';

export const generateLegalText = async (prompt: string, context?: string): Promise<string> => {
  // Fix: Initialization strictly using named parameter and process.env.API_KEY as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `Você é um assistente jurídico sênior do escritório LegalFlow. 
  Seu tom é extremamente profissional, formal e preciso (Português Brasil). 
  Você auxilia advogados a redigir petições, resumir casos e analisar riscos. 
  Sempre use terminologia jurídica correta.`;

  const fullPrompt = context 
    ? `Contexto do Caso: ${context}\n\nTarefa: ${prompt}`
    : prompt;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.2, // Mais factual para fins jurídicos
      }
    });

    return response.text || "Não foi possível gerar uma resposta.";
  } catch (error) {
    console.error("Erro Gemini API:", error);
    throw error;
  }
};

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
    // Fix: Initialization strictly using named parameter and process.env.API_KEY right before the call
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    try {
        const chat = ai.chats.create({
            model: modelId,
            config: {
                systemInstruction: "Você é o Assistente LegalFlow AI. Responda em Português (Brasil) com formalidade e precisão técnica. Seja conciso e útil.",
                temperature: 0.4
            },
            history: history
        });

        const result = await chat.sendMessage({ message });
        return result.text || "";
    } catch (error) {
        console.error("Erro Gemini Chat:", error);
        throw error;
    }
};
