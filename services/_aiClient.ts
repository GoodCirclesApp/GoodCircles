import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;

function getAI(): GoogleGenAI | null {
  if (_ai) return _ai;
  try {
    const key = typeof process !== 'undefined' ? (process.env?.GEMINI_API_KEY || process.env?.API_KEY || '') : '';
    if (key) {
      _ai = new GoogleGenAI({ apiKey: key });
    }
  } catch (e) {
    // Not available (browser without key, etc.)
  }
  return _ai;
}

export async function safeGenerate(model: string, contents: string, config?: any): Promise<string> {
  const ai = getAI();
  if (!ai) return 'AI features require a Gemini API key. Please configure GEMINI_API_KEY.';
  try {
    const response = await ai.models.generateContent({ model, contents, ...(config ? { config } : {}) });
    return response.text || 'No response generated.';
  } catch (error) {
    console.error('Gemini error:', error);
    return 'AI is temporarily unavailable.';
  }
}

export async function safeGenerateJSON(model: string, contents: string, config?: any): Promise<any> {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({ model, contents, ...(config ? { config } : {}) });
    return JSON.parse(response.text);
  } catch (error) {
    console.error('Gemini JSON error:', error);
    return null;
  }
}

export { getAI };
