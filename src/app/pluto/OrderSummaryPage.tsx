import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, MessageSquare } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
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
  onToggleChatView?: () => void;
  showChatToggle?: boolean;
  onRecordUpdate: (nextRecord: EnquiryRecord) => void | Promise<void>;
  onConfirm: () => void;
  confirmSubmitting?: boolean;
}

type OrderSummaryEditor = "seller" | "items" | "logistics" | null;

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
  onToggleChatView,
  showChatToggle = false,
  onRecordUpdate,
  onConfirm,
  confirmSubmitting = false,
}: OrderSummaryPageProps) {
  const [draftRecord, setDraftRecord] = useState<EnquiryRecord | undefined>(record);
  const [activeEditor, setActiveEditor] = useState<OrderSummaryEditor>(null);
  const [persistingEditor, setPersistingEditor] = useState(false);

  useEffect(() => {
    setDraftRecord(record);
  }, [record]);

  const warehouseOptions = useMemo(() => {
    const fromRecord = draftRecord?.requirements.deliveryLocations?.filter(Boolean) ?? [];
    if (draftRecord?.sellerDetails?.warehouseName) {
      return Array.from(new Set([draftRecord.sellerDetails.warehouseName, ...fromRecord]));
    }
    return fromRecord.length > 0 ? fromRecord : ["Warehouse A", "Warehouse B"];
  }, [draftRecord]);

  const lineItems = useMemo<SummaryLineItem[]>(() => {
    if (draftRecord?.products && draftRecord.products.length > 0) {
      return draftRecord.products.map((product, index) => {
        const requestedQty = product.quantity?.trim() || "—";
        const offeredQty = product.offeredQuantity?.trim() || requestedQty;
        const buyerPrice = product.buyerPrice;
        const sellerBasePrice = product.sellerBasePrice;
        const offeredQtyNumber = Number.parseFloat(offeredQty || "");
        const itemTotal =
          typeof buyerPrice === "number" && Number.isFinite(offeredQtyNumber)
            ? buyerPrice * offeredQtyNumber
            : typeof product.itemTotalBuyerPrice === "number"
              ? product.itemTotalBuyerPrice
              : typeof sellerBasePrice === "number" && Number.isFinite(offeredQtyNumber)
                ? sellerBasePrice * offeredQtyNumber
                : undefined;
        return {
          id: `${product.name || product.category}-${index}`,
          productName: product.name || product.category,
          requestedQty,
          offeredQty,
          sellerPrice: formatCurrency(sellerBasePrice ?? draftRecord.requirements.estimatedValue),
          buyerPrice: formatCurrency(buyerPrice ?? draftRecord.requirements.estimatedValue),
          itemTotal: formatCurrency(itemTotal),
        };
      });
    }

    if ((draftRecord?.requirements.categories?.length ?? 0) > 0) {
      return draftRecord!.requirements.categories.map((category, index) => ({
        id: `${category}-${index}`,
        productName: category,
        requestedQty: "—",
        offeredQty: "—",
        sellerPrice: formatCurrency(draftRecord?.requirements.estimatedValue),
        buyerPrice: formatCurrency(draftRecord?.requirements.estimatedValue),
        itemTotal: formatCurrency(draftRecord?.requirements.estimatedValue),
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
  }, [draftRecord]);

  const itemsSales = useMemo(() => {
    if (draftRecord?.products?.length) {
      const total = draftRecord.products.reduce((sum, product) => {
        if (typeof product.itemTotalBuyerPrice === "number") return sum + product.itemTotalBuyerPrice;
        const qty = Number.parseFloat(product.offeredQuantity || product.quantity || "");
        if (typeof product.buyerPrice === "number" && Number.isFinite(qty)) {
          return sum + product.buyerPrice * qty;
        }
        return sum;
      }, 0);
      if (total > 0) return total;
    }
    return draftRecord?.requirements.estimatedValue ?? 0;
  }, [draftRecord]);
  const itemsPurchase = useMemo(() => {
    if (draftRecord?.products?.length) {
      const total = draftRecord.products.reduce((sum, product) => {
        if (typeof product.sellerBasePrice !== "number") return sum;
        const qty = Number.parseFloat(product.offeredQuantity || product.quantity || "");
        return Number.isFinite(qty) ? sum + product.sellerBasePrice * qty : sum;
      }, 0);
      if (total > 0) return total;
    }
    return itemsSales > 0 ? Math.round(itemsSales * 0.94) : 0;
  }, [draftRecord, itemsSales]);
  const transporterCharges = draftRecord?.logisticsDetails?.totalShippingChargesToBuyer ?? 0;
  const todPercent = 0;
  const grossMarginPercent = itemsSales > 0 ? ((itemsSales - itemsPurchase) / itemsSales) * 100 : 0;
  const totalOrderValue = itemsSales + transporterCharges;

  const buyerName = draftRecord?.buyer.name || "Buyer";
  const buyerCompany = draftRecord?.buyer.company || buyerName;
  const buyerContact = draftRecord?.buyer.primaryContact || "—";
  const deliveryLocation = draftRecord?.requirements.deliveryLocation || "—";
  const paymentTerms = draftRecord?.requirements.paymentTerms || "—";

  const persistRecord = async (nextRecord: EnquiryRecord) => {
    setPersistingEditor(true);
    try {
      await onRecordUpdate(nextRecord);
      setActiveEditor(null);
    } finally {
      setPersistingEditor(false);
    }
  };

  const updateDraftRecord = (updater: (current: EnquiryRecord) => EnquiryRecord) => {
    setDraftRecord((previous) => (previous ? updater(previous) : previous));
  };

  const handleConfirm = async () => {
    if (!draftRecord || confirmSubmitting || persistingEditor) return;
    await onRecordUpdate(draftRecord);
    await onConfirm();
  };

  if (!draftRecord) {
    return (
      <div className="h-full overflow-auto bg-background">
        <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
            <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-2 text-sm" onClick={onBack}>
              <ArrowLeft className="size-4" />
              Enquiry Response
            </Button>
          </div>
          <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Structured record not found for this enquiry.
          </p>
        </div>
      </div>
    );
  }

  if (activeEditor) {
    return (
      <OrderSummaryEditorPage
        enquiryId={enquiryId}
        editor={activeEditor}
        draftRecord={draftRecord}
        warehouseOptions={warehouseOptions}
        persisting={persistingEditor}
        onBack={() => setActiveEditor(null)}
        onChange={setDraftRecord}
        onSave={persistRecord}
      />
    );
  }

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-5 py-5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-2 text-sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Enquiry Response
          </Button>
          <div className="flex items-center gap-3">
            {showChatToggle && onToggleChatView ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={onToggleChatView}
                aria-label="Toggle chat view"
              >
                <MessageSquare className="size-4" />
                Chat
              </Button>
            ) : null}
            <StepNode label="Enquiry" completed />
            <span className="h-px w-8 bg-border" />
            <StepNode label="Response" completed />
            <span className="h-px w-8 bg-border" />
            <StepNode label="Confirm" active />
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr]">
          <div className="space-y-5">
            <SummaryLineItems items={lineItems} onEdit={() => setActiveEditor("items")} />
            <SummarySellerDetails
              sellerAssigned={draftRecord.sellerDetails?.sellerName || "Assigned seller pending"}
              sellerWarehouse={draftRecord.sellerDetails?.warehouseName || "—"}
              paymentTerms={
                draftRecord.sellerDetails?.paymentTerms
                  ? draftRecord.sellerDetails.paymentTerms === "credit"
                    ? "Credit"
                    : "Advance"
                  : paymentTerms
              }
              sellerIdd={formatNumberValue(draftRecord.sellerDetails?.sellerCreditDays ?? draftRecord.requirements.iddDays, " Days")}
              deliveryEta={draftRecord.sellerDetails?.deliveryEtaFromOrderDate ? formatDateValue(draftRecord.sellerDetails.deliveryEtaFromOrderDate) : formatNumberValue(draftRecord.requirements.etaDays, " Days")}
              enquiryExpiry={draftRecord.sellerDetails?.rateExpiryDate ? formatDateValue(draftRecord.sellerDetails.rateExpiryDate) : formatNumberValue(draftRecord.requirements.mddDays, " Days")}
              onEdit={() => setActiveEditor("seller")}
            />
            <SummaryLogisticsDetails
              logisticProvider={
                draftRecord.logisticsDetails?.provider
                  ? LOGISTIC_PROVIDER_LABELS[draftRecord.logisticsDetails.provider] || "—"
                  : "—"
              }
              estimatedWeight={formatNumberValue(draftRecord.logisticsDetails?.estimatedWeight)}
              transporter={draftRecord.logisticsDetails?.transporterName || "—"}
              logisticsManager={draftRecord.logisticsDetails?.logisticsManagerName || "—"}
              transporterPaymentMode={
                draftRecord.logisticsDetails?.bpShippedPaymentMode
                  ? BP_PAYMENT_MODE_LABELS[draftRecord.logisticsDetails.bpShippedPaymentMode] || "—"
                  : "—"
              }
              bpShippedRateType={
                draftRecord.logisticsDetails?.bpShippedRateType === "per_vehicle"
                  ? "Per Vehicle"
                  : draftRecord.logisticsDetails?.bpShippedRateType === "per_ton"
                    ? "Per Ton"
                    : "—"
              }
              shippedRatePerMt={formatCurrency(draftRecord.logisticsDetails?.bpShippedRatePerMt)}
              totalTonnage={formatNumberValue(draftRecord.logisticsDetails?.totalTonnage)}
              minLoadingGuarantee={formatNumberValue(draftRecord.logisticsDetails?.minLoadingGuarantee)}
              baseShippingCharges={formatCurrency(draftRecord.logisticsDetails?.baseShippingChargesToTransporter)}
              notionalChargesToTransporter={formatCurrency(draftRecord.logisticsDetails?.totalShippingChargesToTransporter)}
              totalShippingChargesToBuyer={formatCurrency(draftRecord.logisticsDetails?.totalShippingChargesToBuyer)}
              onEdit={() => setActiveEditor("logistics")}
            />
            <SummaryActionInputs
              warehouseOptions={warehouseOptions}
              selectedWarehouse={draftRecord.sellerDetails?.warehouseName || warehouseOptions[0] || "Warehouse A"}
              estimatedDispatchDays={draftRecord.requirements.etaDays ? String(draftRecord.requirements.etaDays) : ""}
              additionalTerms={draftRecord.requirements.notes ?? ""}
              onWarehouseChange={(value) =>
                updateDraftRecord((current) => ({
                  ...current,
                  sellerDetails: {
                    ...current.sellerDetails,
                    warehouseName: value,
                  },
                }))
              }
              onEstimatedDispatchDaysChange={(value) =>
                updateDraftRecord((current) => ({
                  ...current,
                  requirements: {
                    ...current.requirements,
                    etaDays: value.trim() === "" ? undefined : Number(value),
                  },
                }))
              }
              onAdditionalTermsChange={(value) =>
                updateDraftRecord((current) => ({
                  ...current,
                  requirements: {
                    ...current.requirements,
                    notes: value,
                  },
                }))
              }
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
              onConfirm={handleConfirm}
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">Enquiry ID: {enquiryId}</p>
      </div>
    </div>
  );
}

function OrderSummaryEditorPage({
  enquiryId,
  editor,
  draftRecord,
  warehouseOptions,
  persisting,
  onBack,
  onChange,
  onSave,
}: {
  enquiryId: string;
  editor: Exclude<OrderSummaryEditor, null>;
  draftRecord: EnquiryRecord;
  warehouseOptions: string[];
  persisting: boolean;
  onBack: () => void;
  onChange: (nextRecord: EnquiryRecord) => void;
  onSave: (nextRecord: EnquiryRecord) => Promise<void>;
}) {
  const title =
    editor === "seller" ? "Edit Seller Details" : editor === "items" ? "Edit Item Prices" : "Edit Logistics";

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5 px-5 py-5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-2 text-sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Back to confirmation
          </Button>
          <p className="text-sm font-medium text-foreground">{title}</p>
        </div>

        <section className="space-y-5 rounded-xl border border-border/60 bg-card p-5">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Changes update the structured enquiry record used by the confirmation screen.
            </p>
          </div>

          {editor === "seller" ? (
            <SellerDetailsEditor draftRecord={draftRecord} warehouseOptions={warehouseOptions} onChange={onChange} />
          ) : null}
          {editor === "items" ? <LineItemsEditor draftRecord={draftRecord} onChange={onChange} /> : null}
          {editor === "logistics" ? <LogisticsEditor draftRecord={draftRecord} onChange={onChange} /> : null}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button type="button" disabled={persisting} onClick={() => void onSave(draftRecord)}>
              {persisting ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </section>

        <p className="text-xs text-muted-foreground">Enquiry ID: {enquiryId}</p>
      </div>
    </div>
  );
}

function SellerDetailsEditor({
  draftRecord,
  warehouseOptions,
  onChange,
}: {
  draftRecord: EnquiryRecord;
  warehouseOptions: string[];
  onChange: (nextRecord: EnquiryRecord) => void;
}) {
  const sellerDetails = draftRecord.sellerDetails ?? {};
  const warehouses = warehouseOptions.length > 0 ? warehouseOptions : ["Warehouse A"];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TextField
        label="Seller Assigned"
        value={sellerDetails.sellerName ?? ""}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            sellerDetails: { ...sellerDetails, sellerName: value },
          })
        }
      />
      <div className="space-y-1.5">
        <Label>Seller Warehouse</Label>
        <Select
          value={sellerDetails.warehouseName || warehouses[0]}
          onValueChange={(value) =>
            onChange({
              ...draftRecord,
              sellerDetails: { ...sellerDetails, warehouseName: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select warehouse" />
          </SelectTrigger>
          <SelectContent>
            {warehouses.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Payment Terms</Label>
        <Select
          value={sellerDetails.paymentTerms ?? "advance"}
          onValueChange={(value: "credit" | "advance") =>
            onChange({
              ...draftRecord,
              sellerDetails: { ...sellerDetails, paymentTerms: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment terms" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="advance">Advance</SelectItem>
            <SelectItem value="credit">Credit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumberField
        label="Seller IDD"
        value={sellerDetails.sellerCreditDays}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            sellerDetails: { ...sellerDetails, sellerCreditDays: value },
          })
        }
      />
      <DateField
        label="Delivery ETA from Order"
        value={sellerDetails.deliveryEtaFromOrderDate}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            sellerDetails: { ...sellerDetails, deliveryEtaFromOrderDate: value },
          })
        }
      />
      <DateField
        label="Expiry Date of Enquiry"
        value={sellerDetails.rateExpiryDate}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            sellerDetails: { ...sellerDetails, rateExpiryDate: value },
          })
        }
      />
    </div>
  );
}

