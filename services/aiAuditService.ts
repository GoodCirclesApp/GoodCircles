import { safeGenerate, safeGenerateJSON } from './_aiClient';
import { Product } from '../types';

export async function verifyEntityIntegrity(name: string, taxId: string, role: string, website?: string) {
  const prompt = `You are a KYB (Know Your Business) verification assistant. Assess the legitimacy of this entity based on publicly available information.

Role: ${role}
Name: "${name}"
EIN/Tax ID: "${taxId}"
Website: "${website || 'Not provided'}"

Return a JSON object: { "verified": boolean, "note": string, "confidence": number (0-1), "riskFactors": string[] }

Base your assessment on whether the name, EIN format, and website are consistent and plausible for a legitimate ${role.toLowerCase()} entity.`;

  const result = await safeGenerateJSON('claude', prompt);
  return result || { verified: false, note: 'Verification service temporarily unavailable.', confidence: 0, riskFactors: ['Service Timeout'] };
}

export async function performCatalogIntegrityAudit(products: Product[]) {
  const data = products.map(p => ({ id: p.id, name: p.name, category: p.category, msrp: p.price }));
  const prompt = `You are a marketplace integrity auditor. Analyze this product catalog for MSRP inflation.

Context: Good Circles requires merchants to offer a 10% consumer discount. Some merchants may inflate their listed MSRP to offset this discount — detect that.

For each product, assess whether the price seems reasonable for its category based on your knowledge of typical retail prices.

Catalog: ${JSON.stringify(data)}

Return JSON: { "results": [ { "id": string, "status": "VERIFIED" | "FLAGGED", "reason": string, "marketAvg": number } ] }`;

  const result = await safeGenerateJSON('claude', prompt);
  return result || { results: products.map(p => ({ id: p.id, status: 'VERIFIED', reason: 'Audit timeout', marketAvg: p.price })) };
}

export async function moderateReview(text: string) {
  const prompt = `You are a content moderator for a community marketplace called Good Circles. Screen this user review for:
- Hate speech, harassment, or personal attacks
- Spam or promotional content
- Obscene or inappropriate content

Review text: "${text}"

Return JSON: { "approved": boolean, "reason": string }`;

  const result = await safeGenerateJSON('claude', prompt);
  return result || { approved: false, reason: 'Moderation service temporarily unavailable.' };
}

export async function auditMSRP(productName: string, category: string, msrp: number) {
  const prompt = `You are a pricing integrity auditor for a marketplace. Assess whether this product's MSRP is reasonable or inflated.

Product: "${productName}"
Category: "${category}"
Listed MSRP: $${msrp}

Based on your knowledge of typical retail prices for similar products, determine if this price is within normal market range or suspiciously high.

Return JSON: { "status": "VERIFIED" | "FLAGGED", "marketVariance": number (% difference from expected, negative = below market), "note": string }`;

  const result = await safeGenerateJSON('claude', prompt);
  return result || { status: 'VERIFIED', marketVariance: 0, note: 'Audit service temporarily unavailable.' };
}

export async function benchmarkCOGS(productName: string, category: string, cogs: number, salePrice: number) {
  const margin = salePrice > 0 ? ((salePrice - cogs) / salePrice * 100).toFixed(1) : '0';
  const prompt = `You are a cost-of-goods analyst. Assess whether this merchant's reported COGS is plausible.

Product: "${productName}"
Category: "${category}"
Reported COGS: $${cogs}
Sale Price: $${salePrice}
Implied Margin: ${margin}%

Assess if this COGS seems legitimate for the category, or if it appears artificially inflated (which would reduce platform fees and nonprofit share) or suspiciously low.

Return JSON: { "status": "VERIFIED" | "SUSPICIOUS", "note": string, "integrityScore": number (0-100, 100 = fully trusted) }`;

  const result = await safeGenerateJSON('claude', prompt);
  return result || { status: 'VERIFIED', note: 'Benchmarking service temporarily unavailable.', integrityScore: 100 };
}

export async function validateAddress(address: string, _userLocation?: { latitude: number; longitude: number }) {
  const prompt = `Parse and validate this address. Return what you can determine about its validity and approximate coordinates if it appears to be a real, specific address.

Address: "${address}"

Return plain text: confirm if it looks like a valid address, and if you can identify approximate latitude/longitude, include them as:
latitude: [value]
longitude: [value]`;

  try {
    const text = await safeGenerate('claude', prompt);
    const latMatch = text.match(/latitude:?\s*([-+]?\d*\.?\d+)/i);
    const lngMatch = text.match(/longitude:?\s*([-+]?\d*\.?\d+)/i);
    return {
      text,
      coords: latMatch && lngMatch
        ? { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[1]) }
        : null,
    };
  } catch {
    return null;
  }
}
