import { OrderLookupForm } from "@/components/order-lookup-form";

export const metadata = { title: "Track your order" };

export default async function OrderLookupPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; order?: string }>;
}) {
  const { email, order } = await searchParams;

  return (
    <OrderLookupForm
      defaultEmail={email}
      defaultOrderNumber={order ? order.slice(0, 8) : undefined}
    />
  );
}
