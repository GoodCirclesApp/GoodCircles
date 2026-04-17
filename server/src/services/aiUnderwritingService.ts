
import { GoogleGenAI, Type } from "@google/genai";
import { FundDeployment, Merchant, CommunityFund } from "@prisma/client";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class AIUnderwritingService {
  /**
   * Evaluate a loan application for a CDFI.
   */
  static async evaluateLoanApplication(
    application: FundDeployment & { recipientMerchant: Merchant, fund: CommunityFund },
    merchantHistory: any[]
  ) {
    const model = 'gemini-3-flash-preview';
    
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
      history: merchantHistory.map(h => ({
        date: h.date,
        amount: h.amount,
        status: h.status
      }))
    };

    const systemInstruction = `You are a CDFI Loan Underwriting Assistant. 
    Evaluate the risk and community impact of this loan application. 
    Consider the merchant's history, the loan amount, and the fund's mission.
    Provide a risk score (1-10, where 1 is lowest risk) and a community impact score (1-10).
    Suggest an interest rate and term if applicable.`;

    const prompt = `Evaluate this loan application: ${JSON.stringify(context)}`;

    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: { type: Type.NUMBER },
              impactScore: { type: Type.NUMBER },
              recommendation: { type: Type.STRING, enum: ["APPROVE", "CONDITIONALLY_APPROVE", "DENY"] },
              suggestedInterestRate: { type: Type.NUMBER },
              suggestedTermMonths: { type: Type.NUMBER },
              analysis: { type: Type.STRING },
              communityBenefits: { type: Type.ARRAY, items: { type: Type.STRING } },
              riskFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["riskScore", "impactScore", "recommendation", "analysis"]
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("AI Underwriting Error:", error);
      return {
        riskScore: 5,
        impactScore: 5,
        recommendation: "CONDITIONALLY_APPROVE",
        analysis: "AI Underwriting system temporarily unavailable. Manual review recommended.",
        communityBenefits: ["Local business support"],
        riskFactors: ["System timeout during analysis"]
      };
    }
  }
}
