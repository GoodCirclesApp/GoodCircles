import crypto from 'crypto';

/**
 * Application-layer field encryption for highly-sensitive at-rest values — most
 * importantly tax identifiers (W-9 / TIN / SSN-as-EIN) captured in Phase 4 tax
 * scaffolding. AES-256-GCM (authenticated encryption) so tampering is detectable.
 *
 * Key: `FIELD_ENCRYPTION_KEY`, a 32-byte key provided as base64 or hex. In
 * production the key MUST be set (see requireEncryptionKey); there is deliberately
 * NO insecure fallback for real secrets. The encrypted string is self-describing:
 *   v1:<iv_b64>:<authTag_b64>:<ciphertext_b64>
 * so the format can evolve without ambiguity.
 *
 * This module has no database dependency. Persisting encrypted values requires the
 * held tax migration (docs/HELD-MIGRATION-tax-scaffolding.md); until that is
 * applied, this is the ready-to-use crypto primitive with unit-testable behavior.
 */

const VERSION = 'v1';
const ALGO = 'aes-256-gcm';
const IV_BYTES = 12; // GCM standard nonce length

function loadKey(): Buffer | null {
  const raw = process.env.FIELD_ENCRYPTION_KEY;
  if (!raw) return null;
  // Accept base64 or hex; must decode to exactly 32 bytes.
  let key: Buffer;
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    key = Buffer.from(raw, 'hex');
  } else {
    key = Buffer.from(raw, 'base64');
  }
  if (key.length !== 32) {
    throw new Error('FIELD_ENCRYPTION_KEY must decode to exactly 32 bytes (256-bit).');
  }
  return key;
}

/** Throws in production if the key is missing/invalid; used by callers that must not proceed without encryption. */
export function requireEncryptionKey(): Buffer {
  const key = loadKey();
  if (!key) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FIELD_ENCRYPTION_KEY is required in production to store tax identifiers.');
    }
    throw new Error('FIELD_ENCRYPTION_KEY is not set.');
  }
  return key;
}

export function isEncryptionConfigured(): boolean {
  try {
    return !!loadKey();
  } catch {
    return false;
  }
}

/** Encrypt a UTF-8 plaintext into the self-describing v1 envelope. */
export function encryptField(plaintext: string): string {
  const key = requireEncryptionKey();
  const iv = crypto.randomBytes(IV_BYTES);
  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${VERSION}:${iv.toString('base64')}:${tag.toString('base64')}:${ct.toString('base64')}`;
}

/** Decrypt a v1 envelope back to UTF-8 plaintext. Throws if tampered or malformed. */
export function decryptField(envelope: string): string {
  const key = requireEncryptionKey();
  const parts = (envelope || '').split(':');
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw new Error('Unrecognized encrypted field format.');
  }
  const iv = Buffer.from(parts[1], 'base64');
  const tag = Buffer.from(parts[2], 'base64');
  const ct = Buffer.from(parts[3], 'base64');
  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
}

/**
 * Non-reversible last-4 helper for display (e.g. "•••••1234") — safe to store
 * alongside the ciphertext for UI without decrypting. Strips non-digits first.
 */
export function last4(value: string): string {
  const digits = (value || '').replace(/\D/g, '');
  return digits.slice(-4);
}
