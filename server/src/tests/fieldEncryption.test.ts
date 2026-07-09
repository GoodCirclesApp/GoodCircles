import { describe, it, expect, beforeAll } from 'vitest';
import crypto from 'crypto';
import { encryptField, decryptField, last4, isEncryptionConfigured } from '../utils/fieldEncryption';

// Deterministic 32-byte key for the test run (never a real key).
beforeAll(() => {
  process.env.FIELD_ENCRYPTION_KEY = crypto.createHash('sha256').update('gc-test-key').digest('base64');
});

describe('fieldEncryption (AES-256-GCM)', () => {
  it('reports configured when a valid key is present', () => {
    expect(isEncryptionConfigured()).toBe(true);
  });

  it('round-trips a plaintext TIN', () => {
    const tin = '12-3456789';
    const enc = encryptField(tin);
    expect(enc.startsWith('v1:')).toBe(true);
    expect(enc).not.toContain(tin);
    expect(decryptField(enc)).toBe(tin);
  });

  it('produces a unique ciphertext each call (random IV)', () => {
    const a = encryptField('same');
    const b = encryptField('same');
    expect(a).not.toBe(b);
    expect(decryptField(a)).toBe('same');
    expect(decryptField(b)).toBe('same');
  });

  it('rejects a tampered envelope (auth tag mismatch)', () => {
    const enc = encryptField('secret');
    const parts = enc.split(':');
    // Flip a byte in the ciphertext.
    const ctBuf = Buffer.from(parts[3], 'base64');
    ctBuf[0] ^= 0xff;
    parts[3] = ctBuf.toString('base64');
    expect(() => decryptField(parts.join(':'))).toThrow();
  });

  it('rejects a malformed envelope', () => {
    expect(() => decryptField('not-a-valid-envelope')).toThrow();
  });

  it('last4 extracts trailing digits only', () => {
    expect(last4('12-3456789')).toBe('6789');
    expect(last4('•••• 4242')).toBe('4242');
  });
});
