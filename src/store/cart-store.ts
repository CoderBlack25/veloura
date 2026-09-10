/**
 * Client-side cart state (TRD Section 5.1).
 *
 * This store is intentionally NOT the source of truth for price or stock —
 * both are re-validated server-side in `addToCart` / `validateCart`
 * (src/app/actions/cart.ts) before anything is trusted at checkout. This
 * store just holds what the shopper has picked so the UI feels instant.
 *
 * Persisted to localStorage so a refresh doesn't lose the cart. If you
 * later need the cart readable during SSR (e.g. to render an accurate
 * count in the header before hydration), swap the `storage` option for a
 * small cookie-backed adapter instead — the shape of the store doesn't
 * need to change.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: string;
  sku: string;
  productName: string;
  formulation: string;
  packSize: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  quantity: number;
};

type CartState = {
  //Data (The actual state)
  items: CartItem[];
  isOpen: boolean;
  //Functions (Actions that modify that state)
  open: () => void;
  close: () => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),

      addItem: (item, quantity = 1) => {
        const existing = get().items.find(
          (i) => i.variantId === item.variantId,
        );
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId
                ? { ...i, quantity: i.quantity + quantity }
                : i,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity }] });
        }
      },

      updateQuantity: (variantId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.variantId === variantId ? { ...i, quantity } : i,
          ),
        });
      },

      removeItem: (variantId) => {
        set({ items: get().items.filter((i) => i.variantId !== variantId) });
      },

      clear: () => set({ items: [] }),
    }),
    {
      name: "veloura-cart",
      partialize: (state) => ({ items: state.items }), // don't persist isOpen
    },
  ),
);

export const selectItemCount = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

export const selectSubtotalCents = (state: CartState) =>
  state.items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
