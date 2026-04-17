
import { getAI, safeGenerate, safeGenerateJSON } from './_aiClient';
import { Order, Nonprofit, PayoutBatch, TreasuryStats, TaxAlphaMetrics } from "../types";

export async function generateBusinessInsights(orders: any[], role: 'MERCHANT' | 'NONPROFIT') {
  const prompt = `Analyze transaction data for ${role}. Highlight Network Effect ROI. Data: ${JSON.stringify(orders)}`;
  return await safeGenerate('gemini-2.0-flash', prompt, { temperature: 0.7 }) || "Unable to generate insights.";
}

export async function generateTaxAlphaAnalysis(metrics: TaxAlphaMetrics) {
  const prompt = `Perform a "Fiscal Arbitrage Analysis" for a Merchant using Good Circles. Metrics: ${JSON.stringify(metrics)}. Explain how the combination of 3% merchant fee savings, 10-15% marketing savings, and tax-deductible donations makes every dollar earned internally significantly more valuable than external commerce.`;
  return await safeGenerate('gemini-2.0-flash', prompt, { temperature: 0.7 }) || "Tax Alpha analyzer currently processing.";
}

export async function generateTaxStatement(orders: Order[], entityName: string, year: string) {
  const totalImpact = orders.reduce((sum, o) => sum + o.accounting.donationAmount, 0);
  const prompt = `Draft a professional, IRS-compliant 501(c)(3) tax receipt summary for ${entityName} for the fiscal year ${year}. Total donations facilitated: $${totalImpact.toFixed(2)}.`;
  return await safeGenerate('gemini-2.0-flash', prompt, { temperature: 0.2 }) || "Drafting service unavailable.";
}

export async function generateBatchSettlementSummary(batch: PayoutBatch) {
  const prompt = `Generate a 2-sentence executive summary for a settlement batch for ${batch.entityName}. Gross: $${batch.totalGross}, Impact: $${batch.totalImpact}.`;
  return await safeGenerate('gemini-2.0-flash', prompt) || "Settlement period confirmed.";
}

export async function generateAccountingReport(orders: any[]) {
  const ai = getAI();
  if (!ai) return { totalRevenue: 0, totalCogs: 0, totalDonations: 0, totalPlatformFees: 0, netProfitAfterAll: 0 };
  try {
    const { Type } = await import("@google/genai");
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', contents: `Summarize order data into JSON: ${JSON.stringify(orders)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            totalRevenue: { type: Type.NUMBER }, totalCogs: { type: Type.NUMBER },
            totalDonations: { type: Type.NUMBER }, totalPlatformFees: { type: Type.NUMBER },
            netProfitAfterAll: { type: Type.NUMBER }
          },
          required: ["totalRevenue", "totalCogs", "totalDonations", "totalPlatformFees", "netProfitAfterAll"]
        }
      }
    });
    return JSON.parse(response.text);
  } catch { return { totalRevenue: 0, totalCogs: 0, totalDonations: 0, totalPlatformFees: 0, netProfitAfterAll: 0 }; }
}

export async function generateInvoiceNarrative(order: Order, nonprofit: Nonprofit) {
  const prompt = `Generate 1-sentence impact thank you for $${order.accounting.donationAmount.toFixed(2)} donated to ${nonprofit.name}.`;
  return await safeGenerate('gemini-2.0-flash', prompt, { temperature: 0.8 }) || "Thank you for being part of the circle.";
}

export async function generatePressRelease(nonprofitName: string, totalRaised: number, impactCount: number) {
  const prompt = `Write a compelling 300-word press release for ${nonprofitName} celebrating reaching $${totalRaised.toLocaleString()} in community funding via Good Circles.`;
  return await safeGenerate('gemini-2.0-flash', prompt, { temperature: 0.7 }) || "Failed to generate media kit.";
}

export async function generateTreasuryInsights(stats: TreasuryStats) {
  const prompt = `Analyze these Treasury metrics for the Good Circles community economy. Stats: ${JSON.stringify(stats)}.`;
  return await safeGenerate('gemini-2.0-flash', prompt, { temperature: 0.7 }) || "Treasury advisor currently analyzing.";
}
