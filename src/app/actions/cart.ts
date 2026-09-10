"use server";

import { getVariantWithStock } from "@/lib/cart-service";

export type AddToCartResult =
  | {
      ok: true;
      variant: {
        variantId: string;
        productName: string;
        sku: string;
        formulation: string;
        packSize: string;
        priceCents: number;
        currency: string;
        imageUrl: string | null;
      };
      availableStock: number;
    }
  | { ok: false; error: string; availableStock?: number };

/**
 * Called from the client the moment someone clicks "Add to cart". Re-checks
 * the DB rather than trusting whatever stock number was rendered on the
 * page load, which might be stale if traffic sold through it in the
 * meantime (PRD FR-2.3 / FR-2.4).
 */
export async function addToCart(
  variantId: string,
  quantity: number,
): Promise<AddToCartResult> {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
    return { ok: false, error: "Choose a quantity between 1 and 20." };
  }

  const variant = await getVariantWithStock(variantId);

  if (!variant) {
    return { ok: false, error: "This item couldn't be found." };
  }
  if (!variant.isActive) {
    return { ok: false, error: "This item is no longer available." };
  }
  if (variant.quantityOnHand < quantity) {
    return {
      ok: false,
      error:
        variant.quantityOnHand === 0
          ? "This item is out of stock."
          : `Only ${variant.quantityOnHand} left in stock.`,
      availableStock: variant.quantityOnHand,
    };
  }

  return {
    ok: true,
    availableStock: variant.quantityOnHand,
    variant: {
      variantId: variant.variantId,
      productName: variant.productName,
      sku: variant.sku,
      formulation: variant.formulation,
      packSize: variant.packSize,
      priceCents: variant.priceCents,
      currency: variant.currency,
      imageUrl: variant.imageUrl,
    },
  };
}

/** Lightweight re-check used when the quantity stepper changes in the cart drawer. */
export async function checkStock(variantId: string): Promise<number> {
  const variant = await getVariantWithStock(variantId);
  return variant?.quantityOnHand ?? 0;
}
