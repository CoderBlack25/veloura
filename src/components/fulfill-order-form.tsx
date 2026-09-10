"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { markOrderFulfilled } from "@/app/admin/actions";

export function FulfillOrderForm({ orderId }: { orderId: string }) {
  const [tracking, setTracking] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await markOrderFulfilled(orderId, tracking);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("Order marked fulfilled — shipping email sent.");
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1">
        <Label htmlFor="tracking">Tracking number</Label>
        <Input
          id="tracking"
          className="mt-1.5"
          value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          placeholder="e.g. 1Z999AA10123456784"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Marking fulfilled…" : "Mark fulfilled"}
      </Button>
    </form>
  );
}
