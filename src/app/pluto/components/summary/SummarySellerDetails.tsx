import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Card, CardContent } from "@/app/components/ui/card";

interface SummarySellerDetailsProps {
  sellerAssigned: string;
  sellerWarehouse: string;
  paymentTerms: string;
  sellerIdd: string;
  deliveryEta: string;
  enquiryExpiry: string;
}

const rowClassName = "grid grid-cols-1 gap-1 py-2 text-sm md:grid-cols-[220px_1fr]";

export function SummarySellerDetails({
  sellerAssigned,
  sellerWarehouse,
  paymentTerms,
  sellerIdd,
  deliveryEta,
  enquiryExpiry,
}: SummarySellerDetailsProps) {
  return (
    <Card className="gap-0">
      <CardContent className="pt-2">
        <Accordion type="single" collapsible defaultValue="seller-details">
          <AccordionItem value="seller-details" className="border-b-0">
            <AccordionTrigger className="py-3 text-base font-semibold hover:no-underline">
              Seller Details
            </AccordionTrigger>
            <AccordionContent className="pb-1">
              <div className={rowClassName}>
                <p className="text-muted-foreground">Seller Assigned</p>
                <div className="flex items-center gap-3">
                  <p className="font-medium text-foreground">{sellerAssigned}</p>
                  <button type="button" className="text-xs font-medium text-[#4039ad] hover:underline">
                    Assign Seller
                  </button>
                </div>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Seller Warehouse</p>
                <p className="font-medium text-foreground">{sellerWarehouse}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Payment Terms</p>
                <p className="font-medium text-foreground">{paymentTerms}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Seller IDD</p>
                <p className="font-medium text-foreground">{sellerIdd}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Delivery ETA from Order</p>
                <p className="font-medium text-foreground">{deliveryEta}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Expiry Date of Enquiry</p>
                <p className="font-medium text-foreground">{enquiryExpiry}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
