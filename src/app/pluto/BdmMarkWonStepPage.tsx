import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ArrowLeft, CheckCircle2, Circle, Paperclip, Upload } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import type { DraftEnquiryDocument } from "@/domain/enquiry/enquiry.creation";
import type {
  WinSignalBuyerConfirmationSnippet,
  WinSignalPODocument,
} from "@/domain/enquiry/enquiry.approval";

export interface BdmMarkWonStepPageProps {
  enquiryId: string;
  record?: EnquiryRecord;
  hasWinSignals: boolean;
  poDocuments: WinSignalPODocument[];
  buyerConfirmations: WinSignalBuyerConfirmationSnippet[];
  onRecordUpdate: (nextRecord: EnquiryRecord) => void | Promise<void>;
  onRunPoExtraction: (attachment: {
    name?: string;
    type?: string;
    url?: string;
    markAsPO?: boolean;
  }) => Promise<{ themes: string[]; prefilledFields: string[] }>;
  onBack: () => void;
  onConfirm: () => void | Promise<void>;
  confirmSubmitting?: boolean;
  cmOptions?: Array<{ id: string; name: string }>;
}

const BILLING_ADDRESS_PLACEHOLDER = "__unselected__";

type MandatoryFieldKey =
  | "buyerAccount"
  | "lineItems"
  | "billingAddress"
  | "shippingAddress"
  | "paymentTerms"
  | "incoterms"
  | "grasimGst"
  | "poNumber"
  | "totalShippingChargesToBuyer"
  | "invoiceTermsAndConditions"
  | "categoryManager";

type MandatoryField = {
  key: MandatoryFieldKey;
  label: string;
  step: 1 | 2 | 3;
};

const MANDATORY_FIELD_ORDER: MandatoryField[] = [
  { key: "buyerAccount", label: "Buyer Account", step: 1 },
  { key: "lineItems", label: "Line Items", step: 1 },
  { key: "shippingAddress", label: "Shipping Address", step: 1 },
  { key: "paymentTerms", label: "Payment Terms", step: 1 },
  { key: "grasimGst", label: "Grasim GST", step: 1 },
  { key: "categoryManager", label: "Category Manager", step: 1 },
  { key: "billingAddress", label: "Billing Address", step: 2 },
  { key: "poNumber", label: "PO Number", step: 2 },
  { key: "invoiceTermsAndConditions", label: "Invoice Terms & Conditions", step: 2 },
  { key: "incoterms", label: "INCOTERMS", step: 3 },
  { key: "totalShippingChargesToBuyer", label: "Total Shipping charges to Buyer", step: 3 },
];

