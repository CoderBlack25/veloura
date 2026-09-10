"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { orders, inventory } from "@/db/schema";
import { sendShippingConfirmationEmail } from "@/lib/email";
import { env } from "@/lib/env";

async function requireStaffSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("Not authenticated.");
  }
  return session;
}

async function requireAdminSession() {
  const session = await requireStaffSession();
  if (session.user.role !== "admin") {
    throw new Error("This action requires an admin account, not just staff.");
  }
  return session;
}

/**
 * PRD FR-7.3 — mark an order fulfilled and trigger the shipping email.
 * Available to both `staff` and `admin` roles.
 */
export async function markOrderFulfilled(
  orderId: string,
  trackingNumber: string,
) {
  await requireStaffSession();

  if (!trackingNumber.trim()) {
    return { ok: false as const, error: "Enter a tracking number." };
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId))
    .limit(1);
  if (!order) {
    return { ok: false as const, error: "Order not found." };
  }
  if (order.status !== "paid") {
    return {
      ok: false as const,
      error: `Order is currently "${order.status}" — only paid orders can be marked fulfilled.`,
    };
  }

  await db
    .update(orders)
    .set({ status: "fulfilled", trackingNumber: trackingNumber.trim() })
    .where(eq(orders.id, orderId));

  const orderLookupUrl = `${env.NEXT_PUBLIC_SITE_URL}/orders/lookup?order=${orderId}&email=${encodeURIComponent(order.guestEmail)}`;

  await sendShippingConfirmationEmail(order.guestEmail, {
    orderId: order.id,
    trackingNumber: trackingNumber.trim(),
    // Placeholder tracking URL — wire up to the real EasyPost/Shippo
    // tracking page format once a carrier account is connected (TRD 3.3).
    trackingUrl: `https://track.example.com/${encodeURIComponent(trackingNumber.trim())}`,
    orderLookupUrl,
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);

  return { ok: true as const };
}

/**
 * PRD FR-7.2 — manual stock-level adjustment. Restricted to `admin` only,
 * unlike fulfillment which any staff member can do.
 */
export async function adjustInventory(variantId: string, newQuantity: number) {
  await requireAdminSession();

  if (!Number.isInteger(newQuantity) || newQuantity < 0) {
    return {
      ok: false as const,
      error: "Enter a valid non-negative quantity.",
    };
  }

  await db
    .update(inventory)
    .set({ quantityOnHand: newQuantity })
    .where(eq(inventory.variantId, variantId));

  revalidatePath("/admin/inventory");
  revalidatePath("/products/[slug]", "page");

  return { ok: true as const };
}
