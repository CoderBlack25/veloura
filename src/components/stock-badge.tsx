import { Badge } from "@/components/ui/badge";

export function StockBadge({
  quantityOnHand,
  lowStockThreshold,
}: {
  quantityOnHand: number;
  lowStockThreshold: number;
}) {
  if (quantityOnHand <= 0) {
    return <Badge variant="outOfStock">Out of stock</Badge>;
  }
  if (quantityOnHand <= lowStockThreshold) {
    return <Badge variant="lowStock">Only {quantityOnHand} left</Badge>;
  }
  return <Badge variant="inStock">In stock</Badge>;
}
