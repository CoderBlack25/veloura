import { eq } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, inventory, products } from "@/db/schema";
import { StockBadge } from "@/components/stock-badge";
import { InventoryRow } from "@/components/inventory-row";

export const metadata = { title: "Inventory" };
export const dynamic = "force-dynamic";

export default async function AdminInventoryPage() {
  const rows = await db
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      formulation: productVariants.formulation,
      packSize: productVariants.packSize,
      productName: products.name,
      quantityOnHand: inventory.quantityOnHand,
      lowStockThreshold: inventory.lowStockThreshold,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .leftJoin(inventory, eq(inventory.variantId, productVariants.id));

  return (
    <div>
      <h1 className="font-display text-2xl text-brown-dark">Inventory</h1>
      <p className="mt-1 text-sm text-gray-main">
        Stock changes take effect immediately on the storefront (low-stock badge
        threshold is configured per variant when it&apos;s created).
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-beige-main bg-cream-light">
        <table className="w-full text-sm">
          <thead className="bg-cream-muted text-left text-xs uppercase tracking-wide text-gray-main">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Quantity on hand</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-main/60">
            {rows.map((row) => (
              <tr key={row.variantId}>
                <td className="px-4 py-3 text-gray-main">{row.sku}</td>
                <td className="px-4 py-3 text-brown-dark">
                  {row.productName} — {row.formulation}, {row.packSize}
                </td>
                <td className="px-4 py-3">
                  <StockBadge
                    quantityOnHand={row.quantityOnHand ?? 0}
                    lowStockThreshold={row.lowStockThreshold ?? 0}
                  />
                </td>
                <td className="px-4 py-3">
                  <InventoryRow
                    variantId={row.variantId}
                    quantityOnHand={row.quantityOnHand ?? 0}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
