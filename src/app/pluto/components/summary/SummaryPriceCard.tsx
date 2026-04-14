import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card";

interface SummaryPriceCardProps {
  itemsSales: number;
  itemsPurchase: number;
  transporterCharges: number;
  todPercent: number;
  grossMarginPercent: number;
  totalOrderValue: number;
  confirmSubmitting?: boolean;
  onConfirm: () => void;
}

const formatCurrency = (value: number) => `\u20B9${Math.round(value).toLocaleString("en-IN")}`;

interface PriceRowProps {
  label: string;
  value: string;
  isTotal?: boolean;
}

function PriceRow({ label, value, isTotal = false }: PriceRowProps) {
  return (
    <div className={`flex items-center justify-between ${isTotal ? "pt-2" : ""}`}>
      <p className={`text-sm ${isTotal ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{label}</p>
      <p className={`text-sm ${isTotal ? "font-semibold text-foreground" : "font-medium text-foreground"}`}>{value}</p>
    </div>
  );
}

export function SummaryPriceCard({
  itemsSales,
  itemsPurchase,
  transporterCharges,
  todPercent,
  grossMarginPercent,
  totalOrderValue,
  confirmSubmitting = false,
  onConfirm,
}: SummaryPriceCardProps) {
  return (
    <Card className="gap-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Price Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <PriceRow label="Items Sales" value={formatCurrency(itemsSales)} />
        <PriceRow label="Items Purchase" value={formatCurrency(itemsPurchase)} />
        <PriceRow label="Transporter Charges" value={formatCurrency(transporterCharges)} />
        <PriceRow label="TOD (%)" value={`${todPercent.toFixed(2)}%`} />
        <PriceRow label="Gross Margin (%)" value={`${grossMarginPercent.toFixed(2)}%`} />
        <div className="border-t border-border/60 pt-2">
          <PriceRow label="Total Order Value" value={formatCurrency(totalOrderValue)} isTotal />
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={onConfirm} disabled={confirmSubmitting}>
          {confirmSubmitting ? "Confirming..." : "Confirm for Order"}
        </Button>
      </CardFooter>
    </Card>
  );
}
