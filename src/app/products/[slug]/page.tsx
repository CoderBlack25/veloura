import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products, productVariants, inventory } from "@/db/schema";
import { IngredientPanel } from "@/components/ingredient-panel";
import { PurchasePanel } from "@/components/purchase-panel";
import { formatMoney } from "@/lib/format";
import type { VariantWithStock } from "@/lib/cart-service";

export const revalidate = 60; // ISR: price/stock changes show up within a minute without a full redeploy

async function getProductWithVariants(slug: string) {
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);
  if (!product || product.status !== "active") return null;

  const variantRows = await db
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      formulation: productVariants.formulation,
      packSize: productVariants.packSize,
      priceCents: productVariants.priceCents,
      currency: productVariants.currency,
      imageUrls: productVariants.imageUrls,
      isActive: productVariants.isActive,
      quantityOnHand: inventory.quantityOnHand,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(productVariants)
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id))
    .where(eq(productVariants.productId, product.id));

  const variants: VariantWithStock[] = variantRows
    .filter((v) => v.isActive)
    .map((v) => ({
      ...v,
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: v.imageUrls?.[0] ?? null,
      quantityOnHand: v.quantityOnHand ?? 0,
      lowStockThreshold: v.lowStockThreshold ?? 0,
    }));

  return { product, variants };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductWithVariants(slug);
  if (!data) return {};

  const fromPrice = Math.min(...data.variants.map((v) => v.priceCents));
  return {
    title: data.product.name,
    description: `${data.product.description} From ${formatMoney(fromPrice)}.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProductWithVariants(slug);
  if (!data) notFound();

  const { product, variants } = data;
  const fromPrice = Math.min(...variants.map((v) => v.priceCents));

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    offers: {
      "@type": "AggregateOffer",
      lowPrice: (fromPrice / 100).toFixed(2),
      priceCurrency: variants[0]?.currency ?? "EUR",
      offerCount: variants.length,
      availability: variants.some((v) => v.quantityOnHand > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div
          className="aspect-square rounded-2xl bg-cream-muted"
          aria-hidden="true"
        >
          {/* Product photography goes here — see TRD 3.2 (Cloudflare R2) for
              where images are hosted; imageUrl is already threaded through
              VariantWithStock, this placeholder just avoids a broken <Image>
              until real photography is uploaded. */}
        </div>

        <div>
          <h1 className="font-display text-3xl text-brown-dark sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-base text-gray-main">{product.description}</p>

          <div className="mt-8">
            <PurchasePanel variants={variants} />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <IngredientPanel />
      </div>
    </div>
  );
}
