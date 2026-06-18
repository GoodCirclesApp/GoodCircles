import Anthropic from '@anthropic-ai/sdk';

// Single server-side Claude client (Google GenAI removed 2026-06-18). Lazily
// constructed; returns null/no-op until ANTHROPIC_API_KEY is set, so every AI
// feature degrades gracefully to its deterministic fallback pre-launch.
const MODEL = 'claude-sonnet-4-6';

let _client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export function aiConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

export async function generateText(system: string, user: string, maxTokens = 1500): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: user }],
    });
    const block = msg.content[0];
    return block.type === 'text' ? block.text : null;
  } catch (err) {
    console.error('[AI] generateText error:', err);
    return null;
  }
}

export async function generateJSON(system: string, user: string, maxTokens = 1500): Promise<any | null> {
  const text = await generateText(
    system + '\n\nRespond with raw JSON only — no markdown fences, no prose.',
    user,
    maxTokens,
  );
  if (!text) return null;
  try {
    const clean = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
    return JSON.parse(clean);
  } catch (err) {
    console.error('[AI] generateJSON parse error:', err);
    return null;
  }
}
