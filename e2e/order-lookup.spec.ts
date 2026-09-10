import { test, expect } from "@playwright/test";

test.describe("order lookup", () => {
  test("rejects an unknown email/order combination without leaking which part was wrong", async ({
    page,
  }) => {
    await page.goto("/orders/lookup");

    await page.getByLabel("Email").fill("nobody@example.com");
    await page.getByLabel("Order number").fill("00000000");
    await page.getByRole("button", { name: "Track order" }).click();

    await expect(page.getByText("No matching order found.")).toBeVisible();
  });

  test("validates the form before submitting", async ({ page }) => {
    await page.goto("/orders/lookup");

    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Order number").fill("1234");
    await page.getByRole("button", { name: "Track order" }).click();

    await expect(
      page.getByText("Enter the email used at checkout"),
    ).toBeVisible();
    await expect(
      page.getByText("Order numbers are at least 8 characters"),
    ).toBeVisible();
  });

  // Requires a real paid order in the seeded database — run manually or
  // wire up a fixture that creates one via the Stripe test-mode flow first.
  test.skip("finds a real order and shows its items", async ({ page }) => {
    await page.goto("/orders/lookup");
    await page.getByLabel("Email").fill("jane@example.com");
    await page.getByLabel("Order number").fill("known-order-id-prefix");
    await page.getByRole("button", { name: "Track order" }).click();
    await expect(page.getByText(/^Order #/)).toBeVisible();
  });
});
