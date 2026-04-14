import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/app/components/ui/accordion";

interface SummaryShipToDetailsProps {
  address: string;
}

export function SummaryShipToDetails({ address }: SummaryShipToDetailsProps) {
  return (
    <section className="rounded-xl border border-border/60 bg-card px-4 shadow-sm md:px-5">
      <Accordion type="single" collapsible defaultValue="ship-to-details">
        <AccordionItem value="ship-to-details" className="border-b-0">
          <AccordionTrigger className="py-3 text-base font-semibold hover:no-underline">
            Ship To Details
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-sm">{address}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
