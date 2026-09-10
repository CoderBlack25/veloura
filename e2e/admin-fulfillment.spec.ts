import { test, expect } from "@playwright/test";

test.describe("admin access control", () => {
  test("redirects an unauthenticated visitor to the login page", async ({
    page,
  }) => {
    await page.goto("/admin/orders");
    await page.waitForURL(/\/admin\/login/);
    await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  });
});

test.describe("admin fulfillment flow", () => {
  // Requires SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from `pnpm db:seed` and
  // at least one order with status "paid" in the database.
  test.skip("signs in, opens an order, and marks it fulfilled", async ({
    page,
  }) => {
    await page.goto("/admin/login");
    await page
      .getByLabel("Email")
      .fill(process.env.SEED_ADMIN_EMAIL ?? "admin@veloura.com");
    await page
      .getByLabel("Password")
      .fill(process.env.SEED_ADMIN_PASSWORD ?? "change-me-immediately");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL(/\/admin\/orders/);
    await page.getByRole("link", { name: /^#/ }).first().click();

    await page.getByLabel("Tracking number").fill("1Z999AA10123456784");
    await page.getByRole("button", { name: "Mark fulfilled" }).click();

    await expect(page.getByText(/Shipped with tracking number/)).toBeVisible();
  });
});
