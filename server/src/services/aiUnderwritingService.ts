import { FundDeployment, Merchant, CommunityFund } from "@prisma/client";
import { generateJSON } from "../lib/aiClient";

export class AIUnderwritingService {
  /**
   * Evaluate a loan application for a CDFI. Uses Claude via the shared server AI
   * client; returns the manual-review fallback when ANTHROPIC_API_KEY is unset.
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

Respond with JSON matching exactly this shape:
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

    const result = await generateJSON(systemInstruction, `Evaluate this loan application: ${JSON.stringify(context)}`);
    return result ?? fallback;
  }
}
