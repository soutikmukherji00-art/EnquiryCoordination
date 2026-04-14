import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
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

interface DirectOrderOcrSummaryPageProps {
  initialData: DirectOrderSummaryData;
  cmOptions: Array<{ id: string; name: string }>;
  onBack: () => void;
  onMarkAsWon: (nextData: DirectOrderSummaryData) => void;
}

export function DirectOrderOcrSummaryPage({
  initialData,
  cmOptions,
  onBack,
  onMarkAsWon,
}: DirectOrderOcrSummaryPageProps) {
  const [isOcrLoading, setIsOcrLoading] = useState(true);
  const [isLineItemsSheetOpen, setIsLineItemsSheetOpen] = useState(false);
  const [draft, setDraft] = useState<DirectOrderSummaryData>(initialData);

  useEffect(() => {
    setDraft(initialData);
    setIsOcrLoading(true);
    const timeoutMs = Math.floor(Math.random() * 3000) + 2000;
    const timer = window.setTimeout(() => setIsOcrLoading(false), timeoutMs);
    return () => window.clearTimeout(timer);
  }, [initialData]);

  const itemCountLabel = useMemo(() => {
    const count = draft.lineItems.length;
    return `${count} ${count === 1 ? "Item" : "Items"} Linked >`;
  }, [draft.lineItems.length]);

  if (isOcrLoading) {
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
        <Button variant="ghost" size="sm" className="w-fit gap-1.5 px-2" onClick={onBack}>
          <ArrowLeft className="size-4" />
          Back to RFQ List
        </Button>

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
                    <SelectTrigger>
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
                  <SelectTrigger>
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
              <Button onClick={() => onMarkAsWon(draft)}>Mark as Won</Button>
            </div>
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
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
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
      <Textarea value={value} onChange={(event) => onChange(event.target.value)} rows={3} />
    </div>
  );
}
