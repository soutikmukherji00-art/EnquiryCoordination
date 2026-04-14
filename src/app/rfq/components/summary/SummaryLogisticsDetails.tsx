import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";

interface SummaryLogisticsDetailsProps {
  logisticProvider: string;
  transporter: string;
  transporterPaymentMode: string;
  bpShippedRate: string;
  totalTonnage: string;
  minLoadingGuarantee: string;
  baseShippingCharges: string;
  notionalShippingCharges: string;
}

export function SummaryLogisticsDetails({
  logisticProvider,
  transporter,
  transporterPaymentMode,
  bpShippedRate,
  totalTonnage,
  minLoadingGuarantee,
  baseShippingCharges,
  notionalShippingCharges,
}: SummaryLogisticsDetailsProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card px-4 shadow-sm md:px-5">
      <Accordion type="single" collapsible defaultValue="logistics-details">
        <AccordionItem value="logistics-details" className="border-b-0">
          <AccordionTrigger className="py-3 text-base font-semibold hover:no-underline">
            Logistics Details
          </AccordionTrigger>
          <AccordionContent>
            <dl className="grid gap-3 text-sm">
              <DetailRow label="Logistic Provider" value={logisticProvider} />
              <DetailRow label="Transporter" value={transporter} />
              <DetailRow label="Transporter Payment Mode" value={transporterPaymentMode} />
              <DetailRow label="BP Shipped Rate / MT" value={bpShippedRate} />
              <DetailRow label="Total Tonnage" value={totalTonnage} />
              <DetailRow label="Min Loading Guarantee" value={minLoadingGuarantee} />
              <DetailRow label="Base Shipping Charges" value={baseShippingCharges} />
              <DetailRow
                label="Notional Shipping Charges to Transporter"
                value={notionalShippingCharges}
              />
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[260px_minmax(0,1fr)] sm:items-center">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
