import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { validateCartItems } from "@/lib/cart-service";
import { createCheckoutSessionSchema } from "@/lib/validations/checkout";
import { checkRateLimit } from "@/lib/rate-limit";
import { env } from "@/lib/env";

/**
 * Deliberately does NOT create the `orders` row here. Not every Checkout
 * Session that's started gets paid, and Stripe — not the browser — is the
 * source of truth for whether money actually moved. The order is created
 * in the webhook handler (checkout.session.completed), keyed off the cart
 * snapshot we stash in session metadata. See src/app/api/webhooks/stripe.
 */
export async function POST(request: Request) {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const { success } = await checkRateLimit("checkout", ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many requests — please wait a moment and try again." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createCheckoutSessionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { items } = parsed.data;

  // Re-validate price and stock server-side — never trust cart totals
  // computed in the browser (TRD Section 5.1).
  const { ok, issues, variants } = await validateCartItems(items);
  if (!ok) {
    return NextResponse.json(
      {
        error: "Some items in your cart have changed. Please review your cart.",
        issues,
      },
      { status: 409 },
    );
  }

  const variantById = new Map(variants.map((v) => [v.variantId, v]));

  // Compact cart snapshot for the webhook to re-derive the order from.
  // Stripe metadata values are capped at 500 characters — fine for the
  // handful of line items a wipes order will ever contain, but if this
  // ever needs to support large multi-line B2B carts, move this to a
  // short-lived DB row keyed by session id instead.
  const cartSnapshot = JSON.stringify(
    items.map((i) => ({ v: i.variantId, q: i.quantity })),
  );

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: items.map((item) => {
      const variant = variantById.get(item.variantId)!;
      return {
        quantity: item.quantity,
        price_data: {
          currency: variant.currency.toLowerCase(),
          unit_amount: variant.priceCents,
          product_data: {
            name: `${variant.productName} — ${variant.formulation}, ${variant.packSize}`,
            images: variant.imageUrl ? [variant.imageUrl] : undefined,
            metadata: { variantId: variant.variantId, sku: variant.sku },
          },
        },
      };
    }),
    shipping_address_collection: {
      // Extend as Veloura opens new shipping markets — keep in sync with
      // PRD Section 11 (launch market assumption: EU/EUR).
      allowed_countries: ["IE", "NL", "DE", "FR", "BE", "ES", "IT", "PT", "AT"],
    },
    automatic_tax: { enabled: true },
    metadata: { cartItems: cartSnapshot },
    success_url: `${env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
  });

  return NextResponse.json({ url: session.url });
}
