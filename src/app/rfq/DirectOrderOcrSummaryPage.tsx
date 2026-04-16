import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, FileText, Loader2, Upload } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/components/ui/accordion";
import { LineItemsExtractionSheet } from "@/app/rfq/components/ocr/LineItemsExtractionSheet";
import type { DirectOrderSummaryData } from "@/app/rfq/direct-order.flow";
import { getDirectOrderSummaryValidationErrors } from "@/app/rfq/direct-order.validation";
import { cn } from "@/app/components/ui/utils";

const PO_ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg";
const EDITABLE_FIELD_CLASS =
  "border-border/70 bg-muted/45 shadow-sm focus-visible:border-ring focus-visible:ring-ring/35";

function isAcceptedPoFile(file: File): boolean {
  const lower = file.name.toLowerCase();
  const extOk =
    lower.endsWith(".pdf") ||
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg");
  if (!extOk) return false;
  const t = file.type;
  if (!t) return true;
  return (
    t === "application/pdf" ||
    t === "image/png" ||
    t === "image/jpeg"
  );
}

interface DirectOrderOcrSummaryPageProps {
  initialData: DirectOrderSummaryData;
  cmOptions: Array<{ id: string; name: string }>;
  onBack: () => void;
  onMarkAsWon: (nextData: DirectOrderSummaryData) => void | Promise<void>;
  /** Default "Back" — no destination suffix (Pluto vs RFQ handled by onBack). */
  backButtonLabel?: string;
}

type FlowPhase = "upload" | "ocr" | "summary";

