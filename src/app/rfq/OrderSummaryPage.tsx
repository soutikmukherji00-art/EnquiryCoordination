import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { WAREHOUSE_OPTIONS_BY_SELLER } from "@/app/rfq/rfq-details.schema";
import { SummaryActionInputs } from "@/app/rfq/components/summary/SummaryActionInputs";
import { SummaryBuyerDetails } from "@/app/rfq/components/summary/SummaryBuyerDetails";
import { SummaryLineItems } from "@/app/rfq/components/summary/SummaryLineItems";
import { SummaryLogisticsDetails } from "@/app/rfq/components/summary/SummaryLogisticsDetails";
import { SummaryPriceCard } from "@/app/rfq/components/summary/SummaryPriceCard";
import { SummarySellerDetails } from "@/app/rfq/components/summary/SummarySellerDetails";
import { SummaryShipToDetails } from "@/app/rfq/components/summary/SummaryShipToDetails";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import { cn } from "@/app/components/ui/utils";

interface OrderSummaryPageProps {
  enquiryId: string;
  record?: EnquiryRecord;
  summary?: string;
  onBack: () => void;
  onConfirm?: (enquiryId: string) => Promise<void> | void;
}

type SummaryLineItem = {
  id: string;
  productName: string;
  requestedQty: number;
  offeredQty: number;
  sellerPrice: number;
  buyerPrice: number;
};

const fallbackLineItems: SummaryLineItem[] = [
  {
    id: "line-1",
    productName: "TMT Bars Fe500D 12mm",
    requestedQty: 25,
    offeredQty: 25,
    sellerPrice: 58100,
    buyerPrice: 59400,
  },
  {
    id: "line-2",
    productName: "Structural Steel Angles",
    requestedQty: 10,
    offeredQty: 10,
    sellerPrice: 62400,
    buyerPrice: 63750,
  },
];

