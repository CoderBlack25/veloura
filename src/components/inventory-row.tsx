"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { adjustInventory } from "@/app/admin/actions";

export function InventoryRow({
  variantId,
  quantityOnHand,
}: {
  variantId: string;
  quantityOnHand: number;
}) {
  const [value, setValue] = useState(String(quantityOnHand));
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const isDirty = value !== String(quantityOnHand);

  function handleSave() {
    const parsed = Number(value);
    startTransition(async () => {
      const result = await adjustInventory(variantId, parsed);
      if (!result.ok) {
        toast.error(result.error);
        setValue(String(quantityOnHand));
        return;
      }
      toast.success("Stock updated.");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="h-9 w-24"
      />
      <Button
        size="sm"
        variant="outline"
        disabled={!isDirty || isPending}
        onClick={handleSave}
      >
        {isPending ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
