import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, productVariants, products } from "@/db/schema";
import { orderLookupSchema } from "@/lib/validations/checkout";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip =
    (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const { success } = await checkRateLimit("orderLookup", ip);
  if (!success) {
    return NextResponse.json(
      { error: "Too many attempts — please wait a moment and try again." },
      { status: 429 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = orderLookupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 },
    );
  }

  const { email, orderNumber } = parsed.data;

  // orderNumber as typed by the customer is the short form (first 8 chars
  // of the UUID, see emails) — match on the prefix rather than requiring
  // the full UUID. Guest order volume per email is small, so filtering the
  // prefix match in memory is simpler than a raw LIKE query.
  const allMatches = await db
    .select()
    .from(orders)
    .where(eq(orders.guestEmail, email));
  const found = allMatches.find((o) =>
    o.id.toLowerCase().startsWith(orderNumber),
  );

  if (!found) {
    // Deliberately generic — don't reveal whether the email or the order
    // number was the part that didn't match.
    return NextResponse.json(
      { error: "No matching order found." },
      { status: 404 },
    );
  }

  const items = await db
    .select({
      quantity: orderItems.quantity,
      unitPriceCents: orderItems.unitPriceCents,
      formulation: productVariants.formulation,
      packSize: productVariants.packSize,
      productName: products.name,
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(orderItems.orderId, found.id));

  return NextResponse.json({
    order: {
      id: found.id,
      shortId: found.id.slice(0, 8).toUpperCase(),
      status: found.status,
      trackingNumber: found.trackingNumber,
      totalCents: found.totalCents,
      createdAt: found.createdAt,
      items,
    },
  });
}
