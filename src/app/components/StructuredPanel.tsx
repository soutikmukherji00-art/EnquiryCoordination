import { memo, useMemo, useState, useCallback, type ReactNode } from "react";
import { FileText, Sparkles, Edit2, Download, ImageIcon, Save, X, MoreVertical, ArrowLeft, Plus, Search } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/app/components/ui/sheet";
import type { Message } from "@/domain/message/message.types";
import { buildStructuredDocuments, type DocumentItem } from "./structured-panel.utils";
import { EnquirySourcePreview } from "./EnquirySourcePreview";
import { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import { createEnquiryRecordUpdatedEvent } from "@/domain/enquiry/enquiry.events";
import {
  addCatalogSelectionsToCart,
  countEnquiryCartItems,
  ENQUIRY_CART_CATALOG_ITEMS,
  filterEnquiryCartItems,
  removeEnquiryCartItemAtIndex,
  updateEnquiryCartItemQuantity,
} from "@/domain/enquiry/enquiry.cart";
import { getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { toast } from "sonner";

interface StructuredPanelProps {
  enquiryId: string;
  record: EnquiryRecord | undefined;
  summary: string;
  showAISummary?: boolean;
  onDispatchEvent: (event: any) => void;
  messagesByChannel?: Record<string, Message[]> | null;
  validationErrors?: string[];
  cmOptions?: Array<{ id: string; name: string }>;
  suppressHeaderDuplicates?: boolean;
}

const CREDIT_ENHANCER_OPTIONS = [
  { value: "bank-guarantee", label: "Bank Guarantee" },
  { value: "lc", label: "LC" },
  { value: "standby-lc", label: "Standby LC" },
  { value: "corporate-guarantee", label: "Corporate Guarantee" },
];

const getEnhancerLabel = (value: string) =>
  CREDIT_ENHANCER_OPTIONS.find((option) => option.value === value)?.label || value;

export const StructuredPanel = memo(function StructuredPanel({
  enquiryId,
  record,
  summary,
  showAISummary = false,
  onDispatchEvent,
  messagesByChannel,
  validationErrors,
  cmOptions = [],
  suppressHeaderDuplicates: _suppressHeaderDuplicates,
}: StructuredPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<EnquiryRecord | undefined>(record);
  const [viewMode, setViewMode] = useState<"structured" | "documents" | "cart">("structured");
  const [lineItemSearchQuery, setLineItemSearchQuery] = useState("");
  const [catalogSearchQuery, setCatalogSearchQuery] = useState("");
  const [catalogTab, setCatalogTab] = useState<"Steel & Allied" | "All Categories">("Steel & Allied");
  const [isAddItemSheetOpen, setIsAddItemSheetOpen] = useState(false);
  const [selectedCatalogItems, setSelectedCatalogItems] = useState<Set<string>>(new Set());

  const documents = useMemo<DocumentItem[]>(() => {
    return buildStructuredDocuments(messagesByChannel);
  }, [messagesByChannel]);

  const handleStartEdit = useCallback(() => {
    setEditedRecord(JSON.parse(JSON.stringify(record))); // Deep clone for editing
    setIsEditing(true);
    setViewMode("structured");
  }, [record]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedRecord(record);
    setViewMode("structured");
  }, [record]);

  const handleSave = useCallback(() => {
    if (editedRecord) {
      const nextRecord = JSON.parse(JSON.stringify(editedRecord)) as EnquiryRecord;
      if (nextRecord.buyer.id) {
        const canonicalBuyer = getBuyerById(nextRecord.buyer.id);
        if (canonicalBuyer) {
          nextRecord.buyer.name = canonicalBuyer.name;
          if (!nextRecord.buyer.company) {
            nextRecord.buyer.company = canonicalBuyer.name;
          }
        }
      }
      onDispatchEvent(createEnquiryRecordUpdatedEvent(enquiryId, nextRecord));
      setIsEditing(false);
      setViewMode("structured");
      toast.success("Enquiry details updated successfully");
    }
  }, [enquiryId, editedRecord, onDispatchEvent]);

  const updateBuyerField = (field: string, value: any) => {
    if (!editedRecord) return;
    setEditedRecord({
      ...editedRecord,
      buyer: { ...editedRecord.buyer, [field]: value }
    });
  };

  const updateRequirementField = (field: string, value: any) => {
    if (!editedRecord) return;
    setEditedRecord({
      ...editedRecord,
      requirements: { ...editedRecord.requirements, [field]: value }
    });
  };

  const updateAssignmentField = (field: string, value: any) => {
    if (!editedRecord) return;
    setEditedRecord({
      ...editedRecord,
      assignment: { ...editedRecord.assignment, [field]: value }
    });
  };

  const displayRecord = isEditing ? editedRecord : record;
  const validationErrorSet = useMemo(() => new Set(validationErrors || []), [validationErrors]);
  const buyerNameLocked = Boolean(displayRecord?.buyer.id);
  const cmNameById = useMemo(() => {
    const map = new Map<string, string>();
    cmOptions.forEach((option) => map.set(option.id, option.name));
    return map;
  }, [cmOptions]);
  const hasValidationError = useCallback(
    (label: string) => validationErrorSet.has(label),
    [validationErrorSet],
  );
  const inputClassName = useCallback(
    (hasError: boolean, readOnlyClassName = "") =>
      [
        !isEditing ? readOnlyClassName : "",
        hasError ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500" : "",
      ]
        .filter(Boolean)
        .join(" "),
    [isEditing],
  );

  const cartItemCount = countEnquiryCartItems(displayRecord?.products);
  const categoriesValue = useMemo(() => {
    if (!displayRecord?.requirements.categories?.length) return "Not available";
    return displayRecord.requirements.categories.join(", ");
  }, [displayRecord]);

  const enhancerTypesValue = useMemo(() => {
    if (!displayRecord?.requirements.enhancerTypes?.length) return "Not available";
    return displayRecord.requirements.enhancerTypes.map(getEnhancerLabel).join(", ");
  }, [displayRecord]);

  const formatDaysValue = useCallback((value?: number) => {
    if (!value || value <= 0) return "Not available";
    return `${value} Days`;
  }, []);

  const removeProductFromRecord = useCallback(
    (indexToRemove: number) => {
      if (!editedRecord) return;
      setEditedRecord({
        ...editedRecord,
        products: removeEnquiryCartItemAtIndex(editedRecord.products, indexToRemove),
      });
    },
    [editedRecord],
  );

  const updateProductQuantity = useCallback(
    (indexToUpdate: number, quantity: string) => {
      if (!editedRecord) return;
      setEditedRecord({
        ...editedRecord,
        products: updateEnquiryCartItemQuantity(editedRecord.products, indexToUpdate, quantity),
      });
    },
    [editedRecord],
  );

  const filteredLineItems = useMemo(() => {
    return filterEnquiryCartItems(displayRecord?.products, lineItemSearchQuery);
  }, [displayRecord?.products, lineItemSearchQuery]);

  const filteredCatalogItems = useMemo(() => {
    return ENQUIRY_CART_CATALOG_ITEMS.filter((item) => {
      const matchesTab = catalogTab === "All Categories" ? true : item.category === "Steel & Allied";
      const query = catalogSearchQuery.trim().toLowerCase();
      const matchesQuery = !query || `${item.name} ${item.description}`.toLowerCase().includes(query);
      return matchesTab && matchesQuery;
    });
  }, [catalogSearchQuery, catalogTab]);

  const toggleCatalogSelection = useCallback((itemId: string) => {
    setSelectedCatalogItems((previous) => {
      const next = new Set(previous);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const applyCatalogSelection = useCallback(() => {
    if (selectedCatalogItems.size === 0 || !editedRecord) {
      setIsAddItemSheetOpen(false);
      return;
    }
    const primaryCategory = editedRecord.requirements.categories?.[0] || "Other";
    setEditedRecord({
      ...editedRecord,
      products: addCatalogSelectionsToCart(editedRecord.products, selectedCatalogItems, primaryCategory),
    });
    setIsAddItemSheetOpen(false);
    setSelectedCatalogItems(new Set());
    setCatalogSearchQuery("");
  }, [editedRecord, selectedCatalogItems]);

  const renderFileBadge = (type: string, markAsPO?: boolean) => {
    if (type.includes("pdf")) {
      return (
        <BadgeRow primaryLabel="PDF" primaryClassName="bg-red-500 text-white border-red-500 hover:bg-red-500" markAsPO={markAsPO} />
      );
    }

    if (type.startsWith("image/")) {
      return (
        <BadgeRow primaryLabel="IMG" primaryClassName="bg-blue-500 text-white border-blue-500 hover:bg-blue-500" markAsPO={markAsPO} />
      );
    }

    return <BadgeRow primaryLabel="FILE" primaryClassName="text-gray-700" variant="secondary" markAsPO={markAsPO} />;
  };

  if (!displayRecord) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No enquiry record found
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full min-h-0 w-full bg-white border-l border-gray-200/50 overflow-hidden"
      data-structured-panel
    >
      <div className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-gray-200/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Enquiry Details</h2>
            {!isEditing ? (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleStartEdit} className="text-primary gap-1.5">
                  <Edit2 className="size-4" /> Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8 text-gray-600" aria-label="More options">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setViewMode("documents")} className="cursor-pointer">
                      Documents
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel} className="text-gray-500">
                  <X className="size-4 mr-1.5" /> Cancel
                </Button>
                <Button size="sm" onClick={handleSave} className="bg-primary text-white gap-1.5">
                  <Save className="size-4" /> Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {viewMode === "structured" ? (
            <div className="p-6 space-y-8">
              {/* AI Summary Block */}
              {!isEditing && showAISummary && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="size-4 text-blue-600" />
                    <span className="font-medium text-sm text-gray-900">
                      AI Summary
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {summary}
                  </p>
                </div>
              )}

              {!isEditing && (
                <EnquirySourcePreview
                  record={displayRecord}
                  summary={summary}
                  messagesByChannel={messagesByChannel}
                  className="shadow-none"
                />
              )}

              <Section label="Buyer Details" icon={<Sparkles className="size-4 text-primary" />}>
                <div className="grid gap-4">
                  <Field label="Buyer Name" isEditing={isEditing}>
                    <Input
                      value={displayRecord.buyer.name}
                      onChange={(e) => updateBuyerField("name", e.target.value)}
                      disabled={!isEditing || buyerNameLocked}
                      className={inputClassName(
                        hasValidationError("Buyer name"),
                        "bg-transparent border-none p-0 h-auto font-medium",
                      )}
                    />
                  </Field>
                  <Field label="Ship To" isEditing={isEditing}>
                    <Input
                      value={displayRecord.requirements.deliveryLocation || ""}
                      onChange={(e) => updateRequirementField("deliveryLocation", e.target.value)}
                      disabled={!isEditing}
                      className={inputClassName(
                        hasValidationError("Delivery location"),
                        "bg-transparent border-none p-0 h-auto",
                      )}
                    />
                  </Field>
                  <Field label="Scope of Unloading" isEditing={isEditing}>
                    <Input
                      value={displayRecord.requirements.scopeOfUnloading || ""}
                      onChange={(e) => updateRequirementField("scopeOfUnloading", e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-transparent border-none p-0 h-auto" : ""}
                    />
                  </Field>
                  <Field label="Expected ETA" isEditing={isEditing}>
                    <Input
                      type="number"
                      value={displayRecord.requirements.etaDays ?? ""}
                      onChange={(e) => updateRequirementField("etaDays", parseInt(e.target.value, 10))}
                      disabled={!isEditing}
                      className={inputClassName(
                        hasValidationError("ETA (days)"),
                        "bg-transparent border-none p-0 h-auto",
                      )}
                    />
                  </Field>
                </div>
              </Section>

              <Section label="Cart" icon={<FileText className="size-4 text-primary" />}>
                <Field label="Product Category" isEditing={false}>
                  <p
                    className={`text-sm ${
                      hasValidationError("Product category") ? "rounded-md border border-red-500 px-2 py-1 text-red-700" : "text-gray-800"
                    }`}
                  >
                    {categoriesValue}
                  </p>
                </Field>
                <button
                  type="button"
                  onClick={() => setViewMode("cart")}
                  className={`w-full rounded-xl border px-4 py-3 text-left transition hover:bg-gray-50 ${
                    hasValidationError("At least one product line") ? "border-red-500 text-red-700" : "border-gray-200/55"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Line Items</p>
                  <p className="mt-1 text-sm font-semibold text-gray-900">
                    {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Click to view and manage cart items</p>
                </button>
              </Section>

              <Section label="Define Terms" icon={<Sparkles className="size-4 text-primary" />}>
                <div className="grid gap-4">
                  <Field label="Deal Amount" isEditing={isEditing}>
                    <Input
                      type="number"
                      value={displayRecord.requirements.estimatedValue ?? ""}
                      onChange={(e) => updateRequirementField("estimatedValue", parseFloat(e.target.value))}
                      disabled={!isEditing}
                      className={inputClassName(
                        hasValidationError("Estimated value"),
                        "bg-transparent border-none p-0 h-auto font-medium",
                      )}
                    />
                  </Field>
                  <Field label="Payment Terms" isEditing={isEditing}>
                    {isEditing ? (
                      <Select
                        value={(displayRecord.requirements.paymentTerms || "").toLowerCase()}
                        onValueChange={(value) => {
                          updateRequirementField("paymentTerms", value);
                          if (value !== "credit") {
                            updateRequirementField("enhancerTypes", []);
                          }
                        }}
                      >
                        <SelectTrigger className={inputClassName(hasValidationError("Payment terms"))}>
                          <SelectValue placeholder="Select payment terms" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Credit</SelectItem>
                          <SelectItem value="advance">Advance</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={displayRecord.requirements.paymentTerms || ""}
                        disabled
                        className={inputClassName(
                          hasValidationError("Payment terms"),
                          "bg-transparent border-none p-0 h-auto",
                        )}
                      />
                    )}
                  </Field>
                  <Field label="Enhancer Types" isEditing={isEditing}>
                    {isEditing ? (
                      <Select
                        value={displayRecord.requirements.enhancerTypes?.[0] || ""}
                        onValueChange={(value) => updateRequirementField("enhancerTypes", value ? [value] : [])}
                        disabled={(displayRecord.requirements.paymentTerms || "").toLowerCase() !== "credit"}
                      >
                        <SelectTrigger className={inputClassName(false)}>
                          <SelectValue
                            placeholder={
                              (displayRecord.requirements.paymentTerms || "").toLowerCase() === "credit"
                                ? "Select credit enhancer"
                                : "Available only for Credit payment terms"
                            }
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {CREDIT_ENHANCER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm text-gray-800">{enhancerTypesValue}</p>
                    )}
                  </Field>
                  <Field label="IDD" isEditing={isEditing}>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={displayRecord.requirements.iddDays ?? ""}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          updateRequirementField("iddDays", value ? parseInt(value, 10) : undefined);
                        }}
                        className={inputClassName(false)}
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{formatDaysValue(displayRecord.requirements.iddDays)}</p>
                    )}
                  </Field>
                  <Field label="MDD" isEditing={isEditing}>
                    {isEditing ? (
                      <Input
                        type="number"
                        value={displayRecord.requirements.mddDays ?? ""}
                        onChange={(e) => {
                          const value = e.target.value.trim();
                          updateRequirementField("mddDays", value ? parseInt(value, 10) : undefined);
                        }}
                        className={inputClassName(false)}
                      />
                    ) : (
                      <p className="text-sm text-gray-800">{formatDaysValue(displayRecord.requirements.mddDays)}</p>
                    )}
                  </Field>
                  <Field label="Assign Category Manager" isEditing={isEditing}>
                    {isEditing ? (
                      <Select
                        value={displayRecord.assignment.primaryCMId || ""}
                        onValueChange={(value) => {
                          if (!editedRecord) return;
                          const name = cmNameById.get(value) || "";
                          setEditedRecord({
                            ...editedRecord,
                            assignment: {
                              ...editedRecord.assignment,
                              primaryCMId: value,
                              primaryCMName: name,
                            },
                          });
                        }}
                      >
                        <SelectTrigger className={inputClassName(false)}>
                          <SelectValue placeholder="Select CM" />
                        </SelectTrigger>
                        <SelectContent>
                          {cmOptions.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                              {option.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={displayRecord.assignment.primaryCMName || ""}
                        disabled
                        className={inputClassName(false, "bg-transparent border-none p-0 h-auto")}
                      />
                    )}
                  </Field>
                </div>
              </Section>
            </div>
          ) : viewMode === "documents" ? (
            <div className="p-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("structured")}
                className="mb-4 gap-1.5 text-gray-700"
              >
                <ArrowLeft className="size-4" /> Back
              </Button>
              <div className="grid gap-3">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} renderFileBadge={renderFileBadge} />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              <div className="border-b border-gray-200/50 px-4 py-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("structured")}
                  className="mb-2 gap-1.5 text-gray-700"
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <h3 className="text-base font-semibold text-gray-900">Line Items ({cartItemCount})</h3>
              </div>
              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    value={lineItemSearchQuery}
                    onChange={(e) => setLineItemSearchQuery(e.target.value)}
                    placeholder="Search Item"
                    className="pl-9"
                  />
                </div>

                {filteredLineItems.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                    No matching items found.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredLineItems.map(({ product, index }) => (
                      <div key={`${product.name || product.category}-${index}`} className="rounded-xl border border-gray-200/55 p-4">
                        <div className="mb-3 flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{product.name || product.category}</p>
                            <p className="mt-1 text-xs text-gray-500">{product.category}</p>
                          </div>
                          {isEditing && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProductFromRecord(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <Label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Quantity</Label>
                        {isEditing ? (
                          <Input
                            aria-label={`Quantity for ${product.name || product.category}`}
                            value={product.quantity || ""}
                            onChange={(e) => updateProductQuantity(index, e.target.value)}
                            placeholder="Enter Quantity"
                          />
                        ) : (
                          <p className="text-sm text-gray-700">{product.quantity || "Not available"}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="grid grid-cols-2 gap-3 border-t border-gray-200/50 p-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddItemSheetOpen(true)}
                    className="gap-1.5"
                  >
                    <Plus className="size-4" /> Add Item
                  </Button>
                  <Button type="button" onClick={handleSave}>
                    Save
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Sheet open={isAddItemSheetOpen} onOpenChange={setIsAddItemSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] rounded-t-2xl p-0">
          <SheetHeader className="border-b border-gray-200/50 px-4 py-3">
            <SheetTitle>Add Items</SheetTitle>
          </SheetHeader>
          <div className="space-y-4 overflow-y-auto px-4 py-3">
            <div className="grid grid-cols-2 rounded-lg border border-gray-200/55 p-1 text-sm">
              <button
                type="button"
                onClick={() => setCatalogTab("Steel & Allied")}
                className={`rounded-md px-2 py-1.5 font-medium transition ${catalogTab === "Steel & Allied" ? "bg-primary text-white" : "text-gray-700"}`}
              >
                Steel & Allied
              </button>
              <button
                type="button"
                onClick={() => setCatalogTab("All Categories")}
                className={`rounded-md px-2 py-1.5 font-medium transition ${catalogTab === "All Categories" ? "bg-primary text-white" : "text-gray-700"}`}
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
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={catalogSearchQuery}
                onChange={(e) => setCatalogSearchQuery(e.target.value)}
                placeholder="Search by Item Name"
                className="pl-9"
              />
            </div>

            <p className="text-sm font-semibold text-gray-700">Filtered Results ({filteredCatalogItems.length})</p>
            <div className="space-y-1">
              {filteredCatalogItems.map((item) => {
                const selected = selectedCatalogItems.has(item.id);
                return (
                  <div key={item.id} className="flex items-start justify-between gap-4 border-b border-gray-100 py-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="mt-1 text-xs text-gray-500">{item.description}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      aria-label={`Add catalog item ${item.name}`}
                      onClick={() => toggleCatalogSelection(item.id)}
                      className={selected ? "text-primary" : "text-gray-500"}
                    >
                      {selected ? "Added" : <Plus className="size-4" />}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
          <SheetFooter className="grid grid-cols-2 gap-3 border-t border-gray-200/50 p-4">
            <Button variant="outline" onClick={() => setIsAddItemSheetOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyCatalogSelection}>Add Items</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
});

function Section({ label, icon, children, action }: { label: string; icon: ReactNode; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-tight">{label}</h3>
        </div>
        {action}
      </div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm space-y-4">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children, isEditing, className = "", inline = false }: { label: string; children: ReactNode; isEditing: boolean; className?: string; inline?: boolean }) {
  return (
    <div className={`${inline ? "flex items-center gap-2" : "space-y-1"} ${className}`}>
      <Label className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{label}</Label>
      <div className={isEditing ? "mt-0.5" : ""}>
        {children}
      </div>
    </div>
  );
}

type FileBadgeProps = {
  primaryLabel: string;
  primaryClassName: string;
  markAsPO?: boolean;
  variant?: "secondary";
};

function BadgeRow({ primaryLabel, primaryClassName, markAsPO, variant }: FileBadgeProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant={variant} className={primaryClassName}>
        {primaryLabel}
      </Badge>
      {markAsPO && (
        <Badge className="bg-rose-500 text-white border-rose-500 hover:bg-rose-500">
          PO
        </Badge>
      )}
    </div>
  );
}

function DocumentCard({
  doc,
  renderFileBadge,
}: {
  doc: DocumentItem;
  renderFileBadge: (type: string, markAsPO?: boolean) => ReactNode;
}) {
  return (
    <article className="rounded-xl border border-gray-200/55 bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200/55 bg-gray-50">
            {doc.type.startsWith("image/") ? (
              <ImageIcon className="size-4 text-blue-600" />
            ) : (
              <FileText className="size-4 text-gray-700" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-xs font-semibold text-gray-900">{doc.name}</p>
              {renderFileBadge(doc.type, doc.markAsPO)}
            </div>
          </div>
        </div>

        <Button asChild variant="ghost" size="icon" className="size-8 flex-shrink-0">
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            download={doc.isDefault ? "Quote Details.pdf" : undefined}
          >
            <Download className="size-4" />
          </a>
        </Button>
      </div>
    </article>
  );
}