function LineItemsEditor({
  draftRecord,
  onChange,
}: {
  draftRecord: EnquiryRecord;
  onChange: (nextRecord: EnquiryRecord) => void;
}) {
  const products = draftRecord.products ?? [];

  if (products.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
        No structured line items are available for this enquiry yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product, index) => (
        <div key={`${product.name || product.category}-${index}`} className="rounded-xl border border-border/60 p-4">
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <TextField
              label="Product Name"
              value={product.name ?? ""}
              onChange={(value) =>
                onChange(updateProduct(draftRecord, index, { name: value }))
              }
            />
            <TextField
              label="Category"
              value={product.category ?? ""}
              onChange={(value) =>
                onChange(updateProduct(draftRecord, index, { category: value }))
              }
            />
            <TextField
              label="Requested Qty"
              value={product.quantity ?? ""}
              onChange={(value) =>
                onChange(updateProduct(draftRecord, index, { quantity: value }))
              }
            />
            <TextField
              label="Offered Qty"
              value={product.offeredQuantity ?? ""}
              onChange={(value) =>
                onChange(updateProduct(draftRecord, index, { offeredQuantity: value }))
              }
            />
            <NumberField
              label="Seller Price"
              value={product.sellerBasePrice}
              onChange={(value) =>
                onChange(updateProduct(draftRecord, index, { sellerBasePrice: value }))
              }
            />
            <NumberField
              label="Buyer Price"
              value={product.buyerPrice}
              onChange={(value) =>
                onChange(updateProduct(draftRecord, index, { buyerPrice: value }))
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function LogisticsEditor({
  draftRecord,
  onChange,
}: {
  draftRecord: EnquiryRecord;
  onChange: (nextRecord: EnquiryRecord) => void;
}) {
  const logistics = draftRecord.logisticsDetails ?? {};

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1.5">
        <Label>Logistic Provider</Label>
        <Select
          value={logistics.provider ?? "buyer_shipped"}
          onValueChange={(value: "buyer_shipped" | "seller_shipped" | "bp_shipped") =>
            onChange({
              ...draftRecord,
              logisticsDetails: { ...logistics, provider: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select provider" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="buyer_shipped">Buyer Shipped</SelectItem>
            <SelectItem value="seller_shipped">Seller Shipped</SelectItem>
            <SelectItem value="bp_shipped">BP Shipped</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumberField
        label="Estimated Weight"
        value={logistics.estimatedWeight}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            logisticsDetails: { ...logistics, estimatedWeight: value },
          })
        }
      />
      <TextField
        label="Transporter"
        value={logistics.transporterName ?? ""}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            logisticsDetails: { ...logistics, transporterName: value },
          })
        }
      />
      <TextField
        label="Logistics Manager"
        value={logistics.logisticsManagerName ?? ""}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            logisticsDetails: { ...logistics, logisticsManagerName: value },
          })
        }
      />
      <div className="space-y-1.5">
        <Label>Transporter Payment Mode</Label>
        <Select
          value={logistics.bpShippedPaymentMode ?? "foi"}
          onValueChange={(value: "foi" | "for" | "to_pay") =>
            onChange({
              ...draftRecord,
              logisticsDetails: { ...logistics, bpShippedPaymentMode: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="foi">FOI</SelectItem>
            <SelectItem value="for">FOR</SelectItem>
            <SelectItem value="to_pay">To Pay</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>BP Shipped Rates Type</Label>
        <Select
          value={logistics.bpShippedRateType ?? "per_ton"}
          onValueChange={(value: "per_ton" | "per_vehicle") =>
            onChange({
              ...draftRecord,
              logisticsDetails: { ...logistics, bpShippedRateType: value },
            })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select rate type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="per_ton">Per Ton</SelectItem>
            <SelectItem value="per_vehicle">Per Vehicle</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <NumberField
        label="BP Shipped Rate / MT"
        value={logistics.bpShippedRatePerMt}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            logisticsDetails: { ...logistics, bpShippedRatePerMt: value },
          })
        }
      />
      <NumberField
        label="Total Tonnage"
        value={logistics.totalTonnage}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            logisticsDetails: { ...logistics, totalTonnage: value },
          })
        }
      />
      <NumberField
        label="Min Loading Guarantee"
        value={logistics.minLoadingGuarantee}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            logisticsDetails: { ...logistics, minLoadingGuarantee: value },
          })
        }
      />
      <NumberField
        label="Base Shipping Charges"
        value={logistics.baseShippingChargesToTransporter}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            logisticsDetails: { ...logistics, baseShippingChargesToTransporter: value },
          })
        }
      />
      <NumberField
        label="Notional Shipping Charges to Transporter"
        value={logistics.totalShippingChargesToTransporter}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            logisticsDetails: { ...logistics, totalShippingChargesToTransporter: value },
          })
        }
      />
      <NumberField
        label="Total Shipping Charges to Buyer"
        value={logistics.totalShippingChargesToBuyer}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            logisticsDetails: { ...logistics, totalShippingChargesToBuyer: value },
          })
        }
      />
      <TextareaField
        label="Additional Seller PO Terms"
        value={draftRecord.requirements.notes ?? ""}
        onChange={(value) =>
          onChange({
            ...draftRecord,
            requirements: { ...draftRecord.requirements, notes: value },
          })
        }
        className="md:col-span-2"
      />
    </div>
  );
}

function updateProduct(
  record: EnquiryRecord,
  index: number,
  patch: Partial<NonNullable<EnquiryRecord["products"]>[number]>,
): EnquiryRecord {
  const nextProducts = [...(record.products ?? [])];
  nextProducts[index] = {
    ...nextProducts[index],
    ...patch,
  };
  return {
    ...record,
    products: nextProducts,
  };
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`.trim()}>
      <Label>{label}</Label>
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={4} />
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: number;
  onChange: (value?: number) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        type="number"
        min={0}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value.trim() === "" ? undefined : Number(event.target.value))}
      />
    </div>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value?: string;
  onChange: (value?: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input type="date" value={value ?? ""} onChange={(event) => onChange(event.target.value || undefined)} />
    </div>
  );
}
