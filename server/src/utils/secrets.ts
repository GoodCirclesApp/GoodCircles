// Centralized secret resolution with environment-aware fail-fast.
//
// SECURITY: signing secrets (JWT, HMAC for unsubscribe/QR tokens) must NEVER fall
// back to a hardcoded value in production — a known default makes every token
// forgeable (auth bypass, forged unsubscribe/QR-checkout tokens). At the same time
// a hard module-load throw would crash prod boot if the var is not yet set in the
// host (Railway). So the policy is:
//
//   - production (NODE_ENV === 'production'): a missing or obviously-weak secret is
//     FATAL. We log a loud error and throw, so the deploy fails fast and visibly
//     rather than silently shipping a forgeable-token vulnerability.
//   - non-production: fall back to a clearly-labeled dev value so local dev / tests
//     keep working without real secrets.
//
// DEPLOY NOTE: confirm the required vars are present in the host environment BEFORE
// shipping the production-fatal behavior (see requireSecret callers).

const isProd = process.env.NODE_ENV === 'production';

// Hardcoded defaults that must never be accepted as real secrets.
const KNOWN_WEAK = new Set([
  'default_secret',
  'default_refresh_secret',
  'dev-unsub-secret',
  'gc-qr-dev-secret',
  'secret',
  'changeme',
  'change-me',
  'password',
]);

function isWeak(value: string): boolean {
  return value.length < 16 || KNOWN_WEAK.has(value);
}

/**
 * Resolve a required signing secret.
 *
 * In production: throws (fail-fast) if the env var is missing or weak.
 * In non-production: returns `devFallback` (a clearly-labeled dev-only value) when
 * the env var is missing, so local dev and tests do not require real secrets.
 *
 * @param name        env var name, e.g. 'JWT_SECRET'
 * @param devFallback dev-only fallback used ONLY when NODE_ENV !== 'production'
 */
export function requireSecret(name: string, devFallback: string): string {
  const value = process.env[name];

  if (value && !isWeak(value)) return value;

  if (isProd) {
    const reason = value ? 'is set to a weak/default value' : 'is not set';
    // Loud, unambiguous boot-time error before the throw crashes the process.
    console.error(
      `[FATAL] Required secret ${name} ${reason}. ` +
      `Set a strong (>=16 char, non-default) value in the production environment. ` +
      `Refusing to start with a forgeable-token configuration.`
    );
    throw new Error(`Missing or weak required secret: ${name}`);
  }

  // Non-production: allow boot with a labeled dev secret.
  if (!value) {
    console.warn(`[secrets] ${name} not set — using dev fallback (NON-PRODUCTION only).`);
    return devFallback;
  }
  return value;
}
