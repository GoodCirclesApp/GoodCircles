import { safeGenerate, safeGenerateJSON } from './_aiClient';
import { Order, Nonprofit, PayoutBatch, TreasuryStats, TaxAlphaMetrics } from '../types';

export async function generateBusinessInsights(orders: any[], role: 'MERCHANT' | 'NONPROFIT') {
  const prompt = `Analyze this transaction data for a Good Circles ${role.toLowerCase()} and provide actionable insights.

Focus on:
- Revenue trends and seasonality patterns
- Network effect ROI (how much value the ecosystem membership generates vs. traditional commerce)
- Top performing categories or offerings
- Specific recommendations to improve performance

Transaction data: ${JSON.stringify(orders)}`;

  return (await safeGenerate('claude', prompt, { temperature: 0.7 })) || 'Unable to generate insights at this time.';
}

export async function generateTaxAlphaAnalysis(metrics: TaxAlphaMetrics) {
  const prompt = `Perform a "Fiscal Arbitrage Analysis" for a merchant using the Good Circles ecosystem.

Explain concretely — with dollar figures where possible — how the combination of these factors makes every dollar earned internally more valuable than external commerce:
1. 3%+ merchant fee savings (internal wallet payments vs. card processors)
2. Built-in marketing through the ecosystem (10-15% marketing cost reduction)
3. Tax-deductible charitable donations routed automatically through every sale
4. Supply chain cost reductions through merchant-to-merchant sourcing

Merchant metrics: ${JSON.stringify(metrics)}

Be specific and persuasive — this analysis is used to help merchants understand the full ROI of their Good Circles membership.`;

  return (await safeGenerate('claude', prompt, { temperature: 0.7 })) || 'Tax Alpha analysis temporarily unavailable.';
}

export async function generateTaxStatement(orders: Order[], entityName: string, year: string) {
  const totalImpact = orders.reduce((sum, o) => sum + (o as any).accounting?.donationAmount ?? 0, 0);
  const prompt = `Draft a professional, IRS-compliant 501(c)(3) tax receipt summary letter.

Entity: ${entityName}
Fiscal Year: ${year}
Total Charitable Contributions Facilitated: $${totalImpact.toFixed(2)}

The letter should:
- Be formal and legally appropriate for tax documentation
- State that no goods or services were received in exchange for the donation portion
- Include standard IRS-compliant language for 501(c)(3) receipts
- Be ready to print and mail`;

  return (await safeGenerate('claude', prompt, { temperature: 0.2 })) || 'Tax statement drafting service temporarily unavailable.';
}

export async function generateBatchSettlementSummary(batch: PayoutBatch) {
  const prompt = `Write a 2-sentence executive summary for this Good Circles settlement batch.

Entity: ${batch.entityName}
Gross Settlement: $${batch.totalGross}
Community Impact Generated: $${batch.totalImpact}

Keep it professional, positive, and highlight both the financial settlement and the community impact.`;

  return (await safeGenerate('claude', prompt)) || 'Settlement period confirmed. Funds have been distributed to all parties.';
}

export async function generateAccountingReport(orders: any[]) {
  const prompt = `Summarize this order data into a financial accounting report.

Orders: ${JSON.stringify(orders)}

Return a JSON object with these exact keys:
{
  "totalRevenue": number,
  "totalCogs": number,
  "totalDonations": number,
  "totalPlatformFees": number,
  "netProfitAfterAll": number
}

Calculate each value by summing the relevant fields across all orders. netProfitAfterAll = totalRevenue - totalCogs - totalDonations - totalPlatformFees.`;

  const result = await safeGenerateJSON('claude', prompt);
  return result || { totalRevenue: 0, totalCogs: 0, totalDonations: 0, totalPlatformFees: 0, netProfitAfterAll: 0 };
}

export async function generateInvoiceNarrative(order: Order, nonprofit: Nonprofit) {
  const amount = (order as any).accounting?.donationAmount?.toFixed(2) ?? '0.00';
  const prompt = `Write a single warm, sincere sentence thanking a customer for the $${amount} that was automatically donated to ${nonprofit.name} through their Good Circles purchase. Keep it genuine and specific to the nonprofit's mission area if possible.`;

  return (await safeGenerate('claude', prompt, { temperature: 0.8 })) || 'Thank you for being part of the circle — your purchase made a difference today.';
}

export async function generatePressRelease(nonprofitName: string, totalRaised: number, impactCount: number) {
  const prompt = `Write a compelling 300-word press release for ${nonprofitName} celebrating a fundraising milestone achieved through the Good Circles community commerce platform.

Key facts to include:
- Total raised: $${totalRaised.toLocaleString()}
- Number of community members who contributed through their everyday shopping: ${impactCount}
- The "shop to give" mechanic: donors generated this funding simply by choosing ${nonprofitName} as their designated nonprofit and shopping at local Good Circles merchants — no extra donations required

Tone: celebratory, community-focused, inspiring. Include a compelling quote from a fictional nonprofit spokesperson. End with a call to action for readers to join Good Circles and select ${nonprofitName} as their cause.`;

  return (await safeGenerate('claude', prompt, { temperature: 0.7 })) || 'Press release generation temporarily unavailable.';
}

export async function generateTreasuryInsights(stats: TreasuryStats) {
  const prompt = `Analyze these treasury metrics for the Good Circles community economy and provide strategic insights.

Focus on:
- Health of the internal economy (capital velocity, retention rate)
- Whether current fee structures are sustainable and optimal
- Recommendations for treasury management
- Early warning indicators if any metrics are concerning

Treasury stats: ${JSON.stringify(stats)}`;

  return (await safeGenerate('claude', prompt, { temperature: 0.7 })) || 'Treasury analysis temporarily unavailable.';
}
