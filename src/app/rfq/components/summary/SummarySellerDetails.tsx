import type { ReactNode } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";

interface SummarySellerDetailsProps {
  sellerAssigned: string;
  sellerWarehouse: string;
  paymentTerms: string;
  sellerIdd: string;
  deliveryEta: string;
  expiryDate: string;
}

export function SummarySellerDetails({
  sellerAssigned,
  sellerWarehouse,
  paymentTerms,
  sellerIdd,
  deliveryEta,
  expiryDate,
}: SummarySellerDetailsProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card px-4 shadow-sm md:px-5">
      <Accordion type="single" collapsible defaultValue="seller-details">
        <AccordionItem value="seller-details" className="border-b-0">
          <AccordionTrigger className="py-3 text-base font-semibold hover:no-underline">
            Seller Details
          </AccordionTrigger>
          <AccordionContent>
            <dl className="grid gap-3 text-sm">
              <DetailRow
                label="Seller Assigned"
                value={
                  <div className="flex items-center gap-2">
                    <span>{sellerAssigned}</span>
                    <button type="button" className="text-primary underline-offset-2 hover:underline">
                      Assign Seller
                    </button>
                  </div>
                }
              />
              <DetailRow label="Seller Warehouse" value={sellerWarehouse} />
              <DetailRow label="Payment Terms" value={paymentTerms} />
              <DetailRow label="Seller IDD" value={sellerIdd} />
              <DetailRow label="Delivery ETA from Order" value={deliveryEta} />
              <DetailRow label="Expiry Date of Enquiry" value={expiryDate} />
            </dl>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
