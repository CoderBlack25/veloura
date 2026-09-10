import { z } from "zod";

// One schema, used twice: react-hook-form validates it in the browser for
// instant feedback, and the Route Handler in api/checkout/session validates
// the same payload again server-side, because the client can never be
// trusted as the source of truth (TRD Section 7 — Security).
export const shippingAddressSchema = z.object({
  name: z.string().trim().min(2, "Enter the recipient's full name"),
  email: z.string().trim().email("Enter a valid email address"),
  line1: z.string().trim().min(3, "Enter a street address"),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1, "Enter a city"),
  postalCode: z.string().trim().min(3, "Enter a postal code"),
  country: z.string().trim().length(2, "Select a country"),
});
export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

export const cartLineSchema = z.object({
  variantId: z.string().uuid(),
  quantity: z.number().int().min(1).max(20),
});
export type CartLineInput = z.infer<typeof cartLineSchema>;

export const createCheckoutSessionSchema = z.object({
  items: z.array(cartLineSchema).min(1, "Your cart is empty"),
});
export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;

export const orderLookupSchema = z.object({
  email: z.string().trim().email("Enter the email used at checkout"),
  orderNumber: z
    .string()
    .trim()
    .min(8, "Order numbers are at least 8 characters")
    .transform((v) => v.toLowerCase()),
});
export type OrderLookupInput = z.infer<typeof orderLookupSchema>;

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email: z.string().trim().email("Enter a valid email address"),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (10 characters minimum)")
    .max(2000),
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;
