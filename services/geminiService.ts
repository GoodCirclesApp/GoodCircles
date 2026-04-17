
export * from './aiAuditService';
export * from './aiAdvisorService';
export * from './aiReportingService';

import { safeGenerate } from './_aiClient';

export async function generateRecoveryEmailContent(userName: string, userEmail: string, userKey: string): Promise<string> {
  const model = 'gemini-2.0-flash';
  const prompt = `Compose recovery email for "Good Circles". Recipient: ${userName} (${userEmail}), Key: ${userKey}. Sentinel tone: Luxe, Minimalist, Professional.`;
  const result = await safeGenerate(model, prompt, { temperature: 0.7 });
  return result || `Hello ${userName}, your Good Circles Secure Key is: ${userKey}.`;
}
