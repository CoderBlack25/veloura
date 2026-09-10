import { NextResponse } from "next/server";
import Stripe from "stripe";
import { eq, sql } from "drizzle-orm";
import { stripe } from "@/lib/stripe";
import { db } from "@/db";
import { orders, orderItems, inventory } from "@/db/schema";
import { getVariantsWithStock } from "@/lib/cart-service";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { formatMoney } from "@/lib/format";
import { env } from "@/lib/env";

// Stripe needs the raw request body to verify the signature — do not
// JSON.parse this yourself or the signature check will fail.
export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    console.error("[stripe webhook] signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await handleCheckoutCompleted(
        event.data.object as Stripe.Checkout.Session,
      );
      break;
    default:
      // Intentionally ignore everything else — Stripe sends dozens of
      // event types this app doesn't need to react to.
      break;
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  // Idempotency: Stripe may deliver the same event more than once. If an
  // order already exists for this Checkout Session, there's nothing left
  // to do — without this check a retried webhook would double-decrement
  // inventory and send a second confirmation email.
  const [existing] = await db
    .select({ id: orders.id })
    .from(orders)
    .where(eq(orders.stripePaymentIntentId, session.id))
    .limit(1);
  if (existing) return;

  if (session.payment_status !== "paid") return;

  const guestEmail = session.customer_details?.email;
  if (!guestEmail) {
    console.error(
      "[stripe webhook] session completed with no customer email",
      session.id,
    );
    return;
  }

  let cartItems: Array<{ v: string; q: number }> = [];
  try {
    cartItems = JSON.parse(session.metadata?.cartItems ?? "[]");
  } catch {
    console.error("[stripe webhook] unparsable cartItems metadata", session.id);
    return;
  }
  if (cartItems.length === 0) return;

  // Re-derive current price/name from the database for the order record —
  // consistent with what the customer was actually charged, since nothing
  // else can change those variant prices between session creation and
  // completion in the current (single-admin) system.
  const variants = await getVariantsWithStock(cartItems.map((i) => i.v));
  const variantById = new Map(variants.map((v) => [v.variantId, v]));

  const subtotalCents = cartItems.reduce((sum, i) => {
    const variant = variantById.get(i.v);
    return sum + (variant?.priceCents ?? 0) * i.q;
  }, 0);
  const totalCents = session.amount_total ?? subtotalCents;
  const taxCents = session.total_details?.amount_tax ?? 0;
  const shippingCents = session.total_details?.amount_shipping ?? 0;

  const shippingDetails = session.collected_information?.shipping_details;

  const [order] = await db
    .insert(orders)
    .values({
      guestEmail,
      status: "paid",
      stripePaymentIntentId: session.id,
      subtotalCents,
      shippingCents,
      taxCents,
      totalCents,
      shippingAddress: shippingDetails
        ? {
            name: shippingDetails.name ?? "",
            line1: shippingDetails.address?.line1 ?? "",
            line2: shippingDetails.address?.line2 ?? undefined,
            city: shippingDetails.address?.city ?? "",
            postalCode: shippingDetails.address?.postal_code ?? "",
            country: shippingDetails.address?.country ?? "",
          }
        : null,
    })
    .returning();

  await db.insert(orderItems).values(
    cartItems.map((item) => ({
      orderId: order.id,
      variantId: item.v,
      quantity: item.q,
      unitPriceCents: variantById.get(item.v)?.priceCents ?? 0,
    })),
  );

  // Decrement inventory, floored at 0 so a race condition can never push
  // stock negative.
  for (const item of cartItems) {
    await db
      .update(inventory)
      .set({
        quantityOnHand: sql`GREATEST(${inventory.quantityOnHand} - ${item.q}, 0)`,
      })
      .where(eq(inventory.variantId, item.v));
  }

  const orderLookupUrl = `${env.NEXT_PUBLIC_SITE_URL}/orders/lookup?order=${order.id}&email=${encodeURIComponent(guestEmail)}`;

  await sendOrderConfirmationEmail(guestEmail, {
    orderId: order.id,
    customerEmail: guestEmail,
    items: cartItems.map((item) => {
      const variant = variantById.get(item.v);
      return {
        name: variant?.productName ?? "Veloura Baby Wipes",
        variantLabel: variant
          ? `${variant.formulation}, ${variant.packSize}`
          : `Qty ${item.q}`,
        quantity: item.q,
        lineTotalFormatted: formatMoney(
          (variant?.priceCents ?? 0) * item.q,
          "EUR",
        ),
      };
    }),
    subtotalFormatted: formatMoney(subtotalCents, "EUR"),
    shippingFormatted: formatMoney(shippingCents, "EUR"),
    taxFormatted: formatMoney(taxCents, "EUR"),
    totalFormatted: formatMoney(totalCents, "EUR"),
    shippingAddress: {
      name: shippingDetails?.name ?? "",
      line1: shippingDetails?.address?.line1 ?? "",
      line2: shippingDetails?.address?.line2 ?? undefined,
      city: shippingDetails?.address?.city ?? "",
      postalCode: shippingDetails?.address?.postal_code ?? "",
      country: shippingDetails?.address?.country ?? "",
    },
    orderLookupUrl,
  });
}
