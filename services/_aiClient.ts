import Anthropic from '@anthropic-ai/sdk';

const MODEL = 'claude-sonnet-4-6';

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });
  }
  return _client;
}

// Kept for any legacy code that calls getAI() directly
export function getAI() {
  return getClient();
}

export async function safeGenerate(
  _model: string,
  contents: string,
  config?: { systemInstruction?: string; temperature?: number }
): Promise<string> {
  try {
    const msg = await getClient().messages.create({
      model: MODEL,
      max_tokens: 2048,
      ...(config?.systemInstruction ? { system: config.systemInstruction } : {}),
      messages: [{ role: 'user', content: contents }],
    });
    const block = msg.content[0];
    return block.type === 'text' ? block.text : '';
  } catch (err) {
    console.error('[AI] safeGenerate error:', err);
    return 'AI is temporarily unavailable. Please try again shortly.';
  }
}

export async function safeGenerateJSON(
  _model: string,
  contents: string,
  config?: { systemInstruction?: string; temperature?: number }
): Promise<any> {
  try {
    const system = (config?.systemInstruction ?? '') +
      '\n\nRespond with valid JSON only — no markdown fences, no explanation, just the raw JSON object or array.';
    const msg = await getClient().messages.create({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: contents }],
    });
    const block = msg.content[0];
    const text = block.type === 'text' ? block.text.trim() : '{}';
    const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('[AI] safeGenerateJSON error:', err);
    return null;
  }
}
