export * from './aiAuditService';
export * from './aiAdvisorService';
export * from './aiReportingService';

import { safeGenerate } from './_aiClient';

export async function generateRecoveryEmailContent(userName: string, userEmail: string, userKey: string): Promise<string> {
  const prompt = `Write a secure account recovery email for Good Circles.

Recipient: ${userName} (${userEmail})
Recovery Key: ${userKey}

Tone: Luxe, minimalist, professional — in the style of a premium fintech or luxury membership brand. Keep it brief: 3-4 sentences maximum. Do not include any HTML — plain text only.

The email should:
1. Confirm this is their requested secure recovery key
2. Note the key should be kept private and not shared
3. Include one warm closing sentence reinforcing their Good Circles membership`;

  const result = await safeGenerate('claude', prompt, { temperature: 0.7 });
  return result || `Hello ${userName},\n\nYour Good Circles Secure Key is: ${userKey}\n\nPlease keep this key private. Welcome back to the circle.`;
}
