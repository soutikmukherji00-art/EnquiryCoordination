import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import { SummaryActionInputs } from "./components/summary/SummaryActionInputs";
import { SummaryBuyerDetails } from "./components/summary/SummaryBuyerDetails";
import { SummaryLineItems, type SummaryLineItem } from "./components/summary/SummaryLineItems";
import { SummaryLogisticsDetails } from "./components/summary/SummaryLogisticsDetails";
import { SummaryPriceCard } from "./components/summary/SummaryPriceCard";
import { SummarySellerDetails } from "./components/summary/SummarySellerDetails";
import { SummaryShipToDetails } from "./components/summary/SummaryShipToDetails";

interface OrderSummaryPageProps {
  enquiryId: string;
  record?: EnquiryRecord;
  onBack: () => void;
  onConfirm: () => void;
  confirmSubmitting?: boolean;
}

function StepNode({
  label,
  completed,
  active,
}: {
  label: string;
  completed?: boolean;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {completed ? (
        <CheckCircle2 className="size-4 text-emerald-600" />
      ) : active ? (
        <CheckCircle2 className="size-4 text-[#4039ad]" />
      ) : (
        <Circle className="size-4 text-muted-foreground" />
      )}
      <span className={`text-xs font-medium ${active ? "text-foreground" : "text-muted-foreground"}`}>
        {label}
      </span>
    </div>
  );
}

const formatCurrency = (value?: number) =>
  value && value > 0 ? `\u20B9${Math.round(value).toLocaleString("en-IN")}` : "\u20B90";

const formatDateValue = (value?: string) => {
  if (!value) return "\u2014";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "\u2014" : date.toLocaleDateString("en-IN");
};
const formatNumberValue = (value?: number, suffix = "") =>
  value !== undefined && Number.isFinite(value) ? `${value}${suffix}` : "\u2014";

const LOGISTIC_PROVIDER_LABELS: Record<string, string> = {
  buyer_shipped: "Buyer Shipped",
  seller_shipped: "Seller Shipped",
  bp_shipped: "BP Shipped",
};

const BP_PAYMENT_MODE_LABELS: Record<string, string> = {
  foi: "FOI",
  for: "FOR",
  to_pay: "To Pay",
};

