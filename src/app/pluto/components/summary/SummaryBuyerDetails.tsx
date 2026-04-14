import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Card, CardContent } from "@/app/components/ui/card";

interface SummaryBuyerDetailsProps {
  name: string;
  company: string;
  contact: string;
}

const rowClassName = "grid grid-cols-1 gap-1 py-2 text-sm md:grid-cols-[100px_1fr]";

export function SummaryBuyerDetails({ name, company, contact }: SummaryBuyerDetailsProps) {
  return (
    <Card className="gap-0">
      <CardContent className="pt-2">
        <Accordion type="single" collapsible defaultValue="buyer-details">
          <AccordionItem value="buyer-details" className="border-b-0">
            <AccordionTrigger className="py-3 text-base font-semibold hover:no-underline">
              Buyer Details
            </AccordionTrigger>
            <AccordionContent className="pb-1">
              <div className={rowClassName}>
                <p className="text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{name}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Company</p>
                <p className="font-medium text-foreground">{company}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Contact</p>
                <p className="font-medium text-foreground">{contact}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
