import { Button } from "@/app/components/ui/button";

interface SummaryPriceCardProps {
  itemsSales: number;
  itemsPurchase: number;
  transporterCharges: number;
  todPercent: number;
  grossMarginPercent: number;
  totalOrderValue: number;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function SummaryPriceCard({
  itemsSales,
  itemsPurchase,
  transporterCharges,
  todPercent,
  grossMarginPercent,
  totalOrderValue,
  onConfirm,
  isSubmitting = false,
}: SummaryPriceCardProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card p-4 shadow-sm md:sticky md:top-4 md:p-5">
      <h2 className="text-base font-semibold">Price Summary</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <PriceRow label="Items Sales" value={formatCurrency(itemsSales)} />
        <PriceRow label="Items Purchase" value={formatCurrency(itemsPurchase)} />
        <PriceRow label="Transporter Charges" value={formatCurrency(transporterCharges)} />
        <PriceRow label="TOD (%)" value={`${todPercent.toFixed(2)}%`} />
        <PriceRow label="Gross Margin (%)" value={`${grossMarginPercent.toFixed(2)}%`} />
      </dl>

      <div className="my-4 border-t border-border/60" />

      <PriceRow
        label="Total Order Value"
        value={formatCurrency(totalOrderValue)}
        className="text-base font-semibold"
      />

      <Button className="mt-5 w-full" onClick={onConfirm} disabled={isSubmitting}>
        {isSubmitting ? "Confirming..." : "Confirm for Order"}
      </Button>
    </section>
  );
}

function PriceRow({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className ?? ""}`}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
