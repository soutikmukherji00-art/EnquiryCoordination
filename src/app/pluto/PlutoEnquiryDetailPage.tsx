import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  FileSpreadsheet,
  FileText,
  Mail,
  MoreHorizontal,
  Package,
  Paperclip,
  Plus,
} from "lucide-react";
import { format, formatDistanceStrict } from "date-fns";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/app/components/ui/sheet";
import { cn } from "@/app/components/ui/utils";
import { EnquirySourcePreview } from "@/app/components/EnquirySourcePreview";
import { isMobile, useBreakpoint } from "@/hooks/useBreakpoint";
import type {
  PlutoDetailHeaderViewModel,
  PlutoRoleScreenConfig,
  PlutoStateTone,
} from "./pluto.types";
import type { EnquiryRecord, EnquiryRecordOrigin } from "@/domain/enquiry/enquiry.record";
import type { DraftEnquiryDocument } from "@/domain/enquiry/enquiry.creation";
import {
  formatRecordOriginLabel,
} from "@/domain/enquiry/enquiry.record-selectors";

interface PlutoEnquiryDetailPageProps {
  enquiryId: string;
  header: PlutoDetailHeaderViewModel | null;
  roleConfig: PlutoRoleScreenConfig;
  canManageMembers: boolean;
  canChangeState: boolean;
  canShareMessages: boolean;
  onBack: () => void;
  showBackButton?: boolean;
  displayMode?: "page" | "modal" | "full-page";
  record?: EnquiryRecord;
  summary?: string;
  onCreatePlaceholder?: () => void;
  onOpenDetailedRFQCreation?: () => void;
  /** Same standalone Buyer PO / direct order flow as the enquiries list FAB */
  onFabDirectOrder?: () => void;
  /** Optional path for direct-order CM review: preview -> order summary. */
  showReviewOrderSummaryAction?: boolean;
  onReviewOrderSummary?: () => void;
  /** BDM directory (personas with role BDM) for reassignment picker */
  bdmOptions?: Array<{ id: string; name: string }>;
  onReassignPrimaryBdm?: (enquiryId: string, personaId: string) => void;
}

