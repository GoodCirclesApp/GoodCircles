import { safeGenerateJSON } from './_aiClient';
import { TreasuryStats, TreasuryRecommendation } from '../types';

export async function generateTreasuryRecommendations(stats: TreasuryStats): Promise<TreasuryRecommendation[]> {
  const prompt = `You are the Good Circles Treasury AI. Analyze this community economy's treasury metrics and generate exactly 3 actionable recommendations.

Treasury Stats: ${JSON.stringify(stats)}

Each recommendation should be one of these types:
- "RATE_ADJUSTMENT": suggest modifying fee rates or discount rates
- "PROJECT_INJECTION": suggest funding a community initiative or infrastructure investment
- "NODE_RESERVE": suggest building reserves or liquidity buffers for a specific node

Return a JSON array of exactly 3 objects:
[
  {
    "type": "RATE_ADJUSTMENT" | "PROJECT_INJECTION" | "NODE_RESERVE",
    "title": string (concise action title),
    "description": string (2-3 sentences explaining the recommendation),
    "impactForecast": string (projected outcome, e.g. "+8% Capital Velocity"),
    "confidence": number (0-1, your confidence this recommendation is sound)
  }
]`;

  const data = await safeGenerateJSON('claude', prompt);
  if (data && Array.isArray(data)) {
    return data.map((d: any, i: number) => ({ ...d, id: `rec-${Date.now()}-${i}`, isApplied: false }));
  }
  return [{
    id: 'fallback-1',
    type: 'RATE_ADJUSTMENT',
    title: 'Stabilization Protocol',
    description: 'Increase internal processing fee by 0.1% to build community reserves. This small adjustment creates a meaningful buffer against volatility.',
    impactForecast: '+4% Wealth Retention',
    confidence: 0.85,
    isApplied: false,
  }];
}
