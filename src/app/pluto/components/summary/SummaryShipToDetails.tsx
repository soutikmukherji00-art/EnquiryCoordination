import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Card, CardContent } from "@/app/components/ui/card";

interface SummaryShipToDetailsProps {
  address: string;
}

export function SummaryShipToDetails({ address }: SummaryShipToDetailsProps) {
  return (
    <Card className="gap-0">
      <CardContent className="pt-2">
        <Accordion type="single" collapsible defaultValue="ship-to">
          <AccordionItem value="ship-to" className="border-b-0">
            <AccordionTrigger className="py-3 text-base font-semibold hover:no-underline">
              Ship To Details
            </AccordionTrigger>
            <AccordionContent className="pb-2">
              <p className="text-sm text-foreground">{address}</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