export function PlutoEnquiryDetailPage({
  enquiryId,
  header,
  roleConfig,
  canManageMembers: _canManageMembers,
  canChangeState: _canChangeState,
  canShareMessages: _canShareMessages,
  onBack,
  showBackButton = false,
  displayMode = "page",
  record,
  summary,
  onCreatePlaceholder,
  onOpenDetailedRFQCreation,
  onFabDirectOrder,
  showReviewOrderSummaryAction = false,
  onReviewOrderSummary,
  bdmOptions = [],
  onReassignPrimaryBdm,
}: PlutoEnquiryDetailPageProps) {
  const breakpoint = useBreakpoint();
  const compactActions = isMobile(breakpoint);
  const isModal = displayMode === "modal";

  const [respondMenuOpen, setRespondMenuOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const proceedTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [reassignValue, setReassignValue] = useState<string>("");
  const [previewDoc, setPreviewDoc] = useState<DraftEnquiryDocument | null>(null);

  const now = useMemo(() => new Date(), []);

  if (!header) {
    return (
      <div className="flex h-full items-center justify-center bg-background px-6">
        <div className="rounded-[20px] border border-border/55 bg-card px-8 py-10 text-center text-[15px] text-muted-foreground shadow-sm">
          {roleConfig.emptyStateTitle}
        </div>
      </div>
    );
  }

  const isConverted = header.status === "Converted to Order";

  const primaryNonMailLabel =
    isConverted ? "RFQ complete" : "Detailed RFQ";

  const senderLine =
    record?.buyer?.company && record.buyer.company !== record.buyer.name
      ? `${record.buyer.name} · ${record.buyer.company}`
      : record?.buyer?.name || header.buyerName;

  const receivedAt = record?.createdAt instanceof Date ? record.createdAt : null;
  const receivedLabel = receivedAt
    ? `${format(receivedAt, "PPp")} · ${formatDistanceStrict(receivedAt, now, { addSuffix: true })}`
    : header.createdAtLabel;

  const mediumLabel = resolveMediumLabel(record?.origin);

  const pickDetailedRfq = () => {
    setRespondMenuOpen(false);
    onOpenDetailedRFQCreation?.();
  };

  const pickQuickRfq = () => {
    setRespondMenuOpen(false);
    onCreatePlaceholder?.();
  };

  const pickDirectOrder = () => {
    setRespondMenuOpen(false);
    onFabDirectOrder?.();
  };

  const handleReassignSave = () => {
    if (!reassignValue || !onReassignPrimaryBdm) return;
    onReassignPrimaryBdm(enquiryId, reassignValue);
    setReassignOpen(false);
    setReassignValue("");
  };

  const showReassign = bdmOptions.length > 0 && Boolean(onReassignPrimaryBdm);
  const showProceedActions = !showReviewOrderSummaryAction;

  return (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-background",
        isModal ? "h-[min(84vh,920px)]" : "h-full",
      )}
    >
      <div
        className={cn(
          "border-b border-border/55 bg-card px-5 py-5 md:px-6",
          compactActions && "pb-6 pt-4",
        )}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3 min-w-0">
              {showBackButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={onBack}
                  className="rounded-full border-border bg-background text-muted-foreground h-10 w-10 flex-shrink-0"
                  aria-label="Back"
                >
                  <ArrowLeft className="size-5" />
                </Button>
              )}
              <div className="min-w-0">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:gap-3">
                  <h1
                    className={cn(
                      "text-[28px] font-semibold tracking-[-0.04em] text-foreground truncate",
                      compactActions && "text-xl",
                    )}
                  >
                    {header.buyerName}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-primary">#{header.id}</span>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                        toneClassMap[header.stateTone],
                      )}
                    >
                      {header.status}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex flex-col gap-1 text-sm text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">From </span>
                    {senderLine}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Received </span>
                    {receivedLabel}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">Medium </span>
                    {mediumLabel}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 shrink-0">
              {showReviewOrderSummaryAction && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onReviewOrderSummary}
                  className="shrink-0"
                >
                  Review Order Summary
                </Button>
              )}
              {!compactActions && showProceedActions && (
                <DropdownMenu open={respondMenuOpen} onOpenChange={setRespondMenuOpen}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      ref={proceedTriggerRef}
                      type="button"
                      size="sm"
                      disabled={isConverted}
                      className="shrink-0 gap-1.5 bg-primary text-primary-foreground hover:bg-primary/95"
                    >
                      Proceed
                      <ChevronDown className="size-4 opacity-90" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-72">
                    <ProceedResponseMenuItems
                      disabled={isConverted}
                      primaryLabel={primaryNonMailLabel}
                      onDetailed={pickDetailedRfq}
                      onQuick={pickQuickRfq}
                      onDirect={pickDirectOrder}
                    />
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {showReassign && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground"
                      aria-label="More actions"
                    >
                      <MoreHorizontal className="size-4" aria-hidden />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onSelect={() => {
                        setReassignValue(record?.assignment?.bdmPersonaId || "");
                        setReassignOpen(true);
                      }}
                    >
                      Reassign BDM
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "flex-1 overflow-y-auto px-5 py-5 md:px-6",
          isMobile(breakpoint) && "px-4 py-4 pb-[calc(9rem+var(--mweb-safe-area-bottom))]",
        )}
      >
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_320px]">
          <div className="space-y-4">
            <EnquirySourcePreview record={record} summary={summary} />

            {record?.attachments && record.attachments.length > 0 && (
              <section className="rounded-2xl border border-border/40 bg-card p-4 md:p-5 shadow-sm">
                <h2 className="text-[12px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2 mb-3">
                  <Paperclip className="w-3.5 h-3.5" />
                  Attachments
                </h2>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {record.attachments.map((doc) => (
                    <li key={doc.id}>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-muted/15 px-3 py-3 text-left text-sm transition-colors hover:bg-muted/35"
                      >
                        {attachmentIcon(doc)}
                        <span className="min-w-0 flex-1 truncate font-medium">{doc.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {!compactActions && (
            <aside className="space-y-4">
              <div className="rounded-[22px] border border-border/55 bg-card p-5 shadow-sm">
                <h3 className="mb-4 text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground/80">Meta Information</h3>
                <div className="space-y-3">
                  <FieldValue label="Assigned CM" value={header.assignedCMName} />
                  <FieldValue label="Estimated value" value={header.valueLabel} />
                  <FieldValue label="Categories" value={header.categoriesLabel} />
                  <FieldValue label="Created" value={header.createdAtLabel} />
                  <FieldValue label="Last activity" value={header.lastActivityLabel} />
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {compactActions && (
        <div className="sticky bottom-0 z-20 border-t border-border/55 bg-background/95 px-4 pb-[calc(0.75rem+var(--mweb-safe-area-bottom))] pt-3 backdrop-blur">
          <div className="flex flex-col gap-2">
            {showProceedActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    disabled={isConverted}
                    className="h-11 w-full justify-between rounded-xl px-4 text-sm font-semibold"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Proceed
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-80" aria-hidden />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-[min(100vw-2rem,20rem)]">
                  <ProceedResponseMenuItems
                    disabled={isConverted}
                    primaryLabel={primaryNonMailLabel}
                    onDetailed={() => onOpenDetailedRFQCreation?.()}
                    onQuick={() => onCreatePlaceholder?.()}
                    onDirect={() => onFabDirectOrder?.()}
                  />
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <div className={cn("grid gap-2", showReviewOrderSummaryAction ? "grid-cols-1" : "grid-cols-2")}>
              {showReviewOrderSummaryAction && (
                <Button
                  variant="outline"
                  onClick={onReviewOrderSummary}
                  className="h-10 rounded-xl text-sm font-medium"
                >
                  <FileSpreadsheet className="mr-1 h-4 w-4" />
                  Review Summary
                </Button>
              )}
              {showProceedActions && (
                <Button
                  variant="outline"
                  onClick={onCreatePlaceholder}
                  disabled={isConverted}
                  className="h-10 rounded-xl text-sm font-medium"
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Quick RFQ
                </Button>
              )}
              {showProceedActions && (
                <Button
                  variant="outline"
                  onClick={onFabDirectOrder}
                  disabled={isConverted}
                  className="h-10 rounded-xl text-sm font-medium"
                >
                  <Package className="mr-1 h-4 w-4" />
                  Direct Order
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={Boolean(previewDoc)} onOpenChange={(open) => !open && setPreviewDoc(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle className="truncate pr-8">{previewDoc?.name ?? "Attachment"}</DialogTitle>
            <DialogDescription>Preview (mock)</DialogDescription>
          </DialogHeader>
          {previewDoc && <AttachmentPreviewBody doc={previewDoc} record={record} />}
        </DialogContent>
      </Dialog>

      <Sheet open={reassignOpen} onOpenChange={setReassignOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Reassign BDM</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4 px-4 pb-6">
            <div className="space-y-2">
              <Label htmlFor="pluto-bdm-reassign">Business development manager</Label>
              <Select value={reassignValue} onValueChange={setReassignValue}>
                <SelectTrigger id="pluto-bdm-reassign" className="w-full">
                  <SelectValue placeholder="Select BDM" />
                </SelectTrigger>
                <SelectContent>
                  {bdmOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {opt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setReassignOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleReassignSave} disabled={!reassignValue}>
                Save
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function AttachmentPreviewBody({
  doc,
  record,
}: {
  doc: DraftEnquiryDocument;
  record?: EnquiryRecord;
}) {
  const kind = classifyAttachment(doc);
  if (kind === "email") {
    const mail =
      record?.sourceCorrespondences?.find((entry) => entry.kind === "email") ||
      (record?.sourceCorrespondence?.kind === "email" ? record.sourceCorrespondence : null);
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-4 text-sm space-y-2">
        {mail ? (
          <>
            <p className="font-medium">{mail.subject}</p>
            <p className="text-muted-foreground text-xs">From: {mail.from}</p>
            <p className="whitespace-pre-wrap pt-2 border-t border-border/60">{mail.body}</p>
          </>
        ) : (
          <p className="text-muted-foreground">Email thread preview is not available for this file.</p>
        )}
      </div>
    );
  }
  if (kind === "sheet") {
    return (
      <div className="rounded-lg border border-border overflow-hidden text-xs">
        <div className="grid grid-cols-4 bg-muted/40 font-medium border-b border-border">
          <div className="px-2 py-2 border-r border-border/60">Line</div>
          <div className="px-2 py-2 border-r border-border/60 col-span-2">Description</div>
          <div className="px-2 py-2">Qty</div>
        </div>
        {[
          ["10", "SS 316L seamless pipe 4\" SCH40", "1000 m"],
          ["20", "Fittings — elbows 90°", "24 nos"],
          ["30", "Flanges ANSI 150", "12 nos"],
        ].map(([a, b, c]) => (
          <div key={a} className="grid grid-cols-4 border-b border-border/40">
            <div className="px-2 py-2 border-r border-border/60 text-muted-foreground">{a}</div>
            <div className="px-2 py-2 border-r border-border/60 col-span-2">{b}</div>
            <div className="px-2 py-2">{c}</div>
          </div>
        ))}
        <p className="p-2 text-muted-foreground bg-muted/10">Mock spreadsheet extract — not the real file.</p>
      </div>
    );
  }
  return (
    <p className="text-sm text-muted-foreground">
      No visual preview for this file type. Name: {doc.name}
    </p>
  );
}

function classifyAttachment(doc: DraftEnquiryDocument): "email" | "sheet" | "file" {
  const t = (doc.type || "").toLowerCase();
  const n = doc.name.toLowerCase();
  if (t.includes("rfc822") || t.includes("email") || n.endsWith(".eml")) return "email";
  if (
    t.includes("spreadsheet") ||
    t.includes("excel") ||
    t.includes("sheet") ||
    n.endsWith(".xlsx") ||
    n.endsWith(".xls")
  ) {
    return "sheet";
  }
  return "file";
}

function attachmentIcon(doc: DraftEnquiryDocument) {
  const k = classifyAttachment(doc);
  if (k === "email") return <Mail className="size-5 shrink-0 text-primary" />;
  if (k === "sheet") return <FileSpreadsheet className="size-5 shrink-0 text-emerald-600" />;
  return <FileText className="size-5 shrink-0 text-muted-foreground" />;
}

function resolveMediumLabel(origin: EnquiryRecordOrigin | undefined): string {
  if (!origin) return "—";
  if (origin === "whatsapp_intake") return "WhatsApp (messaging)";
  return formatRecordOriginLabel(origin);
}

function ProceedResponseMenuItems({
  disabled,
  primaryLabel,
  onDetailed,
  onQuick,
  onDirect,
}: {
  disabled: boolean;
  primaryLabel: string;
  onDetailed: () => void;
  onQuick: () => void;
  onDirect: () => void;
}) {
  return (
    <>
      <DropdownMenuItem
        disabled={disabled}
        className="cursor-pointer flex-col items-start gap-0.5 py-2.5 [&_svg]:text-primary"
        onSelect={() => onDetailed()}
      >
        <span className="font-semibold">{primaryLabel}</span>
        <span className="text-xs font-normal text-muted-foreground">Structured multi-step capture</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={disabled}
        className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
        onSelect={() => onQuick()}
      >
        <span className="font-semibold">Quick RFQ</span>
        <span className="text-xs font-normal text-muted-foreground">Faster lightweight path</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        disabled={disabled}
        className="cursor-pointer flex-col items-start gap-0.5 py-2.5"
        onSelect={() => onDirect()}
      >
        <span className="font-semibold">Direct Order</span>
        <span className="text-xs font-normal text-muted-foreground">Upload Buyer PO and OCR summary</span>
      </DropdownMenuItem>
    </>
  );
}

function FieldValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/55 bg-muted/30 px-4 py-3.5">
      <div className="text-[9px] font-bold uppercase tracking-[0.05em] text-muted-foreground/70">
        {label}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

const toneClassMap: Record<PlutoStateTone, string> = {
  neutral: "bg-primary/10 text-primary",
  accent: "bg-primary/10 text-primary",
  warning: "bg-destructive/10 text-destructive",
  success: "bg-green-500/10 text-green-600",
};
