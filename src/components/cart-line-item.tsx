"use client";

import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { useCartStore, type CartItem } from "@/store/cart-store";
import { formatMoney } from "@/lib/format";

export function CartLineItem({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 py-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-cream-muted">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-[10px] text-gray-main">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-brown-dark">
              {item.productName}
            </p>
            <p className="text-xs text-gray-main">
              {item.formulation} &middot; {item.packSize}
            </p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.variantId)}
            className="rounded p-1 text-gray-main hover:bg-cream-muted hover:text-brown-dark"
            aria-label={`Remove ${item.productName} from cart`}
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-1 flex items-center justify-between">
          <div className="flex items-center rounded-md border border-beige-main">
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
              className="flex size-7 items-center justify-center text-brown-main hover:bg-cream-muted"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </button>
            <span className="w-6 text-center text-sm text-brown-dark">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
              className="flex size-7 items-center justify-center text-brown-main hover:bg-cream-muted"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
          <p className="text-sm font-medium text-brown-dark">
            {formatMoney(item.priceCents * item.quantity, item.currency)}
          </p>
        </div>
      </div>
    </div>
  );
}
