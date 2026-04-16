import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { ArrowLeft, Paperclip, Plus, Search, Upload } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import type { DraftEnquiryDocument } from "@/domain/enquiry/enquiry.creation";
import type {
  WinSignalBuyerConfirmationSnippet,
  WinSignalPODocument,
} from "@/domain/enquiry/enquiry.approval";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import {
  addCatalogSelectionsToCart,
  countEnquiryCartItems,
  ENQUIRY_CART_CATALOG_ITEMS,
  filterEnquiryCartItems,
  removeEnquiryCartItemAtIndex,
  updateEnquiryCartItemQuantity,
} from "@/domain/enquiry/enquiry.cart";

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
  | "poNumber"
  | "totalShippingChargesToBuyer"
  | "invoiceTermsAndConditions"

type WizardStep = 1 | 2 | 3;

type MandatoryField = {
  key: MandatoryFieldKey;
  label: string;
  step: WizardStep;
};

type EvidenceItem =
  | {
      key: string;
      kind: "document";
      title: string;
      subtitle: string;
      timestamp: Date;
    }
  | {
      key: string;
      kind: "confirmation";
      title: string;
      subtitle: string;
      timestamp: Date;
    };

const MANDATORY_FIELD_ORDER: MandatoryField[] = [
  { key: "buyerAccount", label: "Buyer Account", step: 1 },
  { key: "lineItems", label: "Line Items", step: 1 },
  { key: "shippingAddress", label: "Ship to", step: 1 },
  { key: "paymentTerms", label: "Payment Terms", step: 1 },
  { key: "billingAddress", label: "Billing Address", step: 2 },
  { key: "poNumber", label: "PO Number", step: 2 },
  { key: "invoiceTermsAndConditions", label: "Invoice Terms & Conditions", step: 2 },
  { key: "incoterms", label: "INCOTERMS", step: 3 },
  { key: "totalShippingChargesToBuyer", label: "Total Shipping charges to Buyer", step: 3 },
];

const WIZARD_STEPS: Array<{ id: WizardStep; title: string }> = [
  { id: 1, title: "Review Details" },
  { id: 2, title: "PO and Billing" },
  { id: 3, title: "Logistics & Final Checks" },
];

