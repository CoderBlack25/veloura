import { describe, it, expect } from "vitest";
import {
  shippingAddressSchema,
  cartLineSchema,
  createCheckoutSessionSchema,
  orderLookupSchema,
  contactFormSchema,
} from "@/lib/validations/checkout";

describe("cartLineSchema", () => {
  it("accepts a valid line", () => {
    const result = cartLineSchema.safeParse({
      variantId: "11111111-1111-4111-8111-111111111111",
      quantity: 2,
    });
    expect(result.success).toBe(true);
  });

  it("rejects a quantity above the per-line cap", () => {
    const result = cartLineSchema.safeParse({
      variantId: "11111111-1111-4111-8111-111111111111",
      quantity: 21,
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-UUID variantId", () => {
    const result = cartLineSchema.safeParse({
      variantId: "not-a-uuid",
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });
});

describe("createCheckoutSessionSchema", () => {
  it("rejects an empty cart", () => {
    const result = createCheckoutSessionSchema.safeParse({ items: [] });
    expect(result.success).toBe(false);
  });
});

describe("shippingAddressSchema", () => {
  it("requires a two-letter country code", () => {
    const base = {
      name: "Jane Doe",
      email: "jane@example.com",
      line1: "1 Main Street",
      city: "Dublin",
      postalCode: "D01AB12",
    };
    expect(
      shippingAddressSchema.safeParse({ ...base, country: "IE" }).success,
    ).toBe(true);
    expect(
      shippingAddressSchema.safeParse({ ...base, country: "Ireland" }).success,
    ).toBe(false);
  });
});

describe("orderLookupSchema", () => {
  it("lowercases the order number for prefix matching", () => {
    const result = orderLookupSchema.safeParse({
      email: "jane@example.com",
      orderNumber: "4F2A9C1D",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.orderNumber).toBe("4f2a9c1d");
    }
  });

  it("rejects an order number shorter than 8 characters", () => {
    const result = orderLookupSchema.safeParse({
      email: "jane@example.com",
      orderNumber: "1234",
    });
    expect(result.success).toBe(false);
  });
});

describe("contactFormSchema", () => {
  it("rejects a message that's too short", () => {
    const result = contactFormSchema.safeParse({
      name: "Jane",
      email: "jane@example.com",
      message: "too short",
    });
    expect(result.success).toBe(false);
  });
});
