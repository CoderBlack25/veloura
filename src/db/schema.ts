/**
 * Drizzle schema — mirrors TRD Section 4 (Data Model) exactly.
 *
 * Two identity domains, kept deliberately separate:
 *  - Customers never authenticate (guest checkout only, PRD Section 6.1) —
 *    they only ever appear as `guestEmail` on an order.
 *  - `adminUsers` / `adminSessions` / `adminAccounts` / `adminVerifications`
 *    are Better Auth's standard tables, renamed for this project so it's
 *    obvious at a glance that only internal staff ever sign in.
 *
 * Run `pnpm db:generate` after changing this file, then `pnpm db:migrate`.
 */
import { relations, sql } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "active",
  "archived",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
]);

export const adminRoleEnum = pgEnum("admin_role", ["admin", "staff"]);

// ---------------------------------------------------------------------------
// Commerce: products
// One row per product line. V1 has exactly one row — the table exists so
// "add a second product" is an INSERT, not a migration (TRD 4).
// ---------------------------------------------------------------------------
export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    status: productStatusEnum("status").notNull().default("draft"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("products_slug_idx").on(table.slug)],
);

// ---------------------------------------------------------------------------
// Commerce: product_variants
// One row per purchasable combination (formulation x pack size).
// ---------------------------------------------------------------------------
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sku: text("sku").notNull(),
    formulation: text("formulation").notNull(),
    packSize: text("pack_size").notNull(),
    priceCents: integer("price_cents").notNull(),
    currency: text("currency").notNull().default("EUR"),
    imageUrls: text("image_urls")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("product_variants_sku_idx").on(table.sku)],
);

// ---------------------------------------------------------------------------
// Commerce: inventory
// Split from product_variants so frequent stock writes don't lock/bloat
// the catalog table (TRD 4).
// ---------------------------------------------------------------------------
export const inventory = pgTable("inventory", {
  variantId: uuid("variant_id")
    .primaryKey()
    .references(() => productVariants.id, { onDelete: "cascade" }),
  quantityOnHand: integer("quantity_on_hand").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(20),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// ---------------------------------------------------------------------------
// Commerce: orders
// No customer account required — guestEmail is the only identity tied to
// the order at V1 (PRD FR-5.3 / TRD 6.1).
// ---------------------------------------------------------------------------
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    guestEmail: text("guest_email").notNull(),
    status: orderStatusEnum("status").notNull().default("pending"),
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    shippingAddress: jsonb("shipping_address").$type<{
      name: string;
      line1: string;
      line2?: string;
      city: string;
      postalCode: string;
      country: string;
    } | null>(),
    subtotalCents: integer("subtotal_cents").notNull(),
    shippingCents: integer("shipping_cents").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    trackingNumber: text("tracking_number"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("orders_stripe_pi_idx").on(table.stripePaymentIntentId),
  ],
);

// ---------------------------------------------------------------------------
// Commerce: order_items
// ---------------------------------------------------------------------------
export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  variantId: uuid("variant_id")
    .notNull()
    .references(() => productVariants.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  // Snapshotted at purchase time so later price changes don't rewrite history.
  unitPriceCents: integer("unit_price_cents").notNull(),
});

// ---------------------------------------------------------------------------
// Auth: admin_users / admin_sessions / admin_accounts / admin_verifications
// Standard Better Auth tables, mapped to project-specific names via the
// `schema` option on drizzleAdapter (see src/lib/auth.ts). Only internal
// staff ever have a row here.
// ---------------------------------------------------------------------------
export const adminUsers = pgTable(
  "admin_users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    role: adminRoleEnum("role").notNull().default("staff"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("admin_users_email_idx").on(table.email)],
);

export const adminSessions = pgTable(
  "admin_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => adminUsers.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("admin_sessions_token_idx").on(table.token)],
);

export const adminAccounts = pgTable("admin_accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at", {
    withTimezone: true,
  }),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
    withTimezone: true,
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const adminVerifications = pgTable("admin_verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ---------------------------------------------------------------------------
// Relations (used by Drizzle's relational query API, e.g. db.query.products.findMany)
// ---------------------------------------------------------------------------
export const productsRelations = relations(products, ({ many }) => ({
  variants: many(productVariants),
}));

export const productVariantsRelations = relations(
  productVariants,
  ({ one, many }) => ({
    product: one(products, {
      fields: [productVariants.productId],
      references: [products.id],
    }),
    inventory: one(inventory, {
      fields: [productVariants.id],
      references: [inventory.variantId],
    }),
    orderItems: many(orderItems),
  }),
);

export const inventoryRelations = relations(inventory, ({ one }) => ({
  variant: one(productVariants, {
    fields: [inventory.variantId],
    references: [productVariants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}));

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  sessions: many(adminSessions),
  accounts: many(adminAccounts),
}));

// ---------------------------------------------------------------------------
// Inferred types — import these anywhere you need the shape of a row.
// ---------------------------------------------------------------------------
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type ProductVariant = typeof productVariants.$inferSelect;
export type NewProductVariant = typeof productVariants.$inferInsert;
export type Inventory = typeof inventory.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type AdminUser = typeof adminUsers.$inferSelect;
