import { Badge } from "@/app/components/ui/badge";
import { cn } from "@/app/components/ui/utils";

interface SellerRfqBadgeProps {
  className?: string;
}

export function SellerRfqBadge({ className }: SellerRfqBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "mb-2 w-fit border-amber-300 bg-amber-50 text-[10px] font-semibold uppercase tracking-[0.12em] text-amber-700",
        className,
      )}
    >
      Seller RFQ
    </Badge>
  );
}
