import Link from "next/link";
import { desc, eq, ilike, or, and, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { formatMoney } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Orders" };
export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  "all",
  "pending",
  "paid",
  "fulfilled",
  "cancelled",
] as const;

const STATUS_BADGE: Record<
  string,
  "neutral" | "inStock" | "lowStock" | "outOfStock"
> = {
  pending: "lowStock",
  paid: "lowStock",
  fulfilled: "inStock",
  cancelled: "outOfStock",
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { status = "all", q = "" } = await searchParams;

  const conditions: SQL[] = [];
  if (status !== "all") {
    const validStatus = status as
      "pending" | "paid" | "fulfilled" | "cancelled";
    conditions.push(eq(orders.status, validStatus));
  }
  if (q.trim()) {
    const term = `%${q.trim()}%`;
    conditions.push(
      or(ilike(orders.guestEmail, term), ilike(orders.id, term))!,
    );
  }

  const rows = await db
    .select()
    .from(orders)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.createdAt))
    .limit(100);

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="font-display text-2xl text-brown-dark">Orders</h1>

        <form
          className="flex flex-wrap items-center gap-2"
          action="/admin/orders"
          method="get"
        >
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Search email or order #"
            className="h-9 w-56 rounded-md border border-beige-main bg-cream-light px-3 text-sm text-brown-dark placeholder:text-gray-main/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-main"
          />
          <select
            name="status"
            defaultValue={status}
            className="h-9 rounded-md border border-beige-main bg-cream-light px-2 text-sm text-brown-dark"
          >
            {STATUS_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="h-9 rounded-md bg-brown-dark px-4 text-sm text-cream-light hover:bg-brown-main"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-beige-main bg-cream-light">
        <table className="w-full text-sm">
          <thead className="bg-cream-muted text-left text-xs uppercase tracking-wide text-gray-main">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Placed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige-main/60">
            {rows.map((order) => (
              <tr key={order.id} className="hover:bg-cream-muted/50">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-medium text-brown-dark underline-offset-2 hover:underline"
                  >
                    #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gray-main">{order.guestEmail}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE[order.status] ?? "neutral"}>
                    {order.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-brown-dark">
                  {formatMoney(order.totalCents)}
                </td>
                <td className="px-4 py-3 text-gray-main">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-gray-main"
                >
                  No orders match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
