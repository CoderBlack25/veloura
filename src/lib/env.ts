/**
 * Validates process.env once at startup instead of letting a missing key
 * surface as a confusing runtime error three layers deep in a Server Action.
 * Import `env` instead of reading `process.env` directly anywhere else.
 */
import { z } from "zod";

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(1, "BETTER_AUTH_SECRET is required"),
  BETTER_AUTH_URL: z.url().default("http://localhost:3000"),

  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is required"),

  // Upstash Redis (rate limiting + caching)
  UPSTASH_REDIS_REST_URL: z.url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET: z.string().optional(),
  R2_PUBLIC_URL: z.url().optional(),

  // Email
  RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  EMAIL_FROM: z.email().default("orders@veloura.com"),
  SUPPORT_EMAIL: z.email().default("hello@veloura.com"),

  // Shipping
  EASYPOST_API_KEY: z.string().optional(),
  SHIPPO_API_KEY: z.string().optional(),

  // Site
  NEXT_PUBLIC_SITE_URL: z.url().default("http://localhost:3000"),

  // Observability
  SENTRY_DSN: z.url().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.url().default("https://us.i.posthog.com"),
});

function loadEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "\u274c Invalid environment variables:",
      z.flattenError(parsed.error).fieldErrors,
    );
    throw new Error(
      "Invalid environment variables — see the list above, and check .env.local.",
    );
  }
  return parsed.data;
}

// In test environments we don't want to hard-crash module import just
// because Stripe/Resend keys aren't set — Vitest sets NODE_ENV=test.
export const env =
  process.env.NODE_ENV === "test"
    ? (process.env as unknown as z.infer<typeof envSchema>)
    : loadEnv();
