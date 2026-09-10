import Link from "next/link";
import { CircleCheck } from "lucide-react";
import { stripe } from "@/lib/stripe";
import { Button } from "@/components/ui/button";
import { formatMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  if (!session_id) {
    return <FallbackConfirmation />;
  }

  // Read straight from Stripe rather than our own DB — this page can load
  // before the webhook (the actual source of truth for order creation) has
  // finished processing, and the shopper shouldn't see a blank screen while
  // that race resolves.
  const session = await stripe.checkout.sessions
    .retrieve(session_id)
    .catch(() => null);

  if (!session || session.payment_status !== "paid") {
    return <FallbackConfirmation />;
  }

  const email = session.customer_details?.email ?? "";

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <CircleCheck className="mx-auto mb-5 size-12 text-green-main" />
      <h1 className="font-display text-3xl text-brown-dark">
        Thanks for your order
      </h1>
      <p className="mt-3 text-gray-main">
        A confirmation email is on its way to{" "}
        <span className="text-brown-dark">{email}</span>. We&apos;ll email you
        again the moment it ships.
      </p>

      <div className="mt-8 rounded-xl border border-beige-main bg-cream-soft p-6 text-left">
        <div className="flex justify-between text-sm">
          <span className="text-gray-main">Total paid</span>
          <span className="font-medium text-brown-dark">
            {formatMoney(
              session.amount_total ?? 0,
              session.currency?.toUpperCase() ?? "EUR",
            )}
          </span>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={`/orders/lookup?email=${encodeURIComponent(email)}`}>
            Track this order
          </Link>
        </Button>
      </div>
    </div>
  );
}

function FallbackConfirmation() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <CircleCheck className="mx-auto mb-5 size-12 text-green-main" />
      <h1 className="font-display text-3xl text-brown-dark">Order received</h1>
      <p className="mt-3 text-gray-main">
        We&apos;re confirming the details now — check your email in a moment for
        your order confirmation, or look it up directly below.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/">Continue shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/orders/lookup">Track an order</Link>
        </Button>
      </div>
    </div>
  );
}
