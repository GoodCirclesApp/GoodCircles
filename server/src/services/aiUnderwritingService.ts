import Anthropic from '@anthropic-ai/sdk';
import { FundDeployment, Merchant, CommunityFund } from "@prisma/client";

// Claude-only (Google GenAI removed). Lazily constructed; returns null until
// ANTHROPIC_API_KEY is set, so pre-launch the service degrades to the manual-
// review fallback below instead of erroring.
const MODEL = 'claude-sonnet-4-6';

let _client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!_client) _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

export class AIUnderwritingService {
  /**
   * Evaluate a loan application for a CDFI.
   */
  static async evaluateLoanApplication(
    application: FundDeployment & { recipientMerchant: Merchant, fund: CommunityFund },
    merchantHistory: any[]
  ) {
    const context = {
      merchant: {
        name: application.recipientMerchant?.businessName || 'Unknown',
        category: application.recipientMerchant?.businessType || 'N/A',
        location: application.recipientMerchant?.regionId || 'N/A',
        isVerified: application.recipientMerchant?.isVerified || false,
      },
      loan: {
        amount: application.amount,
        purpose: application.deploymentType,
        fundType: application.fund.type,
      },
      history: merchantHistory.map(h => ({ date: h.date, amount: h.amount, status: h.status })),
    };

    const systemInstruction = `You are a CDFI Loan Underwriting Assistant.
Evaluate the risk and community impact of this loan application.
Consider the merchant's history, the loan amount, and the fund's mission.
Provide a risk score (1-10, where 1 is lowest risk) and a community impact score (1-10).
Suggest an interest rate and term if applicable.

Respond with raw JSON only (no markdown fences) matching exactly this shape:
{"riskScore": number, "impactScore": number, "recommendation": "APPROVE" | "CONDITIONALLY_APPROVE" | "DENY", "suggestedInterestRate": number, "suggestedTermMonths": number, "analysis": string, "communityBenefits": string[], "riskFactors": string[]}`;

    // Graceful fallback — also returned pre-launch before ANTHROPIC_API_KEY is set.
    const fallback = {
      riskScore: 5,
      impactScore: 5,
      recommendation: "CONDITIONALLY_APPROVE",
      analysis: "AI Underwriting system temporarily unavailable. Manual review recommended.",
      communityBenefits: ["Local business support"],
      riskFactors: ["System timeout during analysis"],
    };

    const client = getClient();
    if (!client) return fallback;

    try {
      const msg = await client.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: systemInstruction,
        messages: [{ role: 'user', content: `Evaluate this loan application: ${JSON.stringify(context)}` }],
      });
      const block = msg.content[0];
      const text = block.type === 'text' ? block.text.trim() : '';
      if (!text) throw new Error('Empty AI underwriting response');
      const clean = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
      return JSON.parse(clean);
    } catch (error) {
      console.error("AI Underwriting Error:", error);
      return fallback;
    }
  }
}