export function DirectOrderOcrSummaryPage({
  initialData,
  cmOptions,
  onBack,
  onMarkAsWon,
  backButtonLabel = "Back",
}: DirectOrderOcrSummaryPageProps) {
  const [phase, setPhase] = useState<FlowPhase>("upload");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isLineItemsSheetOpen, setIsLineItemsSheetOpen] = useState(false);
  const [draft, setDraft] = useState<DirectOrderSummaryData>(initialData);
  const poBlobUrlRef = useRef<string | null>(null);

  const revokePoUrl = useCallback(() => {
    if (poBlobUrlRef.current) {
      URL.revokeObjectURL(poBlobUrlRef.current);
      poBlobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    revokePoUrl();
    setDraft(initialData);
    setPhase("upload");
    setPendingFile(null);
    setFileError(null);
  }, [initialData, revokePoUrl]);

  useEffect(() => {
    return () => revokePoUrl();
  }, [revokePoUrl]);

  useEffect(() => {
    if (phase !== "ocr") return;
    const timeoutMs = Math.floor(Math.random() * 3000) + 2000;
    const timer = window.setTimeout(() => setPhase("summary"), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const onPickFile = (file: File | null) => {
    setFileError(null);
    if (!file) {
      setPendingFile(null);
      return;
    }
    if (!isAcceptedPoFile(file)) {
      setPendingFile(null);
      setFileError("Use a PDF or image (PNG, JPG, JPEG).");
      return;
    }
    setPendingFile(file);
  };

  const runOcrFromPendingFile = () => {
    if (!pendingFile) return;
    revokePoUrl();
    const url = URL.createObjectURL(pendingFile);
    poBlobUrlRef.current = url;
    setDraft({
      ...initialData,
      poDocumentName: pendingFile.name,
      poDocumentUrl: url,
    });
    setPhase("ocr");
  };

  const itemCountLabel = useMemo(() => {
    const count = draft.lineItems.length;
    return `${count} ${count === 1 ? "Item" : "Items"} Linked >`;
  }, [draft.lineItems.length]);
  const validationErrors = useMemo(
    () => getDirectOrderSummaryValidationErrors(draft, cmOptions),
    [cmOptions, draft],
  );
  const canMarkAsWon = validationErrors.length === 0;

  const backControl = (
    <Button variant="ghost" size="sm" className="w-fit gap-1.5 px-2" onClick={onBack}>
      <ArrowLeft className="size-4" />
      {backButtonLabel}
    </Button>
  );

  if (phase === "upload") {
    return (
      <div className="h-full overflow-y-auto bg-background">
        <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-4 py-5 md:px-6">
          {backControl}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">Direct order — Buyer PO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Upload the Buyer PO (PDF or PNG / JPG / JPEG). OCR will run after you continue.
              </p>
              <div
                className={cn(
                  "rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center transition-colors",
                  pendingFile && "border-primary/40 bg-primary/5",
                )}
              >
                <Upload className="mx-auto size-10 text-muted-foreground" aria-hidden />
                <Label htmlFor="buyer-po-upload" className="mt-4 block cursor-pointer text-sm font-medium text-primary hover:underline">
                  Choose file
                </Label>
                <Input
                  id="buyer-po-upload"
                  type="file"
                  accept={PO_ACCEPT_ATTR}
                  className="sr-only"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    onPickFile(f);
                    e.target.value = "";
                  }}
                />
                {pendingFile && (
                  <p className="mt-3 truncate text-sm text-foreground" title={pendingFile.name}>
                    Selected: <span className="font-medium">{pendingFile.name}</span>
                  </p>
                )}
                {fileError && <p className="mt-2 text-sm text-destructive">{fileError}</p>}
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="button" disabled={!pendingFile} onClick={runOcrFromPendingFile}>
                  Run OCR
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (phase === "ocr") {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="rounded-2xl border border-border/60 bg-card px-8 py-10 text-center shadow-sm">
          <Loader2 className="mx-auto size-8 animate-spin text-primary" />
          <p className="mt-4 text-sm font-medium text-foreground">Running OCR extraction</p>
          <p className="mt-1 text-xs text-muted-foreground">This usually takes a few seconds.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-4 px-4 py-5 md:px-6">
        {backControl}

        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl">Direct Order OCR Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible defaultValue="quote-info">
              <AccordionItem value="quote-info" className="border-b-0">
                <AccordionTrigger className="py-2 text-base font-semibold hover:no-underline">
                  Quote Info
                </AccordionTrigger>
                <AccordionContent className="pb-0">
                  <div className="grid gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 md:grid-cols-2">
                    <ReadOnlyField label="RFQ Number" value={draft.rfqNumber} />
                    <ReadOnlyField label="Buyer CRM Code" value={draft.buyerCrmCode} />
                    <ReadOnlyField label="Creation Date" value={draft.creationDate} />
                    <ReadOnlyField label="Created By" value={draft.createdBy} />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <section className="space-y-3 rounded-xl border border-border/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                OCR Extracted Details
              </h3>
              <a
                href={draft.poDocumentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <FileText className="size-4" />
                {draft.poDocumentName}
              </a>

              <div className="grid gap-4 md:grid-cols-2">
                <ReadOnlyField label="Grasim GST & Signature" value={draft.grasimGstAndSignature} />
                <EditableInput
                  label="PO Number"
                  value={draft.poNumber}
                  onChange={(value) => setDraft((current) => ({ ...current, poNumber: value }))}
                />
                <EditableInput
                  label="Buyer Account"
                  value={draft.buyerAccount}
                  onChange={(value) => setDraft((current) => ({ ...current, buyerAccount: value }))}
                />
                <EditableInput
                  label="Payment Terms"
                  value={draft.paymentTerms}
                  onChange={(value) => setDraft((current) => ({ ...current, paymentTerms: value }))}
                />
              </div>

              <EditableTextarea
                label="Shipping Address"
                value={draft.shippingAddress}
                onChange={(value) => setDraft((current) => ({ ...current, shippingAddress: value }))}
              />
              <EditableTextarea
                label="Billing Address"
                value={draft.billingAddress}
                onChange={(value) => setDraft((current) => ({ ...current, billingAddress: value }))}
              />

              <button
                type="button"
                onClick={() => setIsLineItemsSheetOpen(true)}
                className="w-full rounded-xl border border-dashed border-primary/50 bg-primary/5 px-4 py-3 text-left text-sm font-medium text-primary hover:bg-primary/10"
              >
                {itemCountLabel}
              </button>
            </section>

            <section className="space-y-3 rounded-xl border border-border/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Additional BDM Data Capture
              </h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>INCOTERMS</Label>
                  <Select
                    value={draft.incoterms}
                    onValueChange={(value) => setDraft((current) => ({ ...current, incoterms: value }))}
                  >
                    <SelectTrigger className={EDITABLE_FIELD_CLASS}>
                      <SelectValue placeholder="Select Incoterms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EXW">EXW</SelectItem>
                      <SelectItem value="FCA">FCA</SelectItem>
                      <SelectItem value="FOB">FOB</SelectItem>
                      <SelectItem value="CIF">CIF</SelectItem>
                      <SelectItem value="DAP">DAP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <EditableInput
                  label="Total Shipping Charges to Buyer (INR)"
                  value={draft.shippingChargesToBuyer}
                  onChange={(value) => setDraft((current) => ({ ...current, shippingChargesToBuyer: value }))}
                />
              </div>

              <EditableTextarea
                label="Invoice Terms & Conditions"
                value={draft.invoiceTermsAndConditions}
                onChange={(value) =>
                  setDraft((current) => ({ ...current, invoiceTermsAndConditions: value }))
                }
              />

              <div className="space-y-1.5">
                <Label>Assigning CM Flow</Label>
                <Select
                  value={draft.assignedCmId}
                  onValueChange={(value) => setDraft((current) => ({ ...current, assignedCmId: value }))}
                >
                  <SelectTrigger className={EDITABLE_FIELD_CLASS}>
                    <SelectValue placeholder="Select CM" />
                  </SelectTrigger>
                  <SelectContent>
                    {cmOptions.map((cm) => (
                      <SelectItem key={cm.id} value={cm.id}>
                        {cm.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>

            <div className="flex justify-end">
              <Button
                disabled={!canMarkAsWon}
                onClick={() => {
                  if (!canMarkAsWon) return;
                  void onMarkAsWon(draft);
                }}
              >
                Mark as Won
              </Button>
            </div>
            {!canMarkAsWon && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm font-medium text-destructive">Complete required fields to continue:</p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-destructive">
                  {validationErrors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <LineItemsExtractionSheet
        open={isLineItemsSheetOpen}
        onOpenChange={setIsLineItemsSheetOpen}
        items={draft.lineItems}
        poDocumentName={draft.poDocumentName}
        poDocumentUrl={draft.poDocumentUrl}
        onSave={(lineItems) => setDraft((current) => ({ ...current, lineItems }))}
      />
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="rounded-md border border-border/60 bg-muted px-3 py-2 text-sm text-foreground">
        {value || "—"}
      </div>
    </div>
  );
}

function EditableInput({
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
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={EDITABLE_FIELD_CLASS}
      />
    </div>
  );
}

function EditableTextarea({
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
      <Textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className={EDITABLE_FIELD_CLASS}
      />
    </div>
  );
}