export function OrderSummaryPage({
  enquiryId,
  record,
  onBack,
  onConfirm,
  confirmSubmitting = false,
}: OrderSummaryPageProps) {
  const defaultWarehouses = useMemo(() => {
    const fromRecord = record?.requirements.deliveryLocations?.filter(Boolean) ?? [];
    if (record?.requirements.deliveryLocation) {
      return Array.from(new Set([record.requirements.deliveryLocation, ...fromRecord]));
    }
    return fromRecord.length > 0 ? fromRecord : ["Warehouse A", "Warehouse B"];
  }, [record]);

  const [selectedWarehouse, setSelectedWarehouse] = useState(defaultWarehouses[0] ?? "Warehouse A");
  const [dispatchEtaDays, setDispatchEtaDays] = useState(
    record?.requirements.etaDays ? String(record.requirements.etaDays) : "",
  );
  const [additionalTerms, setAdditionalTerms] = useState(record?.requirements.notes ?? "");

  const lineItems = useMemo<SummaryLineItem[]>(() => {
    if (record?.products && record.products.length > 0) {
      return record.products.map((product, index) => {
        const requestedQty = product.quantity?.trim() || "—";
        const offeredQty = product.offeredQuantity?.trim() || requestedQty;
        const buyerPrice = product.buyerPrice;
        const sellerBasePrice = product.sellerBasePrice;
        const offeredQtyNumber = Number.parseFloat(offeredQty || "");
        const itemTotal =
          typeof buyerPrice === "number" && Number.isFinite(offeredQtyNumber)
            ? buyerPrice * offeredQtyNumber
            : product.itemTotalBuyerPrice;
        return {
          id: `${product.name || product.category}-${index}`,
          productName: product.name || product.category,
          requestedQty,
          offeredQty,
          sellerPrice: formatCurrency(sellerBasePrice ?? record.requirements.estimatedValue),
          buyerPrice: formatCurrency(buyerPrice ?? record.requirements.estimatedValue),
          itemTotal: formatCurrency(itemTotal),
        };
      });
    }

    if ((record?.requirements.categories?.length ?? 0) > 0) {
      return record!.requirements.categories.map((category, index) => ({
        id: `${category}-${index}`,
        productName: category,
        requestedQty: "—",
        offeredQty: "—",
        sellerPrice: formatCurrency(record?.requirements.estimatedValue),
        buyerPrice: formatCurrency(record?.requirements.estimatedValue),
        itemTotal: formatCurrency(record?.requirements.estimatedValue),
      }));
    }

    return [
      {
        id: "default",
        productName: "No line items captured",
        requestedQty: "—",
        offeredQty: "—",
        sellerPrice: "\u20B90",
        buyerPrice: "\u20B90",
        itemTotal: "\u20B90",
      },
    ];
  }, [record]);

  const itemsSales = record?.requirements.estimatedValue ?? 0;
  const itemsPurchase = itemsSales > 0 ? Math.round(itemsSales * 0.94) : 0;
  const transporterCharges = 0;
  const todPercent = 0;
  const grossMarginPercent = itemsSales > 0 ? ((itemsSales - itemsPurchase) / itemsSales) * 100 : 0;
  const totalOrderValue = itemsSales + transporterCharges;

  const buyerName = record?.buyer.name || "Buyer";
  const buyerCompany = record?.buyer.company || buyerName;
  const buyerContact = record?.buyer.primaryContact || "—";
  const deliveryLocation = record?.requirements.deliveryLocation || "—";
  const paymentTerms = record?.requirements.paymentTerms || "—";

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-5 py-5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-2 text-sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Enquiry Response
          </Button>
          <div className="flex items-center gap-3">
            <StepNode label="Enquiry" completed />
            <span className="h-px w-8 bg-border" />
            <StepNode label="Response" completed />
            <span className="h-px w-8 bg-border" />
            <StepNode label="Confirm" active />
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr]">
          <div className="space-y-5">
            <SummaryLineItems items={lineItems} />
            <SummarySellerDetails
              sellerAssigned={record?.sellerDetails?.sellerName || "Assigned seller pending"}
              sellerWarehouse={selectedWarehouse}
              paymentTerms={
                record?.sellerDetails?.paymentTerms
                  ? record.sellerDetails.paymentTerms === "credit"
                    ? "Credit"
                    : "Advance"
                  : paymentTerms
              }
              sellerIdd={formatNumberValue(record?.sellerDetails?.sellerCreditDays ?? record?.requirements.iddDays, " Days")}
              deliveryEta={record?.sellerDetails?.deliveryEtaFromOrderDate ? formatDateValue(record.sellerDetails.deliveryEtaFromOrderDate) : formatNumberValue(record?.requirements.etaDays, " Days")}
              enquiryExpiry={record?.sellerDetails?.rateExpiryDate ? formatDateValue(record.sellerDetails.rateExpiryDate) : formatNumberValue(record?.requirements.mddDays, " Days")}
            />
            <SummaryLogisticsDetails
              logisticProvider={
                record?.logisticsDetails?.provider
                  ? LOGISTIC_PROVIDER_LABELS[record.logisticsDetails.provider] || "—"
                  : "—"
              }
              estimatedWeight={formatNumberValue(record?.logisticsDetails?.estimatedWeight)}
              transporter={record?.logisticsDetails?.transporterName || "—"}
              logisticsManager={record?.logisticsDetails?.logisticsManagerName || "—"}
              transporterPaymentMode={
                record?.logisticsDetails?.bpShippedPaymentMode
                  ? BP_PAYMENT_MODE_LABELS[record.logisticsDetails.bpShippedPaymentMode] || "—"
                  : "—"
              }
              bpShippedRateType={
                record?.logisticsDetails?.bpShippedRateType === "per_vehicle"
                  ? "Per Vehicle"
                  : record?.logisticsDetails?.bpShippedRateType === "per_ton"
                    ? "Per Ton"
                    : "—"
              }
              shippedRatePerMt={formatCurrency(record?.logisticsDetails?.bpShippedRatePerMt)}
              totalTonnage={formatNumberValue(record?.logisticsDetails?.totalTonnage)}
              minLoadingGuarantee={formatNumberValue(record?.logisticsDetails?.minLoadingGuarantee)}
              baseShippingCharges={formatCurrency(record?.logisticsDetails?.baseShippingChargesToTransporter)}
              notionalChargesToTransporter={formatCurrency(record?.logisticsDetails?.totalShippingChargesToTransporter)}
              totalShippingChargesToBuyer={formatCurrency(record?.logisticsDetails?.totalShippingChargesToBuyer)}
            />
            <SummaryActionInputs
              warehouseOptions={defaultWarehouses}
              selectedWarehouse={selectedWarehouse}
              estimatedDispatchDays={dispatchEtaDays}
              additionalTerms={additionalTerms}
              onWarehouseChange={setSelectedWarehouse}
              onEstimatedDispatchDaysChange={setDispatchEtaDays}
              onAdditionalTermsChange={setAdditionalTerms}
            />
          </div>

          <div className="space-y-5 lg:sticky lg:top-5 lg:self-start">
            <SummaryShipToDetails address={deliveryLocation} />
            <SummaryBuyerDetails name={buyerName} company={buyerCompany} contact={buyerContact} />
            <SummaryPriceCard
              itemsSales={itemsSales}
              itemsPurchase={itemsPurchase}
              transporterCharges={transporterCharges}
              todPercent={todPercent}
              grossMarginPercent={grossMarginPercent}
              totalOrderValue={totalOrderValue}
              confirmSubmitting={confirmSubmitting}
              onConfirm={onConfirm}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Enquiry ID: {enquiryId}</p>
      </div>
    </div>
  );
}