function parseQuantity(rawQuantity: string | undefined): number {
  if (!rawQuantity) return 0;
  const parsed = Number.parseFloat(rawQuantity.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveLineItems(record?: EnquiryRecord): SummaryLineItem[] {
  if (!record?.products || record.products.length === 0) {
    return fallbackLineItems;
  }

  return record.products.map((product, index) => {
    const quantityFromMap = Object.values(product.quantities ?? {}).reduce(
      (sum, quantity) => sum + quantity,
      0,
    );
    const requestedQty = Math.max(parseQuantity(product.quantity), quantityFromMap, 1);
    const sellerPrice = 56000 + index * 1100;
    const buyerPrice = sellerPrice + 1250;
    return {
      id: `line-item-${index + 1}`,
      productName: product.name || product.category || `Product ${index + 1}`,
      requestedQty,
      offeredQty: requestedQty,
      sellerPrice,
      buyerPrice,
    };
  });
}

export function OrderSummaryPage({
  enquiryId,
  record,
  summary,
  onBack,
  onConfirm,
}: OrderSummaryPageProps) {
  const lineItems = useMemo(() => resolveLineItems(record), [record]);
  const sellerWarehouses = WAREHOUSE_OPTIONS_BY_SELLER["seller-alpha"] ?? [];
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>(
    sellerWarehouses[0]?.value ?? "",
  );
  const [dispatchEtaDays, setDispatchEtaDays] = useState<string>(
    record?.requirements.etaDays ? String(record.requirements.etaDays) : "3",
  );
  const [additionalTerms, setAdditionalTerms] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedWarehouseLabel =
    sellerWarehouses.find((warehouse) => warehouse.value === selectedWarehouse)?.label ??
    "Not selected";

  const itemsSales = lineItems.reduce((sum, item) => sum + item.offeredQty * item.buyerPrice, 0);
  const itemsPurchase = lineItems.reduce((sum, item) => sum + item.offeredQty * item.sellerPrice, 0);
  const transporterCharges = Math.round(itemsSales * 0.02);
  const todPercent = 1.5;
  const marginValue = itemsSales - itemsPurchase - transporterCharges;
  const grossMarginPercent = itemsSales > 0 ? (marginValue / itemsSales) * 100 : 0;
  const totalOrderValue = itemsSales + transporterCharges;

  const handleConfirm = async () => {
    if (!onConfirm || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onConfirm(enquiryId);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground">
      <header className="border-b border-border/60 bg-card px-4 py-4 md:px-6">
        <div className="mx-auto flex w-full max-w-[1540px] flex-col gap-4">
          <Button variant="ghost" className="w-fit px-0 text-sm" onClick={onBack}>
            {"< Enquiry Response"}
          </Button>

          <div className="flex flex-wrap items-center gap-2">
            <StepperItem label="Enquiry" completed />
            <div className="h-px w-12 bg-primary/70" />
            <StepperItem label="Response" completed />
            <div className="h-px w-12 bg-primary/70" />
            <StepperItem label="Confirm" active />
          </div>
        </div>
      </header>

      <main className="mx-auto grid h-full w-full max-w-[1540px] min-h-0 flex-1 gap-4 overflow-hidden p-4 md:grid-cols-[minmax(0,1fr)_380px] md:p-6">
        <section className="min-h-0 space-y-4 overflow-y-auto pr-1">
          <SummaryLineItems items={lineItems} />
          <SummarySellerDetails
            sellerAssigned="Alpha Metals Pvt Ltd"
            sellerWarehouse={selectedWarehouseLabel}
            paymentTerms={record?.requirements.paymentTerms ?? "30 Days Credit"}
            sellerIdd={`${record?.requirements.iddDays ?? 10} Days`}
            deliveryEta={`${dispatchEtaDays || "3"} Days`}
            expiryDate={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN")}
          />
          <SummaryLogisticsDetails
            logisticProvider="Birla Pivot Logistics"
            transporter="SRL Transport"
            transporterPaymentMode="To Pay"
            bpShippedRate="INR 980 / MT"
            totalTonnage={`${lineItems.reduce((sum, item) => sum + item.offeredQty, 0)} MT`}
            minLoadingGuarantee="15 MT"
            baseShippingCharges="INR 21,500"
            notionalShippingCharges="INR 24,000"
          />
          <SummaryActionInputs
            warehouseOptions={sellerWarehouses}
            selectedWarehouse={selectedWarehouse}
            dispatchEtaDays={dispatchEtaDays}
            additionalTerms={additionalTerms}
            onWarehouseChange={setSelectedWarehouse}
            onDispatchEtaDaysChange={setDispatchEtaDays}
            onAdditionalTermsChange={setAdditionalTerms}
          />
        </section>

        <aside className="min-h-0 space-y-4 overflow-y-auto">
          <SummaryShipToDetails
            address={record?.requirements.deliveryLocation ?? "Sector-77, Haryana 140304"}
          />
          <SummaryBuyerDetails
            buyerName={record?.buyer.name ?? "Lodha Buildcorp"}
            primaryContact={record?.buyer.primaryContact ?? "Not provided"}
            paymentTerms={record?.requirements.paymentTerms ?? "30 Days Credit"}
            notes={summary}
          />
          <SummaryPriceCard
            itemsSales={itemsSales}
            itemsPurchase={itemsPurchase}
            transporterCharges={transporterCharges}
            todPercent={todPercent}
            grossMarginPercent={grossMarginPercent}
            totalOrderValue={totalOrderValue}
            onConfirm={() => {
              void handleConfirm();
            }}
            isSubmitting={isSubmitting}
          />
        </aside>
      </main>
    </div>
  );
}

function StepperItem({
  label,
  active = false,
  completed = false,
}: {
  label: string;
  active?: boolean;
  completed?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={cn(
          "flex size-6 items-center justify-center rounded-full border-2 text-xs font-semibold",
          completed
            ? "border-primary bg-primary text-primary-foreground"
            : active
              ? "border-primary text-primary"
              : "border-border text-muted-foreground",
        )}
      >
        {completed ? <Check className="size-3.5" /> : label[0]}
      </span>
      <span
        className={cn(
          "text-sm font-medium",
          active || completed ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
    </div>
  );
}
