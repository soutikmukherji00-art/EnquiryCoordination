import {
  CheckCircle2,
  Circle,
  FileText,
  Package,
  Plus,
  X,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { cn } from "@/app/components/ui/utils";
import type {
  PlutoDetailHeaderViewModel,
  PlutoStateTone,
} from "./pluto.types";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import { formatCreationSourceLabel } from "@/domain/enquiry/enquiry.record-selectors";

export interface PlutoEnquiryContextPanelProps {
  header: PlutoDetailHeaderViewModel | null;
  record?: EnquiryRecord;
  summary?: string;
  onClose: () => void;
  onContinueRfq: () => void;
  onQuickRfq: () => void;
  onConvertToOrder: () => void;
}

export function PlutoEnquiryContextPanel({
  header,
  record,
  summary,
  onClose,
  onContinueRfq,
  onQuickRfq,
  onConvertToOrder,
}: PlutoEnquiryContextPanelProps) {
  if (!header) {
    return null;
  }

  const isConverted = header.status === "Converted to Order";
  const primaryRfqLabel =
    header.status === "Draft"
      ? "Start detailed RFQ"
      : isConverted
        ? "RFQ complete"
        : "Continue RFQ";

  const previewText =
    record?.requirements?.notes?.trim() ||
    summary?.trim() ||
    "No notes captured yet.";

  const categoryLine =
    header.categoriesLabel?.trim() ||
    (record?.requirements.categories?.length
      ? record.requirements.categories.join(", ")
      : "—");

  const productCount = record?.products?.length ?? 0;
  const pastOrdersLine =
    productCount > 0
      ? `${productCount} line item${productCount === 1 ? "" : "s"} on file`
      : "No structured line items";

  const creationLabel = formatCreationSourceLabel(
    record?.creationSource ?? header.creationSource,
  );

  const checklistRows = buildChecklistRows(header, record);

  return (
    <div className="flex h-[min(78vh,720px)] min-h-0 w-full min-w-0 flex-col bg-white">
        {/* A. Snapshot */}
        <header className="shrink-0 border-b border-gray-200 px-6 py-5">
          <div className="mb-0 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1 text-sm leading-tight text-gray-900">
                <span className="font-mono text-[12px] font-semibold text-[#5249D2]">
                  #{header.id}
                </span>
                <span className="truncate font-semibold">{header.buyerName}</span>
                <span className="shrink-0 text-gray-500">
                  {header.valueLabel}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                <span
                  className={cn(
                    "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                    toneClassMap[header.stateTone],
                  )}
                >
                  {header.status}
                </span>
                <span className="truncate">Act {header.lastActivityLabel}</span>
                <span className="truncate">CM {header.assignedCMName}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close panel"
              onClick={onClose}
            >
              <X className="size-4" />
            </Button>
          </div>
        </header>

        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-5 bg-white px-6 py-5 pb-24">
            {/* B. Requirement intelligence */}
            <section className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Requirement intelligence
              </h2>
              <div className="space-y-1.5 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-snug">
                <SnapshotRow k="Category" v={categoryLine} />
                <SnapshotRow k="Source" v={creationLabel} />
                <SnapshotRow k="Catalogued" v={pastOrdersLine} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Field checklist
                </p>
                <ul className="space-y-1 rounded-md border border-gray-200 bg-white px-2 py-2">
                  {checklistRows.map((row) => (
                    <li key={row.id}>
                      {row.done ? (
                        <div className="flex items-center gap-2 rounded px-2 py-1 text-sm text-gray-900">
                          <CheckCircle2 className="size-3.5 shrink-0 text-green-600 dark:text-green-500" />
                          <span>{row.label}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={onContinueRfq}
                          className="flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
                          aria-label={`Complete in RFQ: ${row.label}`}
                        >
                          <Circle className="size-3.5 shrink-0 text-amber-600/90 dark:text-amber-400" />
                          <span>{row.label}</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="rounded-md border border-gray-200 bg-white px-4 py-3">
              <h2 className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                <FileText className="size-3" />
                Notes
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-snug text-gray-700">
                {previewText}
              </p>
            </section>
          </div>
        </ScrollArea>

        {/* C. Sticky actions */}
        <div className="shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              size="sm"
              className="h-10 w-full justify-center gap-2 text-sm font-semibold"
              onClick={onContinueRfq}
              disabled={isConverted}
            >
              <FileText className="size-4" />
              {primaryRfqLabel}
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 gap-1 text-sm"
                onClick={onQuickRfq}
                disabled={isConverted}
              >
                <Plus className="size-3.5" />
                Quick RFQ
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-10 gap-1 px-2 text-sm leading-tight"
                onClick={onConvertToOrder}
                disabled={isConverted}
              >
                <Package className="size-3.5 shrink-0" />
                Direct order
              </Button>
            </div>
          </div>
        </div>
    </div>
  );
}

function SnapshotRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <span className="w-20 shrink-0 text-xs font-medium text-gray-500">{k}</span>
      <span className="min-w-0 flex-1 text-sm font-medium text-gray-900">{v}</span>
    </div>
  );
}

function buildChecklistRows(
  header: PlutoDetailHeaderViewModel,
  record: EnquiryRecord | undefined,
): Array<{ id: string; label: string; done: boolean }> {
  const hasDelivery =
    !!(record?.requirements.deliveryLocation?.trim() ||
      (header.deliveryLocation &&
        header.deliveryLocation !== "—" &&
        header.deliveryLocation.trim() !== ""));
  const hasPayment =
    !!(record?.requirements.paymentTerms?.trim() ||
      (header.paymentTerms &&
        header.paymentTerms !== "—" &&
        header.paymentTerms.trim() !== ""));
  const hasEta =
    record?.requirements.etaDays != null ||
    !!(header.etaDays && header.etaDays !== "—");
  const hasCategories =
    (record?.requirements.categories?.length ?? 0) > 0 ||
    !!(header.categoriesLabel && header.categoriesLabel !== "—");

  return [
    { id: "cat", label: "Categories locked", done: hasCategories },
    { id: "loc", label: "Delivery location", done: hasDelivery },
    { id: "pay", label: "Payment terms", done: hasPayment },
    { id: "eta", label: "Delivery timeline (ETA)", done: hasEta },
  ];
}

const toneClassMap: Record<PlutoStateTone, string> = {
  neutral: "bg-primary/10 text-primary",
  accent: "bg-primary/10 text-primary",
  warning: "bg-destructive/10 text-destructive",
  success: "bg-green-500/10 text-green-600 dark:text-green-500",
};
