import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, orderItems, productVariants, products } from "@/db/schema";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FulfillOrderForm } from "@/components/fulfill-order-form";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, id))
    .limit(1);
  if (!order) notFound();

  const items = await db
    .select({
      quantity: orderItems.quantity,
      unitPriceCents: orderItems.unitPriceCents,
      sku: productVariants.sku,
      formulation: productVariants.formulation,
      packSize: productVariants.packSize,
      productName: products.name,
    })
    .from(orderItems)
    .innerJoin(productVariants, eq(orderItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(orderItems.orderId, order.id));

  const address = order.shippingAddress;

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-brown-dark">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <Badge variant={order.status === "fulfilled" ? "inStock" : "lowStock"}>
          {order.status}
        </Badge>
      </div>
      <p className="mt-1 text-sm text-gray-main">
        {order.guestEmail} &middot; placed{" "}
        {new Date(order.createdAt).toLocaleString()}
      </p>

      <div className="mt-8 rounded-xl border border-beige-main bg-cream-light p-5">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wide text-gray-main">
          Items
        </h2>
        <div className="flex flex-col divide-y divide-beige-main/60">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between py-3 text-sm">
              <div>
                <p className="text-brown-dark">{item.productName}</p>
                <p className="text-gray-main">
                  {item.formulation}, {item.packSize} &middot; SKU {item.sku}{" "}
                  &middot; ×{item.quantity}
                </p>
              </div>
              <p className="text-brown-dark">
                {formatMoney(item.unitPriceCents * item.quantity)}
              </p>
            </div>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between text-gray-main">
            <span>Subtotal</span>
            <span>{formatMoney(order.subtotalCents)}</span>
          </div>
          <div className="flex justify-between text-gray-main">
            <span>Shipping</span>
            <span>{formatMoney(order.shippingCents)}</span>
          </div>
          <div className="flex justify-between text-gray-main">
            <span>Tax</span>
            <span>{formatMoney(order.taxCents)}</span>
          </div>
          <div className="flex justify-between font-medium text-brown-dark">
            <span>Total</span>
            <span>{formatMoney(order.totalCents)}</span>
          </div>
        </div>
      </div>

      {address && (
        <div className="mt-6 rounded-xl border border-beige-main bg-cream-light p-5">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-main">
            Shipping address
          </h2>
          <p className="text-sm text-brown-dark">
            {address.name}
            <br />
            {address.line1}
            {address.line2 ? (
              <>
                <br />
                {address.line2}
              </>
            ) : null}
            <br />
            {address.city}, {address.postalCode}
            <br />
            {address.country}
          </p>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-beige-main bg-cream-light p-5">
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-gray-main">
          Fulfillment
        </h2>
        {order.status === "fulfilled" ? (
          <p className="text-sm text-brown-dark">
            Shipped with tracking number{" "}
            <span className="font-medium">{order.trackingNumber}</span>
          </p>
        ) : order.status === "paid" ? (
          <FulfillOrderForm orderId={order.id} />
        ) : (
          <p className="text-sm text-gray-main">
            This order is currently &ldquo;{order.status}&rdquo; and isn&apos;t
            ready to fulfill.
          </p>
        )}
      </div>
    </div>
  );
}
