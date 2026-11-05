import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  DEFAULT_CURRENCY: z.string().length(3).default('USD'),
  QUOTE_TTL_MINUTES: z.coerce.number().default(15),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().optional(),
  PAYMENTS_MODE: z.enum(['stripe', 'simulated']).default('simulated'),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  SUPPLIER_MODE: z.enum(['live', 'sandbox', 'mock']).default('mock'),
  SUPPLIER_TIMEOUT_MS: z.coerce.number().default(8000),
  PROMO_CODES: z.string().default(''),
});

export type Env = z.infer<typeof EnvSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const parsed = EnvSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ');
    throw new Error(`Invalid environment configuration:\n  ${issues}`);
  }
  const env = parsed.data;
  if (env.PAYMENTS_MODE === 'stripe' && !env.STRIPE_SECRET_KEY) {
    throw new Error('PAYMENTS_MODE=stripe requires STRIPE_SECRET_KEY');
  }
  if (env.NODE_ENV === 'production' && env.PAYMENTS_MODE === 'simulated') {
    throw new Error('PAYMENTS_MODE=simulated is not allowed in production');
  }
  if (env.NODE_ENV === 'production' && env.SUPPLIER_MODE === 'mock') {
    // Mock suppliers + real payments would charge customers for rides nobody will drive.
    throw new Error('SUPPLIER_MODE=mock is not allowed in production — use live (or sandbox on staging with NODE_ENV=development)');
  }
  if (env.NODE_ENV === 'production' && env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production');
  }
  return env;
}

/** Reads SUPPLIER_<CODE>_<KEY> variables into a plain object, e.g. { BASE_URL, API_KEY }. */
export function supplierCredentials(code: string): Record<string, string> {
  const prefix = `SUPPLIER_${code.toUpperCase().replace(/[^A-Z0-9]/g, '_')}_`;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (k.startsWith(prefix) && v) out[k.slice(prefix.length)] = v;
  }
  return out;
}
