import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";

interface SummaryBuyerDetailsProps {
  buyerName: string;
  primaryContact: string;
  paymentTerms: string;
  notes?: string;
}

export function SummaryBuyerDetails({
  buyerName,
  primaryContact,
  paymentTerms,
  notes,
}: SummaryBuyerDetailsProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card px-4 shadow-sm md:px-5">
      <Accordion type="single" collapsible defaultValue="buyer-details">
        <AccordionItem value="buyer-details" className="border-b-0">
          <AccordionTrigger className="py-3 text-base font-semibold hover:no-underline">
            Buyer Details
          </AccordionTrigger>
          <AccordionContent>
            <dl className="grid gap-3 text-sm">
              <DetailRow label="Buyer Name" value={buyerName} />
              <DetailRow label="Primary Contact" value={primaryContact} />
              <DetailRow label="Payment Terms" value={paymentTerms} />
              <DetailRow label="Notes" value={notes?.trim() ? notes : "No additional notes"} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[140px_minmax(0,1fr)] sm:items-center">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
