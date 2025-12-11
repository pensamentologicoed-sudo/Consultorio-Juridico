import { GoogleGenAI } from "@google/genai";

// NOTE: In a real app, this key should come from a secure backend or environment variable.
// For this frontend-only demo, we rely on the user providing it or using a placeholder if strict.
// Ideally, the user of this code injects their key into process.env.API_KEY.
// We will handle the case where the key is missing gracefully in the UI.

const apiKey = process.env.API_KEY || ''; 

export const generateLegalText = async (prompt: string, context?: string): Promise<string> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please configure your Gemini API Key.");
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Using a model suitable for complex text tasks
    const modelId = 'gemini-2.5-flash'; 

    const systemInstruction = `You are an expert legal assistant AI for "LegalFlow". 
    Your tone is professional, precise, and formal (Portuguese Brazil). 
    You assist lawyers in drafting emails, summarizing case notes, and suggesting legal strategies. 
    Always include a disclaimer that you are an AI and this is not binding legal advice.`;

    const fullPrompt = context 
      ? `Context: ${context}\n\nTask: ${prompt}`
      : prompt;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.3, // Lower temperature for more deterministic/professional output
      }
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

export const sendChatMessage = async (history: {role: string, parts: {text: string}[]}[], message: string): Promise<string> => {
    if (!apiKey) {
        throw new Error("API Key is missing.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey });
        const modelId = 'gemini-2.5-flash';

        const chat = ai.chats.create({
            model: modelId,
            config: {
                systemInstruction: "Você é um assistente jurídico experiente chamado LegalFlow AI. Responda em Português do Brasil com terminologia jurídica adequada. Seja conciso, formal e útil.",
                temperature: 0.4
            },
            history: history
        });

        const result = await chat.sendMessage({ message });
        return result.text || "";
    } catch (error) {
        console.error("Gemini Chat Error:", error);
        throw error;
    }
};