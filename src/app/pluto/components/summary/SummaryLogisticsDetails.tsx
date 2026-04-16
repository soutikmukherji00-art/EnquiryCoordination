import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { Card, CardContent } from "@/app/components/ui/card";

interface SummaryLogisticsDetailsProps {
  logisticProvider: string;
  estimatedWeight?: string;
  transporter: string;
  logisticsManager?: string;
  transporterPaymentMode: string;
  bpShippedRateType?: string;
  shippedRatePerMt: string;
  totalTonnage: string;
  minLoadingGuarantee: string;
  baseShippingCharges: string;
  notionalChargesToTransporter: string;
  totalShippingChargesToBuyer?: string;
}

const rowClassName = "grid grid-cols-1 gap-1 py-2 text-sm md:grid-cols-[260px_1fr]";

export function SummaryLogisticsDetails({
  logisticProvider,
  estimatedWeight,
  transporter,
  logisticsManager,
  transporterPaymentMode,
  bpShippedRateType,
  shippedRatePerMt,
  totalTonnage,
  minLoadingGuarantee,
  baseShippingCharges,
  notionalChargesToTransporter,
  totalShippingChargesToBuyer,
}: SummaryLogisticsDetailsProps) {
  return (
    <Card className="gap-0">
      <CardContent className="pt-2">
        <Accordion type="single" collapsible defaultValue="logistics-details">
          <AccordionItem value="logistics-details" className="border-b-0">
            <AccordionTrigger className="py-3 text-base font-semibold hover:no-underline">
              Logistics Details
            </AccordionTrigger>
            <AccordionContent className="pb-1">
              <div className={rowClassName}>
                <p className="text-muted-foreground">Logistic Provider</p>
                <p className="font-medium text-foreground">{logisticProvider}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Estimated Weight</p>
                <p className="font-medium text-foreground">{estimatedWeight || "—"}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Transporter</p>
                <p className="font-medium text-foreground">{transporter}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Logistic Manager</p>
                <p className="font-medium text-foreground">{logisticsManager || "—"}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Transporter Payment Mode</p>
                <p className="font-medium text-foreground">{transporterPaymentMode}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">BP Shipped Rates Type</p>
                <p className="font-medium text-foreground">{bpShippedRateType || "—"}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">BP Shipped Rate / MT</p>
                <p className="font-medium text-foreground">{shippedRatePerMt}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Total Tonnage</p>
                <p className="font-medium text-foreground">{totalTonnage}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Min Loading Guarantee</p>
                <p className="font-medium text-foreground">{minLoadingGuarantee}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Base Shipping Charges</p>
                <p className="font-medium text-foreground">{baseShippingCharges}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Notional Shipping Charges to Transporter</p>
                <p className="font-medium text-foreground">{notionalChargesToTransporter}</p>
              </div>
              <div className={rowClassName}>
                <p className="text-muted-foreground">Total Shipping Charges to Buyer</p>
                <p className="font-medium text-foreground">{totalShippingChargesToBuyer || "—"}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
