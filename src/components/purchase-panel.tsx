"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StockBadge } from "@/components/stock-badge";
import { formatMoney } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";
import { addToCart } from "@/app/actions/cart";
import type { VariantWithStock } from "@/lib/cart-service";

export function PurchasePanel({ variants }: { variants: VariantWithStock[] }) {
  const formulations = useMemo(
    () => Array.from(new Set(variants.map((v) => v.formulation))),
    [variants],
  );
  const [formulation, setFormulation] = useState(formulations[0]);

  const packSizesForFormulation = useMemo(
    () => variants.filter((v) => v.formulation === formulation),
    [variants, formulation],
  );
  const [packSize, setPackSize] = useState(
    packSizesForFormulation[0]?.packSize,
  );

  const selectedVariant = useMemo(
    () =>
      variants.find(
        (v) => v.formulation === formulation && v.packSize === packSize,
      ),
    [variants, formulation, packSize],
  );

  const [isPending, startTransition] = useTransition();
  const cartAddItem = useCartStore((s) => s.addItem);
  const cartOpen = useCartStore((s) => s.open);

  function handleFormulationChange(next: string) {
    setFormulation(next);
    const stillValid = variants.find(
      (v) => v.formulation === next && v.packSize === packSize,
    );
    if (!stillValid) {
      const fallback = variants.find((v) => v.formulation === next)?.packSize;
      if (fallback) setPackSize(fallback);
    }
  }

  function handleAddToCart() {
    if (!selectedVariant) return;

    startTransition(async () => {
      const result = await addToCart(selectedVariant.variantId, 1);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      cartAddItem(
        {
          variantId: result.variant.variantId,
          sku: result.variant.sku,
          productName: result.variant.productName,
          formulation: result.variant.formulation,
          packSize: result.variant.packSize,
          priceCents: result.variant.priceCents,
          currency: result.variant.currency,
          imageUrl: result.variant.imageUrl,
        },
        1,
      );
      toast.success(`${result.variant.productName} added to your cart`);
      cartOpen();
    });
  }

  if (!selectedVariant) return null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="mb-2 text-sm font-medium text-brown-dark">Formulation</p>
        <div className="flex flex-wrap gap-2">
          {formulations.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => handleFormulationChange(f)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                f === formulation
                  ? "border-brown-dark bg-brown-dark text-cream-light"
                  : "border-beige-main bg-transparent text-brown-main hover:border-brown-main"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-brown-dark">Pack size</p>
        <div className="flex flex-wrap gap-2">
          {packSizesForFormulation.map((v) => (
            <button
              key={v.variantId}
              type="button"
              onClick={() => setPackSize(v.packSize)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                v.packSize === packSize
                  ? "border-brown-dark bg-brown-dark text-cream-light"
                  : "border-beige-main bg-transparent text-brown-main hover:border-brown-main"
              }`}
            >
              {v.packSize}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="font-display text-2xl text-brown-dark">
          {formatMoney(selectedVariant.priceCents, selectedVariant.currency)}
        </p>
        <StockBadge
          quantityOnHand={selectedVariant.quantityOnHand}
          lowStockThreshold={selectedVariant.lowStockThreshold}
        />
      </div>

      <Button
        size="lg"
        onClick={handleAddToCart}
        disabled={isPending || selectedVariant.quantityOnHand <= 0}
      >
        {selectedVariant.quantityOnHand <= 0
          ? "Out of stock"
          : isPending
            ? "Adding…"
            : "Add to cart"}
      </Button>
    </div>
  );
}
