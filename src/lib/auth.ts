/**
 * Better Auth — internal staff login only (TRD Section 6.2).
 *
 * Customers never hit this: guest checkout doesn't create a session
 * anywhere. Every table this adapter touches is mapped to the
 * `admin_*`-prefixed tables in src/db/schema.ts so it's unambiguous in the
 * database itself that this is staff auth, not customer auth.
 *
 * After changing anything here, run `npx @better-auth/cli generate` and
 * diff the output against src/db/schema.ts — Better Auth's exact column
 * set can shift between versions, and that command is the authoritative
 * source of truth, not this file's comments.
 */
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import {
  adminUsers,
  adminSessions,
  adminAccounts,
  adminVerifications,
} from "@/db/schema";
import { env } from "@/lib/env";

export const auth = betterAuth({
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,

  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: adminUsers,
      session: adminSessions,
      account: adminAccounts,
      verification: adminVerifications,
    },
  }),

  // Staff sign in with email + password. Accounts are created by an existing
  // admin (see scripts/seed.ts for the first bootstrap account) — there is
  // no public sign-up page, intentionally.
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // flip on once Resend sending is wired up in prod
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh once per day of activity
    cookieCache: { enabled: true, maxAge: 5 * 60 },
  },

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "staff",
        input: false, // never settable from the client — only via direct DB/admin action
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
