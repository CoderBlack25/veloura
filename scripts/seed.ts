/**
 * Seeds the database with Veloura's V1 catalog (PRD Section 11.1
 * assumption: 2 formulations × 3 pack sizes) and creates the first admin
 * login so there's a way into /admin before any other tooling exists.
 *
 * Run with: pnpm db:seed
 *
 * Safe to re-run — it checks for the product by slug and the admin by
 * email before inserting, so it won't create duplicates.
 */
import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import {
  products,
  productVariants,
  inventory,
  adminUsers,
} from "../src/db/schema";
import { auth } from "../src/lib/auth";

const BOOTSTRAP_ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL ?? "admin@veloura.com";
const BOOTSTRAP_ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD ?? "change-me-immediately";

async function seedCatalog() {
  const [existing] = await db
    .select()
    .from(products)
    .where(eq(products.slug, "baby-wipes"))
    .limit(1);
  if (existing) {
    console.log(
      "✓ Product 'baby-wipes' already exists — skipping catalog seed.",
    );
    return;
  }

  const [product] = await db
    .insert(products)
    .values({
      slug: "baby-wipes",
      name: "Veloura Baby Wipes",
      description:
        "99% water, plant-derived ingredients, dermatologically tested. Two formulations, sized for however much you actually go through.",
      status: "active",
    })
    .returning();

  console.log(`✓ Created product: ${product.name} (${product.id})`);

  const variantDefs = [
    {
      formulation: "Fragrance-Free",
      packSize: "Single",
      sku: "PN-FF-1",
      priceCents: 450,
      stock: 200,
    },
    {
      formulation: "Fragrance-Free",
      packSize: "3-Pack",
      sku: "PN-FF-3",
      priceCents: 1150,
      stock: 150,
    },
    {
      formulation: "Fragrance-Free",
      packSize: "6-Pack",
      sku: "PN-FF-6",
      priceCents: 2100,
      stock: 100,
    },
    {
      formulation: "Aloe & Chamomile",
      packSize: "Single",
      sku: "PN-AC-1",
      priceCents: 450,
      stock: 200,
    },
    {
      formulation: "Aloe & Chamomile",
      packSize: "3-Pack",
      sku: "PN-AC-3",
      priceCents: 1150,
      stock: 150,
    },
    {
      formulation: "Aloe & Chamomile",
      packSize: "6-Pack",
      sku: "PN-AC-6",
      priceCents: 2100,
      stock: 100,
    },
  ];

  for (const def of variantDefs) {
    const [variant] = await db
      .insert(productVariants)
      .values({
        productId: product.id,
        sku: def.sku,
        formulation: def.formulation,
        packSize: def.packSize,
        priceCents: def.priceCents,
        currency: "EUR",
        imageUrls: [],
        isActive: true,
      })
      .returning();

    await db.insert(inventory).values({
      variantId: variant.id,
      quantityOnHand: def.stock,
      lowStockThreshold: 20,
    });

    console.log(
      `  ✓ ${def.sku} — ${def.formulation}, ${def.packSize} (${def.stock} in stock)`,
    );
  }
}

async function seedAdmin() {
  const [existing] = await db
    .select()
    .from(adminUsers)
    .where(eq(adminUsers.email, BOOTSTRAP_ADMIN_EMAIL))
    .limit(1);

  if (existing) {
    console.log(
      `✓ Admin account ${BOOTSTRAP_ADMIN_EMAIL} already exists — skipping.`,
    );
    return;
  }

  // Go through Better Auth's own sign-up path rather than hand-crafting a
  // password hash — it owns the hashing algorithm and we shouldn't
  // reimplement or guess at it here.
  await auth.api.signUpEmail({
    body: {
      email: BOOTSTRAP_ADMIN_EMAIL,
      password: BOOTSTRAP_ADMIN_PASSWORD,
      name: "Veloura Admin",
    },
  });

  // `role` is set to `input: false` in src/lib/auth.ts specifically so it
  // can't be set through the sign-up payload — promote to admin directly.
  await db
    .update(adminUsers)
    .set({ role: "admin" })
    .where(eq(adminUsers.email, BOOTSTRAP_ADMIN_EMAIL));

  console.log(`✓ Created admin account: ${BOOTSTRAP_ADMIN_EMAIL}`);
  console.log(
    `  Password: ${BOOTSTRAP_ADMIN_PASSWORD}  (change this immediately after first login)`,
  );
}

async function main() {
  console.log("Seeding Veloura database...\n");
  await seedCatalog();
  await seedAdmin();
  console.log("\nDone.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
