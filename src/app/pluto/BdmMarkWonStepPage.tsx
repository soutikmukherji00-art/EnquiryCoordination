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
}

const BILLING_ADDRESS_PLACEHOLDER = "__unselected__";

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
}: BdmMarkWonStepPageProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [activeEvidenceTab, setActiveEvidenceTab] = useState<"po" | "buyer">("po");
  const [draftRecord, setDraftRecord] = useState<EnquiryRecord | undefined>(record);
  const [isProceeding, setIsProceeding] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [extractionThemes, setExtractionThemes] = useState<string[]>([]);
  const [prefilledFields, setPrefilledFields] = useState<string[]>([]);
  const [uploadKey, setUploadKey] = useState(0);

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
    if (!draftRecord || isProceeding) return;
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
    await persistDraft();
    setStep(3);
  };

  const handleSaveAndExit = async () => {
    await persistDraft();
    onBack();
  };

  const handleConfirmMarkWon = async () => {
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
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={draftRecord.buyer.name}
                        onChange={(event) => patchBuyer({ name: event.target.value })}
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">Company</span>
                      <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={draftRecord.buyer.company ?? ""}
                        onChange={(event) => patchBuyer({ company: event.target.value })}
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">GSTIN</span>
                      <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={draftRecord.buyer.gstin ?? ""}
                        onChange={(event) => patchBuyer({ gstin: event.target.value })}
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">Primary Contact</span>
                      <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={draftRecord.buyer.primaryContact ?? ""}
                        onChange={(event) => patchBuyer({ primaryContact: event.target.value })}
                      />
                    </label>
                  </section>

                  <section className="space-y-3 rounded-lg border border-border bg-card p-4">
                    <h2 className="text-sm font-semibold text-foreground">Commercial Snapshot</h2>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">Payment Terms</span>
                      <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={draftRecord.requirements.paymentTerms ?? ""}
                        onChange={(event) => patchRequirements({ paymentTerms: event.target.value })}
                      />
                    </label>
                    <label className="block space-y-1 text-sm">
                      <span className="text-muted-foreground">Estimated Value</span>
                      <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                      <span className="text-muted-foreground">Delivery Location</span>
                      <input
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={draftRecord.requirements.deliveryLocation ?? ""}
                        onChange={(event) => patchRequirements({ deliveryLocation: event.target.value })}
                      />
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
                <h2 className="text-sm font-semibold text-foreground">PO details and billing (Step 1)</h2>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">Billing Preference</span>
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={draftRecord.requirements.billingPreference ?? ""}
                    onChange={(event) => patchRequirements({ billingPreference: event.target.value })}
                  />
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">Billing Address</span>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={draftRecord.requirements.billingAddress ?? BILLING_ADDRESS_PLACEHOLDER}
                    onChange={(event) =>
                      patchRequirements({
                        billingAddress:
                          event.target.value === BILLING_ADDRESS_PLACEHOLDER ? undefined : event.target.value,
                      })
                    }
                  >
                    <option value={BILLING_ADDRESS_PLACEHOLDER}>--Select--</option>
                    {billingAddressOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">PO Received Date</span>
                    <input
                      type="date"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={draftRecord.requirements.poReceivedDate ?? ""}
                      onChange={(event) => patchRequirements({ poReceivedDate: event.target.value })}
                    />
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">PO Received Time</span>
                    <input
                      type="time"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={draftRecord.requirements.poReceivedTime ?? ""}
                      onChange={(event) => patchRequirements({ poReceivedTime: event.target.value })}
                    />
                  </label>
                </div>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">Invoice Terms & Conditions</span>
                  <textarea
                    className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={draftRecord.requirements.invoiceTermsAndConditions ?? ""}
                    onChange={(event) => patchRequirements({ invoiceTermsAndConditions: event.target.value })}
                  />
                </label>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 rounded-lg border border-border bg-card p-4">
                <h2 className="text-sm font-semibold text-foreground">Logistics and final checks (Step 2)</h2>
                <p className="text-xs text-muted-foreground">
                  Confirm grouped logistics inputs before marking the enquiry as won.
                </p>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">INCOTERMS</span>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={draftRecord.logisticsDetails?.incoterms ?? ""}
                    onChange={(event) => patchLogistics({ incoterms: event.target.value || undefined })}
                  >
                    <option value="">--Select--</option>
                    <option value="EXW">EXW</option>
                    <option value="FOB">FOB</option>
                    <option value="CIF">CIF</option>
                    <option value="DAP">DAP</option>
                  </select>
                </label>
                <label className="block space-y-1 text-sm">
                  <span className="text-muted-foreground">Total Shipping charges to Buyer</span>
                  <input
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {step === 1 && (
                <>
                  <Button type="button" variant="outline" onClick={onBack} disabled={isProceeding || confirmSubmitting}>
                    Cancel
                  </Button>
                  <Button type="button" onClick={handleProceed} disabled={isProceeding || confirmSubmitting}>
                    {isProceeding ? "Processing..." : "Proceed"}
                  </Button>
                </>
              )}
              {step === 2 && (
                <>
                  <Button type="button" variant="outline" onClick={() => setStep(1)} disabled={isProceeding || confirmSubmitting}>
                    Back
                  </Button>
                  <Button type="button" onClick={handleStepTwoNext} disabled={isProceeding || confirmSubmitting}>
                    Next
                  </Button>
                </>
              )}
              {step === 3 && (
                <>
                  <Button type="button" variant="outline" onClick={handleSaveAndExit} disabled={confirmSubmitting}>
                    Save & Exit
                  </Button>
                  <Button type="button" onClick={handleConfirmMarkWon} disabled={confirmSubmitting}>
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
