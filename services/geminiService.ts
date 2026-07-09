export * from './aiAuditService';
export * from './aiAdvisorService';
export * from './aiReportingService';

import { safeGenerate } from './_aiClient';

// SECURITY (compliance audit D2, 2026-07-09): this function must NEVER receive or
// echo a password / secret key. Passwords are stored only as bcrypt hashes and are
// unrecoverable by design; a recovery email confirms the request and points the
// member to a secure reset path — it never contains a credential, and no secret is
// ever sent to the LLM.
export async function generateRecoveryEmailContent(userEmail: string): Promise<string> {
  const prompt = `Write a secure account-recovery acknowledgement email for Good Circles.

Recipient email: ${userEmail}

Tone: Luxe, minimalist, professional — in the style of a premium fintech or luxury membership brand. Keep it brief: 3-4 sentences maximum. Plain text only, no HTML.

The email should:
1. Confirm we received a request to recover access to their account
2. State plainly that, for security, Good Circles never sends passwords by email — if the request was genuine they can reset access from the sign-in screen or reply to reach support
3. Advise them to ignore this message if they did not request it
Do NOT include any password, key, or secret of any kind.`;

  const result = await safeGenerate('claude', prompt, { temperature: 0.7 });
  return (
    result ||
    `Hello,\n\nWe received a request to recover access to the Good Circles account for ${userEmail}. ` +
      `For your security we never send passwords by email — if this was you, reset your access from the sign-in screen or reply to this message and our team will help. ` +
      `If you didn't request this, you can safely ignore it.\n\nWelcome back to the circle.`
  );
}
