import { shippingReturnsContent } from "@/lib/content";

export const metadata = { title: "Shipping & Returns" };

export default function ShippingReturnsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.2em] text-green-main">
        Policies
      </p>
      <h1 className="font-display text-4xl text-brown-dark">Shipping & Returns</h1>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-brown-dark">Shipping</h2>
        <dl className="mt-5 flex flex-col gap-4">
          {shippingReturnsContent.shipping.map((row) => (
            <div key={row.label} className="flex flex-col gap-1 border-b border-beige-main/60 pb-4 sm:flex-row sm:justify-between">
              <dt className="text-sm font-medium text-brown-dark">{row.label}</dt>
              <dd className="text-sm text-gray-main sm:max-w-sm sm:text-right">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl text-brown-dark">Returns</h2>
        <ul className="mt-5 flex flex-col gap-3">
          {shippingReturnsContent.returns.map((line, i) => (
            <li key={i} className="flex gap-3 text-sm text-gray-main">
              <span className="mt-1 size-1.5 shrink-0 rounded-full bg-green-main" />
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