function hasText(value?: string | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

function validateMandatoryFields(record?: EnquiryRecord): MandatoryField[] {
  if (!record) return MANDATORY_FIELD_ORDER;
  const buyerAccountPresent = hasText(record.buyer.company) || hasText(record.buyer.name);
  const lineItemsPresent = (record.products ?? []).some(
    (item) => hasText(item.category) || hasText(item.name) || hasText(item.quantity),
  );

  const checks: Record<MandatoryFieldKey, boolean> = {
    buyerAccount: buyerAccountPresent,
    lineItems: lineItemsPresent,
    billingAddress: hasText(record.requirements.billingAddress),
    shippingAddress: hasText(record.requirements.deliveryLocation),
    paymentTerms: hasText(record.requirements.paymentTerms),
    incoterms: hasText(record.logisticsDetails?.incoterms),
    grasimGst: hasText(record.buyer.gstin),
    poNumber: hasText(record.requirements.poNumber),
    totalShippingChargesToBuyer: typeof record.logisticsDetails?.totalShippingChargesToBuyer === "number",
    invoiceTermsAndConditions: hasText(record.requirements.invoiceTermsAndConditions),
    categoryManager: hasText(record.assignment.primaryCMId),
  };

  return MANDATORY_FIELD_ORDER.filter((field) => !checks[field.key]);
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

function formatTimestamp(value: Date): string {
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function BdmMarkWonStepPage({
  enquiryId,
  record,
  hasWinSignals,
  poDocuments,
  buyerConfirmations,
  onRecordUpdate,
  onRunPoExtraction,
  onBack,
  onConfirm,
  confirmSubmitting = false,
  cmOptions = [],
}: BdmMarkWonStepPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<"po" | "buyer">("po");
  const [draftRecord, setDraftRecord] = useState<EnquiryRecord | undefined>(record);
  const [isProceeding, setIsProceeding] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [extractionThemes, setExtractionThemes] = useState<string[]>([]);
  const [prefilledFields, setPrefilledFields] = useState<string[]>([]);
  const [uploadKey, setUploadKey] = useState(0);
  const billingAddressListId = `billing-address-options-${enquiryId}`;

  useEffect(() => {
    setDraftRecord(record);
  }, [record]);

  const billingAddressOptions = useMemo(() => {
    const fromRecord = draftRecord?.requirements.deliveryLocations ?? [];
    const withPrimary = draftRecord?.requirements.deliveryLocation
      ? [draftRecord.requirements.deliveryLocation, ...fromRecord]
      : fromRecord;
    return Array.from(new Set(withPrimary.filter(Boolean)));
  }, [draftRecord]);

  const poEvidenceList = useMemo(() => {
    const uploaded = (draftRecord?.attachments ?? [])
      .filter((attachment) => attachment.markAsPO)
      .map((attachment) => ({
        key: `record-${attachment.id}`,
        name: attachment.name,
        type: attachment.type,
        timestamp: draftRecord?.createdAt ?? new Date(),
      }));
    const fromMessages = poDocuments.map((doc) => ({
      key: `msg-${doc.messageId}`,
      name: doc.name,
      type: doc.type,
      timestamp: doc.timestamp,
    }));
    return [...uploaded, ...fromMessages];
  }, [draftRecord, poDocuments]);

  const persistDraft = async () => {
    if (!draftRecord) return;
    await onRecordUpdate(draftRecord);
  };

  const patchRequirements = (patch: Partial<EnquiryRecord["requirements"]>) => {
    setDraftRecord((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        requirements: {
          ...prev.requirements,
          ...patch,
        },
      };
    });
  };

  const patchBuyer = (patch: Partial<EnquiryRecord["buyer"]>) => {
    setDraftRecord((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        buyer: {
          ...prev.buyer,
          ...patch,
        },
      };
    });
  };

  const patchLogistics = (patch: Partial<NonNullable<EnquiryRecord["logisticsDetails"]>>) => {
    setDraftRecord((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        logisticsDetails: {
          ...(prev.logisticsDetails ?? {}),
          ...patch,
        },
      };
    });
  };

  const patchAssignment = (patch: Partial<EnquiryRecord["assignment"]>) => {
    setDraftRecord((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        assignment: {
          ...prev.assignment,
          ...patch,
        },
      };
    });
  };

  const addLineItem = () => {
    setDraftRecord((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        products: [...(prev.products ?? []), { category: "", name: "", quantity: "" }],
      };
    });
  };

  const patchLineItem = (
    index: number,
    patch: Partial<NonNullable<EnquiryRecord["products"]>[number]>,
  ) => {
    setDraftRecord((prev) => {
      if (!prev) return prev;
      const current = [...(prev.products ?? [])];
      if (!current[index]) return prev;
      current[index] = {
        ...current[index],
        ...patch,
      };
      return {
        ...prev,
        products: current,
      };
    });
  };

  const removeLineItem = (index: number) => {
    setDraftRecord((prev) => {
      if (!prev) return prev;
      const current = [...(prev.products ?? [])];
      if (!current[index]) return prev;
      current.splice(index, 1);
      return {
        ...prev,
        products: current,
      };
    });
  };

  const missingMandatoryFields = useMemo(() => validateMandatoryFields(draftRecord), [draftRecord]);
  const missingFieldKeys = useMemo(
    () => new Set(missingMandatoryFields.map((field) => field.key)),
    [missingMandatoryFields],
  );
  const missingStepOne = useMemo(
    () => missingMandatoryFields.filter((field) => field.step === 1),
    [missingMandatoryFields],
  );
  const missingStepTwo = useMemo(
    () => missingMandatoryFields.filter((field) => field.step <= 2),
    [missingMandatoryFields],
  );

  const getFieldClassName = (isMissing: boolean): string =>
    `w-full rounded-md border bg-background px-3 py-2 text-sm ${
      isMissing ? "border-destructive focus-visible:ring-destructive" : "border-input"
    }`;

  const handleUploadFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    setDraftRecord((prev) => {
      if (!prev) return prev;
      const nextAttachments: DraftEnquiryDocument[] = [...(prev.attachments ?? [])];
      files.forEach((file) => {
        nextAttachments.push({
          id: `mark-won-doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: file.name,
          type: file.type || "application/octet-stream",
          url: URL.createObjectURL(file),
          file,
          markAsPO: true,
        });
      });
      return {
        ...prev,
        attachments: nextAttachments,
      };
    });
    setUploadKey((prev) => prev + 1);
  };

  const handleProceed = async () => {
    if (!draftRecord || isProceeding || missingStepOne.length > 0) return;
    setIsProceeding(true);
    try {
      await persistDraft();
      const localPoAttachment = draftRecord.attachments?.find((attachment) => attachment.markAsPO);
      const fallbackPoDoc = poDocuments[0];
      const extraction = await onRunPoExtraction({
        name: localPoAttachment?.name ?? fallbackPoDoc?.name ?? "PO document",
        type: localPoAttachment?.type ?? fallbackPoDoc?.type ?? "application/pdf",
        url: localPoAttachment?.url ?? fallbackPoDoc?.url,
        markAsPO: true,
      });
      setExtractionThemes(extraction.themes);
      setPrefilledFields(extraction.prefilledFields);
      setReviewDialogOpen(true);
    } finally {
      setIsProceeding(false);
    }
  };

  const handleStepTwoNext = async () => {
    if (missingStepTwo.length > 0) return;
    await persistDraft();
    setStep(3);
  };

  const handleSaveAndExit = async () => {
    await persistDraft();
    onBack();
  };

  const handleConfirmMarkWon = async () => {
    if (missingMandatoryFields.length > 0) return;
    await persistDraft();
    await onConfirm();
  };

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-5 px-5 py-6 md:px-6">
        <div className="flex items-center justify-between rounded-xl border border-border/60 bg-card px-4 py-3">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-2" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Back to enquiry
          </Button>
          <div className="flex items-center gap-3">
            <StepNode label="Structured details" completed={step > 1} active={step === 1} />
            <span className="h-px w-8 bg-border" />
            <StepNode label="PO details" completed={step > 2} active={step === 2} />
            <span className="h-px w-8 bg-border" />
            <StepNode label="Logistics" active={step === 3} />
          </div>
        </div>

        <div>
          <h1 className="text-lg font-semibold text-foreground">Mark as won</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review structured data and PO signals for {enquiryId} before final submission.
          </p>
        </div>

        {!draftRecord ? (
          <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Structured record not found for this enquiry.
          </p>
        ) : (
          <>
            {step === 1 && (
              <div className="space-y-5">
                <p className="rounded-lg border border-[#4039ad]/35 bg-[#4039ad]/5 px-4 py-3 text-sm text-[#2f2a88]">
                  All fields below are editable. Fields marked with <span className="font-semibold">*</span> are mandatory.
                </p>
                {!hasWinSignals && (
                  <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    No PO or buyer-confirmation marks were found yet. You can still proceed and upload PO documents.
                  </p>
                )}

                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="space-y-3 rounded-lg border border-border bg-card p-4">
                    <h2 className="text-sm font-semibold text-foreground">Structured Buyer Details</h2>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">Buyer Name</span>
                      <input
                        className={getFieldClassName(false)}
                        value={draftRecord.buyer.name}
                        onChange={(event) => patchBuyer({ name: event.target.value })}
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">
                        Buyer Account <span className="text-destructive">*</span>
                      </span>
                      <input
                        className={getFieldClassName(missingFieldKeys.has("buyerAccount"))}
                        value={draftRecord.buyer.company ?? ""}
                        onChange={(event) => patchBuyer({ company: event.target.value })}
                      />
                      {missingFieldKeys.has("buyerAccount") && (
                        <p className="text-xs text-destructive">Buyer Account is mandatory.</p>
                      )}
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">
                        Grasim GST <span className="text-destructive">*</span>
                      </span>
                      <input
                        className={getFieldClassName(missingFieldKeys.has("grasimGst"))}
                        value={draftRecord.buyer.gstin ?? ""}
                        onChange={(event) => patchBuyer({ gstin: event.target.value })}
                      />
                      {missingFieldKeys.has("grasimGst") && (
                        <p className="text-xs text-destructive">Grasim GST is mandatory.</p>
                      )}
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">Primary Contact</span>
                      <input
                        className={getFieldClassName(false)}
                        value={draftRecord.buyer.primaryContact ?? ""}
                        onChange={(event) => patchBuyer({ primaryContact: event.target.value })}
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">
                        Category Manager <span className="text-destructive">*</span>
                      </span>
                      <select
                        className={getFieldClassName(missingFieldKeys.has("categoryManager"))}
                        value={draftRecord.assignment.primaryCMId ?? ""}
                        onChange={(event) => {
                          const selectedId = event.target.value || undefined;
                          const selected = cmOptions.find((item) => item.id === selectedId);
                          patchAssignment({
                            primaryCMId: selectedId,
                            primaryCMName: selected?.name,
                          });
                        }}
                      >
                        <option value="">--Select--</option>
                        {cmOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                      {missingFieldKeys.has("categoryManager") && (
                        <p className="text-xs text-destructive">Category Manager is mandatory.</p>
                      )}
                    </label>
                  </section>

                  <section className="space-y-3 rounded-lg border border-border bg-card p-4">
                    <h2 className="text-sm font-semibold text-foreground">Commercial Snapshot</h2>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">
                        Payment Terms <span className="text-destructive">*</span>
                      </span>
                      <input
                        className={getFieldClassName(missingFieldKeys.has("paymentTerms"))}
                        value={draftRecord.requirements.paymentTerms ?? ""}
                        onChange={(event) => patchRequirements({ paymentTerms: event.target.value })}
                      />
                      {missingFieldKeys.has("paymentTerms") && (
                        <p className="text-xs text-destructive">Payment Terms is mandatory.</p>
                      )}
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">Estimated Value</span>
                      <input
                        className={getFieldClassName(false)}
                        type="number"
                        min={0}
                        value={draftRecord.requirements.estimatedValue ?? ""}
                        onChange={(event) =>
                          patchRequirements({
                            estimatedValue:
                              event.target.value.trim() === "" ? undefined : Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">
                        Shipping Address <span className="text-destructive">*</span>
                      </span>
                      <input
                        className={getFieldClassName(missingFieldKeys.has("shippingAddress"))}
                        value={draftRecord.requirements.deliveryLocation ?? ""}
                        onChange={(event) => patchRequirements({ deliveryLocation: event.target.value })}
                      />
                      {missingFieldKeys.has("shippingAddress") && (
                        <p className="text-xs text-destructive">Shipping Address is mandatory.</p>
                      )}
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">Notes</span>
                      <textarea
                        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={draftRecord.requirements.notes ?? ""}
                        onChange={(event) => patchRequirements({ notes: event.target.value })}
                      />
                    </label>
                  </section>
                </div>

                <section className="space-y-3 rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-foreground">
                      Line Items <span className="text-destructive">*</span>
                    </h2>
                    <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                      Add line item
                    </Button>
                  </div>
                  {(draftRecord.products ?? []).length === 0 ? (
                    <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                      No line items yet. Add at least one line item to proceed.
                    </p>
                  ) : (
                    (draftRecord.products ?? []).map((item, index) => (
                      <div key={`line-item-${index}`} className="rounded-md border border-border p-3">
                        <div className="grid gap-2 md:grid-cols-3">
                          <input
                            className={getFieldClassName(false)}
                            placeholder="Category"
                            value={item.category ?? ""}
                            onChange={(event) => patchLineItem(index, { category: event.target.value })}
                          />
                          <input
                            className={getFieldClassName(false)}
                            placeholder="Item name"
                            value={item.name ?? ""}
                            onChange={(event) => patchLineItem(index, { name: event.target.value })}
                          />
                          <input
                            className={getFieldClassName(false)}
                            placeholder="Quantity"
                            value={item.quantity ?? ""}
                            onChange={(event) => patchLineItem(index, { quantity: event.target.value })}
                          />
                        </div>
                        <div className="mt-2 flex justify-end">
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeLineItem(index)}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                  {missingFieldKeys.has("lineItems") && (
                    <p className="text-xs text-destructive">At least one line item is mandatory.</p>
                  )}
                </section>

                <section className="space-y-4 rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold text-foreground">PO and Buyer Confirmation Evidence</h2>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-1.5 text-sm">
                      <Upload className="size-4" />
                      Upload document
                      <input
                        key={uploadKey}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={handleUploadFiles}
                      />
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={activeEvidenceTab === "po" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveEvidenceTab("po")}
                    >
                      PO Documents
                    </Button>
                    <Button
                      type="button"
                      variant={activeEvidenceTab === "buyer" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveEvidenceTab("buyer")}
                    >
                      Buyer Confirmation
                    </Button>
                  </div>

                  {activeEvidenceTab === "po" ? (
                    <div className="space-y-2">
                      {poEvidenceList.length === 0 ? (
                        <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                          No PO document attached yet.
                        </p>
                      ) : (
                        poEvidenceList.map((doc) => (
                          <div key={doc.key} className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.type || "Document"}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{formatTimestamp(doc.timestamp)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {buyerConfirmations.length === 0 ? (
                        <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                          No buyer confirmation snippet tagged yet.
                        </p>
                      ) : (
                        buyerConfirmations.map((item) => (
                          <div key={item.messageId} className="rounded-md border border-border px-3 py-2">
                            <p className="text-sm text-foreground">{item.content}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </section>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground">PO details and billing (Step 2)</h2>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">Billing Preference</span>
                  <input
                    className={getFieldClassName(false)}
                    value={draftRecord.requirements.billingPreference ?? ""}
                    onChange={(event) => patchRequirements({ billingPreference: event.target.value })}
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">
                    Billing Address <span className="text-destructive">*</span>
                  </span>
                  <input
                    list={billingAddressListId}
                    className={getFieldClassName(missingFieldKeys.has("billingAddress"))}
                    value={draftRecord.requirements.billingAddress ?? ""}
                    onChange={(event) =>
                      patchRequirements({
                        billingAddress:
                          event.target.value === BILLING_ADDRESS_PLACEHOLDER ? undefined : event.target.value,
                      })
                    }
                  />
                  <datalist id={billingAddressListId}>
                    {billingAddressOptions.map((item) => (
                      <option key={item} value={item} />
                    ))}
                  </datalist>
                  {missingFieldKeys.has("billingAddress") && (
                    <p className="text-xs text-destructive">Billing Address is mandatory.</p>
                  )}
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">
                    PO Number <span className="text-destructive">*</span>
                  </span>
                  <input
                    className={getFieldClassName(missingFieldKeys.has("poNumber"))}
                    value={draftRecord.requirements.poNumber ?? ""}
                    onChange={(event) => patchRequirements({ poNumber: event.target.value })}
                  />
                  {missingFieldKeys.has("poNumber") && (
                    <p className="text-xs text-destructive">PO Number is mandatory.</p>
                  )}
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">PO Received Date</span>
                    <input
                      type="date"
                      className={getFieldClassName(false)}
                      value={draftRecord.requirements.poReceivedDate ?? ""}
                      onChange={(event) => patchRequirements({ poReceivedDate: event.target.value })}
                    />
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">PO Received Time</span>
                    <input
                      type="time"
                      className={getFieldClassName(false)}
                      value={draftRecord.requirements.poReceivedTime ?? ""}
                      onChange={(event) => patchRequirements({ poReceivedTime: event.target.value })}
                    />
                  </label>
                </div>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">
                    Invoice Terms & Conditions <span className="text-destructive">*</span>
                  </span>
                  <textarea
                    className={`min-h-28 w-full rounded-md border bg-background px-3 py-2 text-sm ${
                      missingFieldKeys.has("invoiceTermsAndConditions")
                        ? "border-destructive focus-visible:ring-destructive"
                        : "border-input"
                    }`}
                    value={draftRecord.requirements.invoiceTermsAndConditions ?? ""}
                    onChange={(event) => patchRequirements({ invoiceTermsAndConditions: event.target.value })}
                  />
                  {missingFieldKeys.has("invoiceTermsAndConditions") && (
                    <p className="text-xs text-destructive">Invoice Terms & Conditions is mandatory.</p>
                  )}
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground">Logistics and final checks (Step 3)</h2>
                <p className="text-xs text-muted-foreground">
                  Confirm grouped logistics inputs before marking the enquiry as won.
                </p>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">
                    INCOTERMS <span className="text-destructive">*</span>
                  </span>
                  <select
                    className={getFieldClassName(missingFieldKeys.has("incoterms"))}
                    value={draftRecord.logisticsDetails?.incoterms ?? ""}
                    onChange={(event) => patchLogistics({ incoterms: event.target.value || undefined })}
                  >
                    <option value="">--Select--</option>
                    <option value="EXW">EXW</option>
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="DAP">DAP</option>
                  </select>
                  {missingFieldKeys.has("incoterms") && (
                    <p className="text-xs text-destructive">INCOTERMS is mandatory.</p>
                  )}
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">
                    Total Shipping charges to Buyer <span className="text-destructive">*</span>
                  </span>
                  <input
                    className={getFieldClassName(missingFieldKeys.has("totalShippingChargesToBuyer"))}
                    type="number"
                    min={0}
                    value={draftRecord.logisticsDetails?.totalShippingChargesToBuyer ?? ""}
                    onChange={(event) =>
                      patchLogistics({
                        totalShippingChargesToBuyer:
                          event.target.value.trim() === "" ? undefined : Number(event.target.value),
                      })
                    }
                  />
                  {missingFieldKeys.has("totalShippingChargesToBuyer") && (
                    <p className="text-xs text-destructive">Total Shipping charges to Buyer is mandatory.</p>
                  )}
                </label>
              </div>
            )}

            {((step === 1 && missingStepOne.length > 0) ||
              (step === 2 && missingStepTwo.length > 0) ||
              (step === 3 && missingMandatoryFields.length > 0)) && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <p className="font-medium">Complete mandatory fields to continue:</p>
                <p className="mt-1">
                  {(step === 1
                    ? missingStepOne
                    : step === 2
                    ? missingStepTwo
                    : missingMandatoryFields
                  )
                    .map((field) => field.label)
                    .join(", ")}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {step === 1 && (
                <>
                  <Button type="button" variant="outline" onClick={onBack} disabled={isProceeding || confirmSubmitting}>
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleProceed}
                    disabled={isProceeding || confirmSubmitting || missingStepOne.length > 0}
                  >
                    {isProceeding ? "Processing..." : "Proceed"}
                  </Button>
                </>
              )}
              {step === 2 && (
                <>
                  <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isProceeding || confirmSubmitting}>
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleStepTwoNext}
                    disabled={isProceeding || confirmSubmitting || missingStepTwo.length > 0}
                  >
                    Next
                  </Button>
                </>
              )}
              {step === 3 && (
                <>
                  <Button type="button" variant="outline" onClick={handleSaveAndExit} disabled={confirmSubmitting}>
                    Save & Exit
                  </Button>
                  <Button
                    type="button"
                    onClick={handleConfirmMarkWon}
                    disabled={confirmSubmitting || missingMandatoryFields.length > 0}
                  >
                    {confirmSubmitting ? "Submitting..." : "Mark As Won"}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm PO extraction</DialogTitle>
            <DialogDescription>
              Review what was identified from the PO before continuing to billing details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {extractionThemes.length > 0 ? (
                extractionThemes.map((theme) => (
                  <span
                    key={theme}
                    className="rounded-full border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700"
                  >
                    {theme}
                  </span>
                ))
              ) : (
                <span className="rounded-full border border-border px-2 py-1 text-xs text-muted-foreground">
                  No themes identified
                </span>
              )}
            </div>
            <div className="rounded-md border border-border p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Prefilled fields</p>
              {prefilledFields.length > 0 ? (
                <ul className="mt-2 space-y-1 text-sm text-foreground">
                  {prefilledFields.map((field) => (
                    <li key={field} className="flex items-center gap-2">
                      <Paperclip className="size-3.5 text-muted-foreground" />
                      {field}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No additional fields were prefilled.</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Review again
            </Button>
            <Button
              type="button"
              onClick={() => {
                setReviewDialogOpen(false);
                setStep(2);
              }}
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
