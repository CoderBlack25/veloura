import { test, expect } from "@playwright/test";

/**
 * Exercises the primary purchase flow from PRD Section 8.1:
 * PDP -> add to cart -> cart drawer -> Stripe Checkout -> confirmation.
 *
 * Requires: the app running against a database seeded via `pnpm db:seed`
 * (so /products/baby-wipes has real variants and stock), and
 * STRIPE_SECRET_KEY pointed at a Stripe *test mode* key. Stripe's hosted
 * Checkout page is off-origin, so this test crosses over to stripe.com
 * before returning — that's expected, not a bug.
 */
test.describe("purchase flow", () => {
  test("adds a variant to cart and reaches Stripe Checkout", async ({
    page,
  }) => {
    await page.goto("/products/baby-wipes");

    await expect(
      page.getByRole("heading", { name: "Veloura Baby Wipes" }),
    ).toBeVisible();

    // Default selection is the first formulation/pack size — just add it.
    await page.getByRole("button", { name: "Add to cart" }).click();

    // Cart drawer opens automatically after a successful add.
    await expect(
      page.getByRole("heading", { name: "Your cart" }),
    ).toBeVisible();
    await expect(page.getByText("Veloura Baby Wipes")).toBeVisible();

    const [stripeRequest] = await Promise.all([
      page.waitForRequest((req) => req.url().includes("/api/checkout/session")),
      page.getByRole("button", { name: "Checkout" }).click(),
    ]);
    expect(stripeRequest.method()).toBe("POST");

    // Stripe Checkout is hosted off-origin — confirm we actually got
    // redirected there rather than shown an error toast.
    await page.waitForURL(/checkout\.stripe\.com/, { timeout: 15_000 });
  });

  test("shows an error toast instead of crashing when the cart is empty", async ({
    page,
  }) => {
    await page.goto("/products/baby-wipes");
    await page.getByRole("button", { name: /cart/i }).click();
    await expect(page.getByText("Your cart is empty.")).toBeVisible();
  });
});
