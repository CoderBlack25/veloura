import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, inventory, products } from "@/db/schema";

export type VariantWithStock = {
  variantId: string;
  productId: string;
  productSlug: string;
  productName: string;
  sku: string;
  formulation: string;
  packSize: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  isActive: boolean;
  quantityOnHand: number;
  lowStockThreshold: number;
};

/** Single source of truth for "can this variant actually be purchased right now". */
export async function getVariantWithStock(
  variantId: string,
): Promise<VariantWithStock | null> {
  const rows = await db
    .select({
      variantId: productVariants.id,
      productId: productVariants.productId,
      productSlug: products.slug,
      productName: products.name,
      sku: productVariants.sku,
      formulation: productVariants.formulation,
      packSize: productVariants.packSize,
      priceCents: productVariants.priceCents,
      currency: productVariants.currency,
      imageUrls: productVariants.imageUrls,
      isActive: productVariants.isActive,
      quantityOnHand: inventory.quantityOnHand,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(eq(productVariants.id, variantId))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    ...row,
    imageUrl: row.imageUrls?.[0] ?? null,
    quantityOnHand: row.quantityOnHand ?? 0,
    lowStockThreshold: row.lowStockThreshold ?? 0,
  };
}

export async function getVariantsWithStock(
  variantIds: string[],
): Promise<VariantWithStock[]> {
  if (variantIds.length === 0) return [];

  const rows = await db
    .select({
      variantId: productVariants.id,
      productId: productVariants.productId,
      productSlug: products.slug,
      productName: products.name,
      sku: productVariants.sku,
      formulation: productVariants.formulation,
      packSize: productVariants.packSize,
      priceCents: productVariants.priceCents,
      currency: productVariants.currency,
      imageUrls: productVariants.imageUrls,
      isActive: productVariants.isActive,
      quantityOnHand: inventory.quantityOnHand,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(inArray(productVariants.id, variantIds));

  return rows.map((row) => ({
    ...row,
    imageUrl: row.imageUrls?.[0] ?? null,
    quantityOnHand: row.quantityOnHand ?? 0,
    lowStockThreshold: row.lowStockThreshold ?? 0,
  }));
}

export type CartValidationIssue = {
  variantId: string;
  reason: "not_found" | "inactive" | "insufficient_stock";
  availableStock?: number;
};

/**
 * Re-checks every line in a proposed cart against the database immediately
 * before checkout (TRD Section 5.1 — the client-side cart is never trusted
 * as the source of truth for availability).
 */
export async function validateCartItems(
  items: Array<{ variantId: string; quantity: number }>,
): Promise<{
  ok: boolean;
  issues: CartValidationIssue[];
  variants: VariantWithStock[];
}> {
  const variants = await getVariantsWithStock(items.map((i) => i.variantId));
  const byId = new Map(variants.map((v) => [v.variantId, v]));
  const issues: CartValidationIssue[] = [];

  for (const item of items) {
    const variant = byId.get(item.variantId);
    if (!variant) {
      issues.push({ variantId: item.variantId, reason: "not_found" });
      continue;
    }
    if (!variant.isActive) {
      issues.push({ variantId: item.variantId, reason: "inactive" });
      continue;
    }
    if (variant.quantityOnHand < item.quantity) {
      issues.push({
        variantId: item.variantId,
        reason: "insufficient_stock",
        availableStock: variant.quantityOnHand,
      });
    }
  }

  return { ok: issues.length === 0, issues, variants };
}
