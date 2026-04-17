
import { safeGenerate } from './_aiClient';
import { Product, Order, Nonprofit } from "../types";

export async function getMerchantAdvisorResponse(userQuery: string, merchantProfile: any, currentProducts: Product[], allProducts: Product[], orders: Order[]) {
  const model = 'gemini-2.0-flash';
  const systemInstruction = `You are the Good Circles Merchant Advisor. Help business owners succeed. Data: ${JSON.stringify({profile: merchantProfile, products: currentProducts, orders: orders})}`;
  return await safeGenerate(model, userQuery, { systemInstruction, temperature: 0.7 }) || "Advisor currently recalibrating.";
}

export async function getNonprofitAdvisorResponse(userQuery: string, nonprofitProfile: Nonprofit, orders: Order[]) {
  const model = 'gemini-2.0-flash';
  const systemInstruction = `You are the Good Circles Impact Advisor. Help nonprofits maximize fundraising. Profile: ${JSON.stringify(nonprofitProfile)}`;
  return await safeGenerate(model, userQuery, { systemInstruction, temperature: 0.7 }) || "Advisor currently recalibrating.";
}

export async function getPersonalShopperResponse(
  userQuery: string, 
  orders: Order[], 
  availableProducts: Product[], 
  currentNonprofit: Nonprofit, 
  userLocation?: { lat: number, lng: number },
  walletBalance: number = 0
) {
  const model = 'gemini-2.0-flash';
  const systemInstruction = `You are the Good Circles Personal Shopper AI. 
  Current Wallet Balance: $${walletBalance.toFixed(2)}. 
  Context: Members save 10% on MSRP and pay only 0.5% internal fee using their Circle Balance (vs 3% on cards). 
  Goal: Help members maximize impact while reducing their living costs. 
  Location: ${JSON.stringify(userLocation)}`;
  return await safeGenerate(model, userQuery, { systemInstruction, temperature: 0.7 }) || "Shopper currently recalibrating.";
}
