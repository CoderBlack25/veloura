"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  orderLookupSchema,
  type OrderLookupInput,
} from "@/lib/validations/checkout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatMoney } from "@/lib/format";

type OrderResult = {
  id: string;
  shortId: string;
  status: string;
  trackingNumber: string | null;
  totalCents: number;
  createdAt: string;
  items: Array<{
    quantity: number;
    unitPriceCents: number;
    formulation: string;
    packSize: string;
    productName: string;
  }>;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Processing",
  paid: "Processing",
  fulfilled: "Shipped",
  cancelled: "Cancelled",
};

export function OrderLookupForm({
  defaultEmail,
  defaultOrderNumber,
}: {
  defaultEmail?: string;
  defaultOrderNumber?: string;
}) {
  const [result, setResult] = useState<OrderResult | null>(null);
  const [notFoundMessage, setNotFoundMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrderLookupInput>({
    resolver: zodResolver(orderLookupSchema),
    defaultValues: {
      email: defaultEmail ?? "",
      orderNumber: defaultOrderNumber ?? "",
    },
  });

  async function onSubmit(values: OrderLookupInput) {
    setNotFoundMessage(null);
    setResult(null);
    const res = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (!res.ok) {
      setNotFoundMessage(data.error ?? "No matching order found.");
      return;
    }
    setResult(data.order);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-14 sm:px-6">
      <h1 className="font-display text-3xl text-brown-dark">
        Track your order
      </h1>
      <p className="mt-2 text-sm text-gray-main">
        Enter the email you checked out with and your order number — no account
        needed.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-4"
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            className="mt-1.5"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <Label htmlFor="orderNumber">Order number</Label>
          <Input
            id="orderNumber"
            placeholder="e.g. 4F2A9C1D"
            className="mt-1.5"
            {...register("orderNumber")}
          />
          {errors.orderNumber && (
            <p className="mt-1 text-xs text-destructive">
              {errors.orderNumber.message}
            </p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? "Looking up…" : "Track order"}
        </Button>
      </form>

      {notFoundMessage && (
        <p className="mt-6 rounded-md bg-cream-muted p-3 text-sm text-brown-main">
          {notFoundMessage}
        </p>
      )}

      {result && (
        <div className="mt-8 rounded-xl border border-beige-main bg-cream-soft p-5">
          <div className="flex items-center justify-between">
            <p className="font-medium text-brown-dark">
              Order #{result.shortId}
            </p>
            <span className="rounded-full bg-green-main/15 px-2.5 py-1 text-xs font-medium text-green-main">
              {STATUS_LABEL[result.status] ?? result.status}
            </span>
          </div>

          <Separator className="my-4" />

          <ul className="flex flex-col gap-2">
            {result.items.map((item, i) => (
              <li key={i} className="flex justify-between text-sm">
                <span className="text-gray-main">
                  {item.productName} — {item.formulation}, {item.packSize} ×{" "}
                  {item.quantity}
                </span>
                <span className="text-brown-dark">
                  {formatMoney(item.unitPriceCents * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <Separator className="my-4" />

          <div className="flex justify-between text-sm font-medium">
            <span className="text-brown-dark">Total</span>
            <span className="text-brown-dark">
              {formatMoney(result.totalCents)}
            </span>
          </div>

          {result.trackingNumber && (
            <p className="mt-4 text-xs text-gray-main">
              Tracking number:{" "}
              <span className="text-brown-dark">{result.trackingNumber}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
