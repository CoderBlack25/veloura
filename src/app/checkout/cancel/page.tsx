import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutCancelPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-3xl text-brown-dark">
        Checkout cancelled
      </h1>
      <p className="mt-3 text-gray-main">
        No charge was made. Your cart is still saved if you&apos;d like to pick
        up where you left off.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <Button asChild>
          <Link href="/products/baby-wipes">Back to cart</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/contact">Contact us</Link>
        </Button>
      </div>
    </div>
  );
}
