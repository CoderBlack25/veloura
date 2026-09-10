# Veloura

The Veloura storefront and admin dashboard, built from `Veloura-PRD.docx`
and `Veloura-TRD.docx`. Single product line (baby wipes, 2 formulations ×
3 pack sizes), guest checkout, no customer accounts — architected so a
second product line is a database insert, not a rewrite. See the TRD for the
full reasoning behind every choice below.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · PostgreSQL + Drizzle
ORM · Better Auth (staff login only) · Stripe Checkout · Resend + React
Email · Zustand · TanStack Query · react-hook-form + Zod · Upstash Redis ·
Vitest · Playwright

## Getting started

```bash
pnpm install
cp .env.example .env.local   # fill in real values — see below
pnpm db:generate              # already run once; re-run after schema changes
pnpm db:push                  # or db:migrate, once DATABASE_URL points at a real DB
pnpm db:seed                  # creates the product catalog + first admin login
pnpm dev
```

Visit `http://localhost:3000` for the storefront and `/admin/login` for the
staff dashboard (credentials printed by `db:seed`).

### What you need before it actually runs end-to-end

This is a scaffold, not a deployed app — the following external services need
real accounts before the flows they power will work. Everything is coded
against them; nothing needs to be rewritten, just configured:

| Service                     | Used for                                                                   | Where to get it                                                 |
| --------------------------- | -------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Postgres (Neon or Supabase) | Everything — products, orders, admin auth                                  | neon.tech / supabase.com                                        |
| Stripe (test mode is fine)  | Checkout, tax                                                              | dashboard.stripe.com/test/apikeys                               |
| Stripe CLI                  | Forwarding webhooks to localhost in dev                                    | `stripe listen --forward-to localhost:3000/api/webhooks/stripe` |
| Resend                      | Order/shipping confirmation emails                                         | resend.com                                                      |
| Upstash Redis               | Rate limiting (optional locally — fails open, see `src/lib/rate-limit.ts`) | upstash.com                                                     |
| Cloudflare R2               | Product photography (PDP renders a placeholder until this is wired up)     | dash.cloudflare.com                                             |

Run `npx @better-auth/cli generate` after any change to `src/lib/auth.ts` and
diff it against `src/db/schema.ts` — see the comment at the top of that file
for why this matters.

## Project structure

```
src/
  app/                    # Routes (App Router)
    (storefront pages)    # /, /products/[slug], /cart via CartSheet, /checkout/*
    admin/
      login/               # NOT behind the auth-gated layout
      (dashboard)/         # orders, inventory — protected by layout.tsx
      actions.ts           # Server Actions, each re-checks session + role
    actions/               # Storefront Server Actions (cart, contact)
    api/
      auth/[...all]/       # Better Auth catch-all
      checkout/session/    # Creates the Stripe Checkout Session
      webhooks/stripe/     # Source of truth for order creation
      orders/lookup/       # Guest order status lookup
  components/
    ui/                    # Hand-built shadcn-style primitives (Button, Sheet, etc.)
    (feature components)   # cart-sheet, purchase-panel, ingredient-panel, ...
  db/
    schema.ts              # Drizzle schema — start here to understand the data model
    index.ts                # DB client singleton
  lib/
    cart-service.ts         # Shared stock/price lookup — used by both the
                             # addToCart action and the checkout route, so
                             # there's exactly one place that logic lives
    auth.ts / auth-client.ts
    stripe.ts / email.ts / rate-limit.ts / env.ts
    validations/            # Zod schemas, shared between client forms and API routes
  store/
    cart-store.ts           # Zustand — client cart state, never the source of truth for price/stock
  proxy.ts                  # Next.js 16's renamed middleware — cheap redirect only,
                             # NOT the real auth check (see file comment for why)
emails/                    # React Email templates (pnpm email:dev to preview)
scripts/seed.ts            # Product catalog + first admin account
drizzle/                   # Generated SQL migrations — do not hand-edit
e2e/                        # Playwright specs
```

## How checkout actually works

This tripped me up once while building it, so it's worth spelling out:

1. `CartSheet` posts the cart to `/api/checkout/session`, which **re-validates
   price and stock server-side** (never trusts the client) and creates a
   Stripe Checkout Session. The cart contents are stashed in the session's
   `metadata`, not written to the database yet.
2. Stripe hosts the actual payment page. Nothing in this app's database
   changes at this point — a customer could close the tab and nothing is
   left behind.
3. Stripe calls `/api/webhooks/stripe` when payment succeeds. **This
   handler is the only place an `orders` row gets created.** It's idempotent
   (checks for an existing order by Stripe session ID first), decrements
   inventory, and sends the confirmation email.
4. `/checkout/success` reads the Stripe session directly (not the database)
   so the confirmation page doesn't race the webhook.

## Commands

| Command                     | What it does                                           |
| --------------------------- | ------------------------------------------------------ |
| `pnpm dev`                  | Local dev server                                       |
| `pnpm build` / `pnpm start` | Production build / run                                 |
| `pnpm typecheck`            | `tsc --noEmit`                                         |
| `pnpm lint`                 | ESLint                                                 |
| `pnpm test`                 | Vitest unit tests                                      |
| `pnpm test:e2e`             | Playwright — requires a running app + seeded DB        |
| `pnpm db:generate`          | Generate a migration from `src/db/schema.ts`           |
| `pnpm db:push`              | Push schema directly (fast iteration in dev)           |
| `pnpm db:migrate`           | Apply generated migrations (use this in production)    |
| `pnpm db:studio`            | Drizzle's DB browser GUI                               |
| `pnpm db:seed`              | Insert the launch catalog + first admin                |
| `pnpm email:dev`            | Preview email templates (react-email's own dev server) |

## Verified before delivery

`pnpm typecheck`, `pnpm lint`, and `pnpm test` (19 tests) all pass, and
`pnpm build` produces a clean production build — confirmed in this exact
repo, not just "should work." A few real bugs were caught and fixed in the
process (wrong Stripe API field name for shipping details on the pinned
`2026-06-24.dahlia` version, a missing `"use client"` on `Button` that broke
Radix's `Slot` in a Server Component tree, a couple of type-narrowing
issues).

## Deliberately out of scope (see PRD Section 6.2 / TRD Section 9)

Customer accounts, subscriptions, site search, and a real CMS integration
(the About/FAQ copy in `src/lib/content.ts` is a stand-in — swap it for
Sanity/Payload queries when that's provisioned, the page components don't
need to change). Don't build these until the roadmap in PRD Section 10 says
it's time.
