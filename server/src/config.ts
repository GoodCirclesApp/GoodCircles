import { z } from 'zod';
import { logger } from './utils/logger';

// Typed, validated view of the environment. Deliberately NON-FATAL: `config` is
// always usable (derived directly from process.env with safe fallbacks), and
// validateConfig() only logs warnings. Hard requirements for signing secrets stay
// enforced by utils/secrets.ts (requireSecret), which fail-fasts in production —
// this module must never be the thing that crashes boot.

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  PORT: z.coerce.number().int().positive().optional(),
  DATABASE_URL: z.string().min(1).optional(),
  JWT_SECRET: z.string().min(16).optional(),
  JWT_REFRESH_SECRET: z.string().min(16).optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  LANDING_URL: z.string().url().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  SENTRY_DSN: z.string().url().optional(),
  APP_URL: z.string().url().optional(),
});

export type AppEnv = z.infer<typeof EnvSchema>;

export const config = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  databaseUrl: process.env.DATABASE_URL,
  allowedOrigins: process.env.ALLOWED_ORIGINS,
  landingUrl: process.env.LANDING_URL,
  sentryDsn: process.env.SENTRY_DSN,
  appUrl: process.env.APP_URL,
};

// Runs once at boot; logs (does not throw) any env issues so they're visible in
// the deploy log without taking the server down.
export function validateConfig(): void {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    logger.warn('[config] environment validation warnings (non-fatal)', {
      issues: result.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
    });
  }
}
