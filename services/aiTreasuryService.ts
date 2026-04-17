
import { safeGenerateJSON } from './_aiClient';
import { TreasuryStats, TreasuryRecommendation } from "../types";

export async function generateTreasuryRecommendations(stats: TreasuryStats): Promise<TreasuryRecommendation[]> {
  const prompt = `Analyze Good Circles Community Treasury. Stats: ${JSON.stringify(stats)}. Generate 3 actionable recommendations. Respond ONLY in JSON array: Array<{type: "RATE_ADJUSTMENT"|"PROJECT_INJECTION"|"NODE_RESERVE", title: string, description: string, impactForecast: string, confidence: number}>`;
  const data = await safeGenerateJSON('gemini-2.0-flash', prompt, { responseMimeType: "application/json" });
  if (data && Array.isArray(data)) {
    return data.map((d: any, i: number) => ({ ...d, id: `rec-${Date.now()}-${i}`, isApplied: false }));
  }
  return [{ id: 'fallback-1', type: 'RATE_ADJUSTMENT', title: 'Stabilization Protocol', description: 'Increase internal fee by 0.1% to build reserves.', impactForecast: '+4% Wealth Retention', confidence: 0.85, isApplied: false }];
}
