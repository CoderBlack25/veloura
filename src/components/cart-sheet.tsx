"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartLineItem } from "@/components/cart-line-item";
import {
  useCartStore,
  selectItemCount,
  selectSubtotalCents,
} from "@/store/cart-store";
import { formatMoney } from "@/lib/format";

const FREE_SHIPPING_THRESHOLD_CENTS = 3500;

export function CartSheet() {
  const isOpen = useCartStore((s) => s.isOpen);
  const open = useCartStore((s) => s.open);
  const close = useCartStore((s) => s.close);
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore(selectItemCount);
  const subtotalCents = useCartStore(selectSubtotalCents);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD_CENTS - subtotalCents,
  );

  async function handleCheckout() {
    if (items.length === 0) return;
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(
          data.error ??
            "Something went wrong. Please review your cart and try again.",
        );
        return;
      }
      window.location.href = data.url;
    } catch {
      toast.error("Couldn't reach checkout — please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={(v) => (v ? open() : close())}>
      <SheetTrigger asChild>
        <button
          type="button"
          className="relative flex items-center gap-1.5 rounded-md p-2 text-brown-dark hover:bg-cream-muted"
          aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
        >
          <ShoppingBag className="size-5" />
          {itemCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-green-main text-[10px] font-medium text-cream-light">
              {itemCount}
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent title="Your cart">
        <div className="flex items-center justify-between border-b border-beige-main px-5 py-4">
          <h2 className="font-display text-lg text-brown-dark">Your cart</h2>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <ShoppingBag className="size-8 text-beige-main" />
            <p className="text-sm text-gray-main">Your cart is empty.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={close}
              className="mt-2"
            >
              Continue browsing
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 divide-y divide-beige-main/60 overflow-y-auto px-5">
              {items.map((item) => (
                <CartLineItem key={item.variantId} item={item} />
              ))}
            </div>

            <div className="border-t border-beige-main px-5 py-4">
              {remainingForFreeShipping > 0 ? (
                <p className="mb-3 text-xs text-gray-main">
                  {formatMoney(remainingForFreeShipping)} away from free
                  shipping
                </p>
              ) : (
                <p className="mb-3 text-xs text-green-main">
                  You&apos;ve unlocked free shipping
                </p>
              )}

              <Separator className="mb-3" />

              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-main">Subtotal</span>
                <span className="text-base font-medium text-brown-dark">
                  {formatMoney(subtotalCents)}
                </span>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={handleCheckout}
                disabled={isCheckingOut}
              >
                {isCheckingOut ? "Redirecting to checkout…" : "Checkout"}
              </Button>
              <p className="mt-2 text-center text-[11px] text-gray-main">
                Shipping and tax calculated at checkout
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
