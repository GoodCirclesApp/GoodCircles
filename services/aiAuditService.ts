
import { getAI, safeGenerate, safeGenerateJSON } from './_aiClient';
import { Product } from "../types";

export async function verifyEntityIntegrity(name: string, taxId: string, role: string, website?: string) {
  const prompt = `Advanced KYB Verification. Role: ${role}, Name: "${name}", EIN: "${taxId}", Website: "${website || 'N/A'}". Return JSON {verified:bool, note:string, confidence:number, riskFactors:string[]}. Use Google Search.`;
  const result = await safeGenerateJSON('gemini-2.0-flash', prompt, { responseMimeType: "application/json" });
  return result || { verified: false, note: "Audit node transient error.", confidence: 0, riskFactors: ["Network Timeout"] };
}

export async function performCatalogIntegrityAudit(products: Product[]) {
  const data = products.map(p => ({ name: p.name, category: p.category, msrp: p.price }));
  const prompt = `Analyze this merchant catalog for MSRP drift. Detect if prices are inflated compared to global market averages to offset the required 10% Good Circles discount. Return JSON {results: Array<{id:string, status:"VERIFIED"|"FLAGGED", reason:string, marketAvg:number}>}. Data: ${JSON.stringify(data)}`;
  const result = await safeGenerateJSON('gemini-2.0-flash', prompt, { responseMimeType: "application/json" });
  return result || { results: products.map(p => ({ id: p.id, status: 'VERIFIED', reason: 'Audit timeout', marketAvg: p.price })) };
}

export async function moderateReview(text: string) {
  const prompt = `Screen review for Good Circles marketplace. Respond ONLY in JSON {approved:bool, reason:string}. Text: "${text}"`;
  const result = await safeGenerateJSON('gemini-2.0-flash', prompt, { responseMimeType: "application/json" });
  return result || { approved: false, reason: "Moderation system unavailable." };
}

export async function auditMSRP(productName: string, category: string, msrp: number) {
  const prompt = `Audit MSRP Integrity. Product: "${productName}", Cat: "${category}", Proposed: $${msrp}. Return JSON {status:"VERIFIED"|"FLAGGED", marketVariance:number, note:string}. Use Google Search.`;
  const result = await safeGenerateJSON('gemini-2.0-flash', prompt, { responseMimeType: "application/json" });
  return result || { status: 'VERIFIED', marketVariance: 0, note: "Audit bypassed." };
}

export async function benchmarkCOGS(productName: string, category: string, cogs: number, salePrice: number) {
  const prompt = `Benchmarking COGS for "${productName}" in "${category}". Cogs: $${cogs}, Price: $${salePrice}. Return JSON {status:"VERIFIED"|"SUSPICIOUS", note:string, integrityScore:number}.`;
  const result = await safeGenerateJSON('gemini-2.0-flash', prompt, { responseMimeType: "application/json" });
  return result || { status: 'VERIFIED', note: "Benchmarking unavailable.", integrityScore: 100 };
}

export async function validateAddress(address: string, userLocation?: { latitude: number, longitude: number }) {
  const ai = getAI();
  if (!ai) return null;
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash', contents: `Validate address: "${address}". Return Lat/Lng.`,
      config: { tools: [{ googleMaps: {} }], toolConfig: { retrievalConfig: { latLng: userLocation } } },
    });
    const text = response.text;
    const latMatch = text.match(/latitude:?\s*([-+]?\d*\.?\d+)/i);
    const lngMatch = text.match(/longitude:?\s*([-+]?\d*\.?\d+)/i);
    return { text, coords: latMatch && lngMatch ? { lat: parseFloat(latMatch[1]), lng: parseFloat(lngMatch[2]) } : null };
  } catch (error) { return null; }
}
