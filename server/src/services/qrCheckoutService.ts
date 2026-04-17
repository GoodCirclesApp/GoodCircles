import { prisma } from '../lib/prisma';
import { createHmac, randomBytes } from 'crypto';

const QR_SECRET = process.env.QR_HMAC_SECRET ?? 'gc-qr-dev-secret';
const TOKEN_TTL_MS = 5 * 60 * 1000; // 5 minutes

function signPayload(userId: string, expiresAt: number): string {
  return createHmac('sha256', QR_SECRET)
    .update(`${userId}:${expiresAt}`)
    .digest('hex');
}

export class QrCheckoutService {
  // Generate a short-lived QR token for the consumer.
  // Returns the raw token string (encode as QR on the frontend).
  static async generateToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS);
    const nonce = randomBytes(8).toString('hex');
    const sig = signPayload(userId, expiresAt.getTime());
    const tokenHash = `${nonce}.${sig}`;

    await prisma.qrCheckoutToken.create({
      data: { userId, tokenHash, expiresAt },
    });

    // Token format: base64(userId:nonce:sig) — easy to decode on merchant scanner
    const raw = Buffer.from(`${userId}:${nonce}:${sig}`).toString('base64url');
    return { token: raw, expiresAt };
  }

  // Validate and consume a QR token. Returns the userId on success.
  static async consumeToken(rawToken: string): Promise<string> {
    let decoded: string;
    try {
      decoded = Buffer.from(rawToken, 'base64url').toString('utf8');
    } catch {
      throw new Error('Invalid QR token format');
    }

    const parts = decoded.split(':');
    if (parts.length !== 3) throw new Error('Invalid QR token format');
    const [userId, nonce, sig] = parts;

    const record = await prisma.qrCheckoutToken.findUnique({
      where: { tokenHash: `${nonce}.${sig}` },
    });

    if (!record) throw new Error('QR token not found or already used');
    if (record.usedAt) throw new Error('QR token has already been used');
    if (new Date() > record.expiresAt) throw new Error('QR token has expired');
    if (record.userId !== userId) throw new Error('QR token user mismatch');

    await prisma.qrCheckoutToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return userId;
  }
}
