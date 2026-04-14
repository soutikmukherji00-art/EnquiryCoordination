import { ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import type { DirectOrderSummaryData } from "@/app/rfq/direct-order.flow";

interface CmReviewOrderSummaryPageProps {
  summaryData: DirectOrderSummaryData;
  assignedCmName: string;
  onBack: () => void;
  onEditLineItems: () => void;
  onAssignSeller: () => void;
}

export function CmReviewOrderSummaryPage({
  summaryData,
  assignedCmName,
  onBack,
  onEditLineItems,
  onAssignSeller,
}: CmReviewOrderSummaryPageProps) {
  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4 px-4 py-5 md:px-6">
        <Button variant="ghost" size="sm" className="w-fit gap-1.5 px-2" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back
        </Button>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-xl">CM Review Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <section className="rounded-xl border border-border/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Line Items</h3>
                <Button variant="outline" size="sm" onClick={onEditLineItems}>
                  Edit
                </Button>
              </div>
              <div className="space-y-2">
                {summaryData.lineItems.map((item, index) => (
                  <div key={`${item.name || item.category}-${index}`} className="rounded-lg border border-border/50 p-3">
                    <p className="text-sm font-semibold text-foreground">{item.name || item.category}</p>
                    <p className="text-xs text-muted-foreground">
                      Quantity: {item.quantity || "TBD"} · Category: {item.category || "General"}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-border/60 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Seller Details</h3>
                <Button variant="outline" size="sm" onClick={onAssignSeller}>
                  Assign Seller / Edit
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <InfoField label="Assigned CM" value={assignedCmName} />
                <InfoField label="Buyer Account" value={summaryData.buyerAccount} />
                <InfoField label="Payment Terms" value={summaryData.paymentTerms} />
                <InfoField label="INCOTERMS" value={summaryData.incoterms} />
              </div>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value || "—"}</p>
    </div>
  );
}