const STEP_LABELS: Record<WizardStep, string> = {
  1: "Mark As Won",
  2: "Next",
  3: "Submit",
};

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
    poNumber: hasText(record.requirements.poNumber),
    totalShippingChargesToBuyer: typeof record.logisticsDetails?.totalShippingChargesToBuyer === "number",
    invoiceTermsAndConditions: hasText(record.requirements.invoiceTermsAndConditions),
  };

  return MANDATORY_FIELD_ORDER.filter((field) => !checks[field.key]);
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
  hasWinSignals: _hasWinSignals,
  poDocuments,
  buyerConfirmations,
  onRecordUpdate,
  onRunPoExtraction,
  onBack,
  onConfirm,
  confirmSubmitting = false,
  cmOptions = [],
}: BdmMarkWonStepPageProps) {
  const [draftRecord, setDraftRecord] = useState<EnquiryRecord | undefined>(record);
  const [isProceeding, setIsProceeding] = useState(false);
  const [attemptedSteps, setAttemptedSteps] = useState<Set<WizardStep>>(new Set());
  const [extractionThemes, setExtractionThemes] = useState<string[]>([]);
  const [prefilledFields, setPrefilledFields] = useState<string[]>([]);
  const [poExtractionSummaryVisible, setPoExtractionSummaryVisible] = useState(false);
  const [poExtractionError, setPoExtractionError] = useState<string | null>(null);
  const [uploadKey, setUploadKey] = useState(0);
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [lineItemSearchQuery, setLineItemSearchQuery] = useState("");
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [catalogTab, setCatalogTab] = useState<"Steel & Allied" | "All Categories">("Steel & Allied");
  const [selectedCatalogItems, setSelectedCatalogItems] = useState<Set<string>>(new Set());
  const billingAddressListId = `billing-address-options-${enquiryId}`;

  useEffect(() => {
    setDraftRecord(record);
  }, [record]);

  useEffect(() => {
    setAttemptedSteps(new Set());
    setPoExtractionSummaryVisible(false);
    setPoExtractionError(null);
    setExtractionThemes([]);
    setPrefilledFields([]);
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

  const evidenceItems = useMemo<EvidenceItem[]>(() => {
    const documents: EvidenceItem[] = poEvidenceList.map((doc) => ({
      key: doc.key,
      kind: "document",
      title: doc.name,
      subtitle: doc.type || "Document",
      timestamp: doc.timestamp,
    }));
    const confirmations: EvidenceItem[] = buyerConfirmations.map((item) => ({
      key: `confirmation-${item.messageId}`,
      kind: "confirmation",
      title: "Buyer Confirmation",
      subtitle: item.content,
      timestamp: item.timestamp,
    }));
    return [...documents, ...confirmations].sort(
      (left, right) => right.timestamp.getTime() - left.timestamp.getTime(),
    );
  }, [buyerConfirmations, poEvidenceList]);

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

  const removeLineItem = (index: number) => {
    setDraftRecord((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        products: removeEnquiryCartItemAtIndex(prev.products, index),
      };
    });
  };

  const missingMandatoryFields = useMemo(() => validateMandatoryFields(draftRecord), [draftRecord]);
  const missingFieldKeys = useMemo(
    () => new Set(missingMandatoryFields.map((field) => field.key)),
    [missingMandatoryFields],
  );
  const missingCurrentStep = useMemo(
    () => missingMandatoryFields.filter((field) => field.step === currentStep),
    [currentStep, missingMandatoryFields],
  );
  const shouldShowCurrentStepErrors = attemptedSteps.has(currentStep);
  const missingCurrentStepKeys = useMemo(
    () => new Set(missingCurrentStep.map((field) => field.key)),
    [missingCurrentStep],
  );
  const cartItemCount = countEnquiryCartItems(draftRecord?.products);
  const categoriesValue = useMemo(() => {
    if (!draftRecord?.requirements.categories?.length) return "Not available";
    return draftRecord.requirements.categories.join(", ");
  }, [draftRecord]);
  const filteredLineItems = useMemo(
    () => filterEnquiryCartItems(draftRecord?.products, lineItemSearchQuery),
    [draftRecord?.products, lineItemSearchQuery],
  );
  const filteredCatalogItems = useMemo(() => {
    return ENQUIRY_CART_CATALOG_ITEMS.filter((item) => {
      const matchesTab = catalogTab === "All Categories" ? true : item.category === "Steel & Allied";
      const query = catalogSearchQuery.trim().toLowerCase();
      const matchesQuery = !query || `${item.name} ${item.description}`.toLowerCase().includes(query);
      return matchesTab && matchesQuery;
    });
  }, [catalogSearchQuery, catalogTab]);

  const getFieldClassName = (isMissing: boolean): string =>
    `h-10 w-full rounded-md border px-3 text-sm text-foreground shadow-sm transition-[color,box-shadow,border-color] focus-visible:outline-none focus-visible:ring-[3px] ${
      isMissing
        ? "border-destructive bg-destructive/5 focus-visible:ring-destructive/25"
        : "border-border/70 bg-muted/35 focus-visible:border-ring focus-visible:ring-ring/35"
    }`;

  const showStepError = (key: MandatoryFieldKey) => shouldShowCurrentStepErrors && missingCurrentStepKeys.has(key);

  const updateLineItemQuantity = (index: number, quantity: string) => {
    setDraftRecord((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        products: updateEnquiryCartItemQuantity(prev.products, index, quantity),
      };
    });
  };

  const toggleCatalogSelection = (itemId: string) => {
    setSelectedCatalogItems((previous) => {
      const next = new Set(previous);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const applyCatalogSelection = () => {
    if (selectedCatalogItems.size === 0) {
      setIsCartSheetOpen(false);
      return;
    }

    setDraftRecord((prev) => {
      if (!prev) return prev;
      const primaryCategory = prev.requirements.categories?.[0] || "Other";
      return {
        ...prev,
        products: addCatalogSelectionsToCart(prev.products, selectedCatalogItems, primaryCategory),
      };
    });
    setSelectedCatalogItems(new Set());
    setCatalogSearchQuery("");
    setIsCartSheetOpen(false);
  };

  const handleUploadFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) return;

    const uploadedAttachments: DraftEnquiryDocument[] = files.map((file) => ({
      id: `mark-won-doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      type: file.type || "application/octet-stream",
      url: URL.createObjectURL(file),
      file,
      markAsPO: true,
    }));

    setDraftRecord((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        attachments: [...(prev.attachments ?? []), ...uploadedAttachments],
      };
    });
    setUploadKey((prev) => prev + 1);
    setPoExtractionError(null);

    const latestAttachment = uploadedAttachments[uploadedAttachments.length - 1];
    if (!latestAttachment) return;

    setIsProceeding(true);
    try {
      const extraction = await onRunPoExtraction({
        name: latestAttachment.name,
        type: latestAttachment.type,
        url: latestAttachment.url,
        markAsPO: true,
      });
      setExtractionThemes(extraction.themes);
      setPrefilledFields(extraction.prefilledFields);
      setPoExtractionSummaryVisible(true);
    } catch {
      setPoExtractionError("We couldn't analyze the PO right now. You can still continue filling the form.");
      setPoExtractionSummaryVisible(false);
      setExtractionThemes([]);
      setPrefilledFields([]);
    } finally {
      setIsProceeding(false);
    }
  };

  const markCurrentStepAttempted = () => {
    setAttemptedSteps((prev) => {
      const next = new Set(prev);
      next.add(currentStep);
      return next;
    });
  };

  const handleNextStep = async () => {
    if (!draftRecord) return;
    if (missingCurrentStep.length > 0) {
      markCurrentStepAttempted();
      return;
    }
    await persistDraft();
    setAttemptedSteps(new Set());
    setCurrentStep((prev) => (prev < 3 ? ((prev + 1) as WizardStep) : prev));
  };

  const handlePreviousStep = async () => {
    await persistDraft();
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as WizardStep) : prev));
  };

  const handleSubmitCurrentStep = async () => {
    if (!draftRecord || isProceeding || confirmSubmitting) return;
    if (missingCurrentStep.length > 0) {
      markCurrentStepAttempted();
      return;
    }
    setIsProceeding(true);
    try {
      await persistDraft();
      await onConfirm();
    } finally {
      setIsProceeding(false);
    }
  };

  const sectionCardClassName = "space-y-3 rounded-xl border border-border/60 bg-card p-5";
  const sectionHeadingClassName = "text-base font-semibold text-foreground";

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5 px-5 py-5 md:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card px-4 py-3">
          <Button type="button" variant="ghost" size="sm" className="gap-1.5 px-2 text-sm" onClick={onBack}>
            <ArrowLeft className="size-4" />
            Back to enquiry
          </Button>
          <div className="h-5" />
        </div>

        {!draftRecord ? (
          <p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
            Structured record not found for this enquiry.
          </p>
        ) : (
          <div className="grid min-h-0 grid-cols-1 gap-5 lg:grid-cols-[1.8fr_1fr]">
            <div className="space-y-5">
              <div>
                <h1 className="text-4xl font-normal tracking-tight text-foreground">
                  {WIZARD_STEPS.find((step) => step.id === currentStep)?.title}
                </h1>
              </div>

              {currentStep === 1 && (
                <>
                  <section className={sectionCardClassName}>
                    <h2 className={sectionHeadingClassName}>Details</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">
                          Buyer Account <span className="text-destructive">*</span>
                        </span>
                        <input
                          className={getFieldClassName(showStepError("buyerAccount"))}
                          value={draftRecord.buyer.company ?? ""}
                          onChange={(event) => patchBuyer({ company: event.target.value })}
                        />
                        {showStepError("buyerAccount") && (
                          <p className="text-xs text-destructive">Buyer Account is mandatory.</p>
                        )}
                      </label>
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">
                          Ship to <span className="text-destructive">*</span>
                        </span>
                        <input
                          className={getFieldClassName(showStepError("shippingAddress"))}
                          value={draftRecord.requirements.deliveryLocation ?? ""}
                          onChange={(event) => patchRequirements({ deliveryLocation: event.target.value })}
                        />
                        {showStepError("shippingAddress") && (
                          <p className="text-xs text-destructive">Ship to is mandatory.</p>
                        )}
                      </label>
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">Scope of Unloading</span>
                        <input
                          className={getFieldClassName(false)}
                          value={draftRecord.requirements.scopeOfUnloading ?? ""}
                          onChange={(event) => patchRequirements({ scopeOfUnloading: event.target.value })}
                        />
                      </label>
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">Expected ETA</span>
                        <input
                          className={getFieldClassName(false)}
                          type="number"
                          min={0}
                          value={draftRecord.requirements.etaDays ?? ""}
                          onChange={(event) =>
                            patchRequirements({
                              etaDays: event.target.value.trim() === "" ? undefined : Number(event.target.value),
                            })
                          }
                        />
                      </label>
                    </div>
                  </section>

                  <section className={sectionCardClassName}>
                    <div className="flex items-center justify-between gap-3">
                      <h2 className={sectionHeadingClassName}>Cart</h2>
                    </div>
                    <div className="space-y-3">
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">Product Category</span>
                        <p
                          className={`rounded-md border px-3 py-2 text-sm ${
                            showStepError("lineItems")
                              ? "border-destructive bg-destructive/5 text-destructive"
                              : "border-border/70 bg-muted/20 text-foreground"
                          }`}
                        >
                          {categoriesValue}
                        </p>
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsCartSheetOpen(true)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition hover:bg-muted/20 ${
                          showStepError("lineItems")
                            ? "border-destructive bg-destructive/5"
                            : "border-border/60 bg-background"
                        }`}
                      >
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Line Items</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                          {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Click to view and manage cart items</p>
                      </button>
                    </div>
                    {showStepError("lineItems") && (
                      <p className="text-xs text-destructive">At least one line item is mandatory.</p>
                    )}
                  </section>

                  <section className={sectionCardClassName}>
                    <h2 className={sectionHeadingClassName}>Define Terms</h2>
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">Deal Amount</span>
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
                          Payment Terms <span className="text-destructive">*</span>
                        </span>
                        <input
                          className={getFieldClassName(showStepError("paymentTerms"))}
                          value={draftRecord.requirements.paymentTerms ?? ""}
                          onChange={(event) => patchRequirements({ paymentTerms: event.target.value })}
                        />
                        {showStepError("paymentTerms") && (
                          <p className="text-xs text-destructive">Payment Terms is mandatory.</p>
                        )}
                      </label>
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">Enhancer Terms</span>
                        <input
                          className={getFieldClassName(false)}
                          value={(draftRecord.requirements.enhancerTypes ?? []).join(", ")}
                          onChange={(event) =>
                            patchRequirements({
                              enhancerTypes: event.target.value
                                .split(",")
                                .map((value) => value.trim())
                                .filter(Boolean),
                            })
                          }
                        />
                      </label>
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">IDD</span>
                        <input
                          className={getFieldClassName(false)}
                          type="number"
                          min={0}
                          value={draftRecord.requirements.iddDays ?? ""}
                          onChange={(event) =>
                            patchRequirements({
                              iddDays: event.target.value.trim() === "" ? undefined : Number(event.target.value),
                            })
                          }
                        />
                      </label>
                      <label className="block space-y-1 text-sm">
                        <span className="text-muted-foreground">MDD</span>
                        <input
                          className={getFieldClassName(false)}
                          type="number"
                          min={0}
                          value={draftRecord.requirements.mddDays ?? ""}
                          onChange={(event) =>
                            patchRequirements({
                              mddDays: event.target.value.trim() === "" ? undefined : Number(event.target.value),
                            })
                          }
                        />
                      </label>
                    </div>
                  </section>
                </>
              )}

              {currentStep === 2 && (
                <section className={sectionCardClassName}>
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
                      className={getFieldClassName(showStepError("billingAddress"))}
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
                    {showStepError("billingAddress") && (
                      <p className="text-xs text-destructive">Billing Address is mandatory.</p>
                    )}
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">
                      PO Number <span className="text-destructive">*</span>
                    </span>
                    <input
                      className={getFieldClassName(showStepError("poNumber"))}
                      value={draftRecord.requirements.poNumber ?? ""}
                      onChange={(event) => patchRequirements({ poNumber: event.target.value })}
                    />
                    {showStepError("poNumber") && (
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
                      className={`${getFieldClassName(showStepError("invoiceTermsAndConditions"))} min-h-28 py-2`}
                      value={draftRecord.requirements.invoiceTermsAndConditions ?? ""}
                      onChange={(event) => patchRequirements({ invoiceTermsAndConditions: event.target.value })}
                    />
                    {showStepError("invoiceTermsAndConditions") && (
                      <p className="text-xs text-destructive">Invoice Terms & Conditions is mandatory.</p>
                    )}
                  </label>
                </section>
              )}

              {currentStep === 3 && (
                <section className={sectionCardClassName}>
                  <label className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">
                      INCOTERMS <span className="text-destructive">*</span>
                    </span>
                    <select
                      className={getFieldClassName(showStepError("incoterms"))}
                      value={draftRecord.logisticsDetails?.incoterms ?? ""}
                      onChange={(event) => patchLogistics({ incoterms: event.target.value || undefined })}
                    >
                      <option value="">--Select--</option>
                      <option value="EXW">EXW</option>
                      <option value="FOB">FOB</option>
                      <option value="CIF">CIF</option>
                      <option value="DAP">DAP</option>
                    </select>
                    {showStepError("incoterms") && (
                      <p className="text-xs text-destructive">INCOTERMS is mandatory.</p>
                    )}
                  </label>
                  <label className="block space-y-1 text-sm">
                    <span className="text-muted-foreground">
                      Total Shipping charges to Buyer <span className="text-destructive">*</span>
                    </span>
                    <input
                      className={getFieldClassName(showStepError("totalShippingChargesToBuyer"))}
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
                    {showStepError("totalShippingChargesToBuyer") && (
                      <p className="text-xs text-destructive">Total Shipping charges to Buyer is mandatory.</p>
                    )}
                  </label>
                </section>
              )}
            </div>

            <aside className="space-y-5 lg:sticky lg:top-5 lg:self-start">
              <section className="space-y-4 rounded-xl border border-border/60 bg-card p-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className={sectionHeadingClassName}>Documents</h2>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-muted/20 px-3 py-1.5 text-sm">
                    <Upload className="size-4" />
                    Add PO
                    <input
                      key={uploadKey}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleUploadFiles}
                    />
                  </label>
                </div>

                {evidenceItems.length === 0 ? (
                  <p className="rounded-md border border-dashed border-border/70 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                    No documents or confirmations attached yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {evidenceItems.map((item) => (
                      <div
                        key={item.key}
                        className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-muted/10 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.kind === "document" ? item.subtitle : `Snippet: ${item.subtitle}`}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            {item.kind === "document" ? "File" : "Confirmation"}
                          </p>
                          <p className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {(poExtractionSummaryVisible || poExtractionError) && (
                <section className="space-y-4 rounded-xl border border-border/60 bg-card p-5">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className={sectionHeadingClassName}>PO Analysis Summary</h2>
                    {isProceeding ? (
                      <span className="text-xs text-muted-foreground">Analyzing...</span>
                    ) : null}
                  </div>

                  {poExtractionError ? (
                    <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                      {poExtractionError}
                    </div>
                  ) : null}

                  {poExtractionSummaryVisible ? (
                    <>
                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Identified themes</p>
                        <div className="flex flex-wrap gap-2">
                          {extractionThemes.length > 0 ? (
                            extractionThemes.map((theme) => (
                              <span
                                key={theme}
                                className="rounded-full border border-border/60 bg-muted/30 px-2 py-1 text-xs text-foreground"
                              >
                                {theme}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">No themes identified</span>
                          )}
                        </div>
                      </div>

                      <div className="rounded-lg border border-border/60 bg-muted/10 p-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Identified fields</p>
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
                          <p className="mt-2 text-sm text-muted-foreground">No fields were identified.</p>
                        )}
                      </div>
                    </>
                  ) : null}
                </section>
              )}

              {shouldShowCurrentStepErrors && missingCurrentStep.length > 0 && (
                <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  <p className="font-medium">Complete mandatory fields to continue:</p>
                  <p className="mt-1">{missingCurrentStep.map((field) => field.label).join(", ")}</p>
                </div>
              )}

              <div className="flex gap-3">
                {currentStep > 1 && (
                  <Button type="button" variant="outline" className="flex-1" onClick={handlePreviousStep}>
                    Previous
                  </Button>
                )}
                <Button
                  type="button"
                  className="flex-1"
                  onClick={currentStep === 3 ? handleSubmitCurrentStep : handleNextStep}
                  disabled={isProceeding || confirmSubmitting}
                >
                  {isProceeding
                    ? "Processing..."
                    : confirmSubmitting
                      ? "Submitting..."
                      : STEP_LABELS[currentStep]}
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>

      <Sheet
        open={isCartSheetOpen}
        onOpenChange={(open) => {
          setIsCartSheetOpen(open);
          if (!open) {
            setSelectedCatalogItems(new Set());
            setCatalogSearchQuery("");
          }
        }}
      >
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl p-0">
          <SheetHeader className="border-b border-border/60 px-4 py-3">
            <SheetTitle>Line Items ({cartItemCount})</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 overflow-y-auto p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={lineItemSearchQuery}
                onChange={(event) => setLineItemSearchQuery(event.target.value)}
                placeholder="Search Item"
                className="pl-9"
              />
            </div>

            {filteredLineItems.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 px-4 py-8 text-center text-sm text-muted-foreground">
                No matching items found.
              </p>
            ) : (
              <div className="space-y-3">
                {filteredLineItems.map(({ product, index }) => (
                  <div
                    key={`${product.name || product.category}-${index}`}
                    className="rounded-xl border border-border/60 bg-background p-4"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{product.name || product.category}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLineItem(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                    <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Quantity
                    </Label>
                    <Input
                      aria-label={`Quantity for ${product.name || product.category}`}
                      value={product.quantity || ""}
                      onChange={(event) => updateLineItemQuantity(index, event.target.value)}
                      placeholder="Enter Quantity"
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-4 rounded-xl border border-border/60 bg-muted/10 p-4">
              <div className="grid grid-cols-2 rounded-lg border border-border/60 p-1 text-sm">
                <button
                  type="button"
                  onClick={() => setCatalogTab("Steel & Allied")}
                  className={`rounded-md px-2 py-1.5 font-medium transition ${
                    catalogTab === "Steel & Allied" ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  Steel & Allied
                </button>
                <button
                  type="button"
                  onClick={() => setCatalogTab("All Categories")}
                  className={`rounded-md px-2 py-1.5 font-medium transition ${
                    catalogTab === "All Categories" ? "bg-primary text-primary-foreground" : "text-foreground"
                  }`}
                >
                  All Categories
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Select value="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Category</SelectItem>
                  </SelectContent>
                </Select>
                <Select value="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Sub Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sub Category</SelectItem>
                  </SelectContent>
                </Select>
                <Select value="all">
                  <SelectTrigger>
                    <SelectValue placeholder="Brands" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Brands</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={catalogSearchQuery}
                  onChange={(event) => setCatalogSearchQuery(event.target.value)}
                  placeholder="Search by Item Name"
                  className="pl-9"
                />
              </div>

              <p className="text-sm font-semibold text-foreground">Filtered Results ({filteredCatalogItems.length})</p>
              <div className="space-y-1">
                {filteredCatalogItems.map((item) => {
                  const selected = selectedCatalogItems.has(item.id);
                  return (
                    <div key={item.id} className="flex items-start justify-between gap-4 border-b border-border/40 py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label={`Add catalog item ${item.name}`}
                        onClick={() => toggleCatalogSelection(item.id)}
                        className={selected ? "text-primary" : "text-muted-foreground"}
                      >
                        {selected ? "Added" : <Plus className="size-4" />}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <SheetFooter className="grid grid-cols-2 gap-3 border-t border-border/60 p-4">
            <Button variant="outline" onClick={() => setIsCartSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyCatalogSelection}>Add Items</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
