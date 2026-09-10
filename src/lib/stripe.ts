import Stripe from "stripe";
import { env } from "@/lib/env";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  // Pin the API version explicitly so a Stripe account-level default change
  // never silently alters webhook payload shapes under us. Check
  // https://docs.stripe.com/api/versioning for the current value before
  // bumping this — Stripe ships backward-compatible monthly releases under
  // the same codename, and a new codename whenever there's a breaking change.
  apiVersion: "2026-06-24.dahlia",
  typescript: true,
});
