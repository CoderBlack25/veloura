/**
 * Rate limiting (TRD 7 — "checkout session creation and order-lookup
 * endpoints rate-limited per IP via Upstash Redis to prevent abuse and
 * card-testing attacks").
 *
 * Gracefully no-ops if Upstash env vars aren't set, so local development
 * doesn't require a Redis instance just to click "add to cart". Do not
 * deploy to production without UPSTASH_REDIS_REST_URL / _TOKEN set — see
 * .env.example.
 */
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

function makeLimiter(requests: number, window: `${number} ${"s" | "m" | "h"}`) {
  if (!redis) return null;
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
  });
}

// Checkout session creation: generous enough for real retries, tight enough
// to blunt card-testing bots hammering the endpoint.
const checkoutLimiter = makeLimiter(10, "1 m");

// Order lookup: guards against enumerating order numbers against a list of
// emails (or vice versa).
const orderLookupLimiter = makeLimiter(5, "1 m");

export async function checkRateLimit(
  limiter: "checkout" | "orderLookup",
  identifier: string,
): Promise<{ success: boolean; remaining: number }> {
  const instance =
    limiter === "checkout" ? checkoutLimiter : orderLookupLimiter;

  if (!instance) {
    // No Redis configured (e.g. local dev) — fail open rather than blocking
    // every request, but this is logged loudly so it's never silently true
    // in a deployed environment.
    if (process.env.NODE_ENV === "production") {
      console.warn(
        `[rate-limit] ${limiter} limiter has no Redis configured in production`,
      );
    }
    return { success: true, remaining: Infinity };
  }

  const { success, remaining } = await instance.limit(identifier);
  return { success, remaining };
}
