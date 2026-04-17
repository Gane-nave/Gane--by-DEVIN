import { GoogleGenAI, Type, Schema } from '@google/genai';

// Initialize the Gemini API client
// The API key is injected at runtime by AI Studio
export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Models
export const MODELS = {
  PRO: 'gemini-3.1-pro-preview',
  FLASH: 'gemini-3-flash-preview',
  FLASH_LITE: 'gemini-3.1-flash-lite-preview',
  TTS: 'gemini-2.5-flash-preview-tts',
};

// Helper for basic text generation
export async function generateText(prompt: string, model = MODELS.FLASH) {
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });
  return response.text;
}

// Helper for high thinking
export async function generateWithThinking(prompt: string) {
  const response = await ai.models.generateContent({
    model: MODELS.PRO,
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingBudget: 4096, // Optional, but good practice
      },
    },
  });
  return response.text;
}

// Helper for grounded search
export async function generateWithSearch(prompt: string) {
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  return response.text;
}

// Helper for grounded maps
export async function generateWithMaps(prompt: string) {
  const response = await ai.models.generateContent({
    model: MODELS.FLASH,
    contents: prompt,
    config: {
      tools: [{ googleMaps: {} }],
    },
  });
  return response.text;
}

// Helper for TTS
export async function generateSpeech(text: string) {
  const response = await ai.models.generateContent({
    model: MODELS.TTS,
    contents: text,
  });
  
  // The response contains base64 encoded audio in inlineData
  const audioPart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
  if (audioPart?.inlineData) {
    return `data:${audioPart.inlineData.mimeType};base64,${audioPart.inlineData.data}`;
  }
  return null;
}
