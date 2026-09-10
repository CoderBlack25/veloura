import { describe, it, expect, beforeEach } from "vitest";
import {
  useCartStore,
  selectItemCount,
  selectSubtotalCents,
} from "@/store/cart-store";

const wipesFF: Parameters<
  ReturnType<typeof useCartStore.getState>["addItem"]
>[0] = {
  variantId: "11111111-1111-4111-8111-111111111111",
  sku: "PN-FF-3",
  productName: "Veloura Baby Wipes",
  formulation: "Fragrance-Free",
  packSize: "3-Pack",
  priceCents: 1150,
  currency: "EUR",
  imageUrl: null,
};

const wipesAC: typeof wipesFF = {
  ...wipesFF,
  variantId: "22222222-2222-4222-8222-222222222222",
  sku: "PN-AC-3",
  formulation: "Aloe & Chamomile",
};

beforeEach(() => {
  useCartStore.setState({ items: [], isOpen: false });
});

describe("cart store", () => {
  it("adds a new line item", () => {
    useCartStore.getState().addItem(wipesFF, 1);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(selectItemCount(useCartStore.getState())).toBe(1);
  });

  it("merges quantity when the same variant is added twice", () => {
    useCartStore.getState().addItem(wipesFF, 1);
    useCartStore.getState().addItem(wipesFF, 2);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it("keeps different variants as separate lines", () => {
    useCartStore.getState().addItem(wipesFF, 1);
    useCartStore.getState().addItem(wipesAC, 1);
    expect(useCartStore.getState().items).toHaveLength(2);
  });

  it("computes subtotal across mixed quantities", () => {
    useCartStore.getState().addItem(wipesFF, 2);
    useCartStore.getState().addItem(wipesAC, 1);
    expect(selectSubtotalCents(useCartStore.getState())).toBe(3450);
  });

  it("removes the line item entirely when quantity drops to zero", () => {
    useCartStore.getState().addItem(wipesFF, 1);
    useCartStore.getState().updateQuantity(wipesFF.variantId, 0);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it("removeItem drops only the targeted variant", () => {
    useCartStore.getState().addItem(wipesFF, 1);
    useCartStore.getState().addItem(wipesAC, 1);
    useCartStore.getState().removeItem(wipesFF.variantId);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().items[0].variantId).toBe(wipesAC.variantId);
  });
});
