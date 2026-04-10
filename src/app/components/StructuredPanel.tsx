import { memo, useMemo, useState, useCallback, type ReactNode } from "react";
import { FileText, Sparkles, Edit2, Download, ImageIcon, Save, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { Label } from "@/app/components/ui/label";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import type { Message } from "@/domain/message/message.types";
import { buildStructuredDocuments, type DocumentItem } from "./structured-panel.utils";
import { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import { createEnquiryRecordUpdatedEvent } from "@/domain/enquiry/enquiry.events";
import { toast } from "sonner";

interface StructuredPanelProps {
  enquiryId: string;
  record: EnquiryRecord | undefined;
  summary: string;
  onDispatchEvent: (event: any) => void;
  messagesByChannel?: Record<string, Message[]> | null;
}

export const StructuredPanel = memo(function StructuredPanel({
  enquiryId,
  record,
  summary,
  onDispatchEvent,
  messagesByChannel,
}: StructuredPanelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState<EnquiryRecord | undefined>(record);

  const documents = useMemo<DocumentItem[]>(() => {
    return buildStructuredDocuments(messagesByChannel);
  }, [messagesByChannel]);

  const handleStartEdit = useCallback(() => {
    setEditedRecord(JSON.parse(JSON.stringify(record))); // Deep clone for editing
    setIsEditing(true);
  }, [record]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setEditedRecord(record);
  }, [record]);

  const handleSave = useCallback(() => {
    if (editedRecord) {
      onDispatchEvent(createEnquiryRecordUpdatedEvent(enquiryId, editedRecord));
      setIsEditing(false);
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

  const updateProduct = (idx: number, field: string, value: any) => {
    if (!editedRecord || !editedRecord.products) return;
    const newProducts = [...editedRecord.products];
    newProducts[idx] = { ...newProducts[idx], [field]: value };
    setEditedRecord({ ...editedRecord, products: newProducts });
  };

  const addProduct = () => {
    if (!editedRecord) return;
    const newProducts = [...(editedRecord.products || [])];
    newProducts.push({ category: "Steel", quantity: "0", name: "New Product" });
    setEditedRecord({ ...editedRecord, products: newProducts });
  };

  const removeProduct = (idx: number) => {
    if (!editedRecord || !editedRecord.products) return;
    const newProducts = editedRecord.products.filter((_, i) => i !== idx);
    setEditedRecord({ ...editedRecord, products: newProducts });
  };

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

  const displayRecord = isEditing ? editedRecord : record;

  if (!displayRecord) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No enquiry record found
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full min-h-0 w-full bg-white border-l border-gray-200 overflow-hidden"
      data-structured-panel
    >
      <Tabs defaultValue="structured" className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Structured Data</h2>
            {!isEditing ? (
              <Button variant="ghost" size="sm" onClick={handleStartEdit} className="text-primary gap-1.5">
                <Edit2 className="size-4" /> Edit
              </Button>
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
          <TabsList className="w-full h-auto p-1 bg-gray-100 rounded-xl">
            <TabsTrigger value="structured" className="flex-1">
              Enquiry Details
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">
              Documents
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <TabsContent value="structured" className="m-0">
            <div className="p-6 space-y-8">
              {/* AI Summary Block */}
              {!isEditing && (
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

              {/* Buyer Information Section */}
              <Section label="Buyer Profile" icon={<Sparkles className="size-4 text-primary" />}>
                <div className="grid gap-4">
                  <Field label="Buyer Name" isEditing={isEditing}>
                    <Input
                      value={displayRecord.buyer.name}
                      onChange={(e) => updateBuyerField("name", e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-transparent border-none p-0 h-auto font-medium" : ""}
                    />
                  </Field>
                  <Field label="Company" isEditing={isEditing}>
                    <Input
                      value={displayRecord.buyer.company || ""}
                      onChange={(e) => updateBuyerField("company", e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-transparent border-none p-0 h-auto" : ""}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="GSTIN" isEditing={isEditing}>
                      <Input
                        value={displayRecord.buyer.gstin || ""}
                        onChange={(e) => updateBuyerField("gstin", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Not Provided"
                        className={!isEditing ? "bg-transparent border-none p-0 h-auto" : ""}
                      />
                    </Field>
                    <Field label="Primary Contact" isEditing={isEditing}>
                      <Input
                        value={displayRecord.buyer.primaryContact || ""}
                        onChange={(e) => updateBuyerField("primaryContact", e.target.value)}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-transparent border-none p-0 h-auto" : ""}
                      />
                    </Field>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Credit Limit" isEditing={isEditing}>
                      <Input
                        type="number"
                        value={displayRecord.buyer.creditLimit || 0}
                        onChange={(e) => updateBuyerField("creditLimit", parseFloat(e.target.value))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-transparent border-none p-0 h-auto font-medium text-green-600" : ""}
                      />
                    </Field>
                    <Field label="Open Credit" isEditing={isEditing}>
                      <Input
                        type="number"
                        value={displayRecord.buyer.openCreditLimit || 0}
                        onChange={(e) => updateBuyerField("openCreditLimit", parseFloat(e.target.value))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-transparent border-none p-0 h-auto font-medium text-blue-600" : ""}
                      />
                    </Field>
                  </div>
                </div>
              </Section>

              {/* Requirements Section */}
              <Section label="Requirements & Terms" icon={<FileText className="size-4 text-primary" />}>
                <div className="grid gap-4">
                  <Field label="Delivery Location" isEditing={isEditing}>
                    <Textarea
                      value={displayRecord.requirements.deliveryLocation || ""}
                      onChange={(e) => updateRequirementField("deliveryLocation", e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-transparent border-none p-0 min-h-0 h-auto resize-none" : "min-h-[60px]"}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="ETA (Days)" isEditing={isEditing}>
                      <Input
                        type="number"
                        value={displayRecord.requirements.etaDays || 0}
                        onChange={(e) => updateRequirementField("etaDays", parseInt(e.target.value, 10))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-transparent border-none p-0 h-auto" : ""}
                      />
                    </Field>
                    <Field label="Estimated Value" isEditing={isEditing}>
                      <Input
                        type="number"
                        value={displayRecord.requirements.estimatedValue || 0}
                        onChange={(e) => updateRequirementField("estimatedValue", parseFloat(e.target.value))}
                        disabled={!isEditing}
                        className={!isEditing ? "bg-transparent border-none p-0 h-auto font-medium" : ""}
                      />
                    </Field>
                  </div>
                  <Field label="Payment Terms" isEditing={isEditing}>
                    <Input
                      value={displayRecord.requirements.paymentTerms || ""}
                      onChange={(e) => updateRequirementField("paymentTerms", e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-transparent border-none p-0 h-auto" : ""}
                    />
                  </Field>
                  <Field label="Notes" isEditing={isEditing}>
                    <Textarea
                      value={displayRecord.requirements.notes || ""}
                      onChange={(e) => updateRequirementField("notes", e.target.value)}
                      disabled={!isEditing}
                      className={!isEditing ? "bg-transparent border-none p-0 min-h-0 h-auto resize-none" : "min-h-[80px]"}
                    />
                  </Field>
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="isParentQuote"
                        checked={displayRecord.requirements.isParentQuote}
                        onCheckedChange={(checked) => updateRequirementField("isParentQuote", !!checked)}
                        disabled={!isEditing}
                      />
                      <Label htmlFor="isParentQuote" className="text-sm cursor-pointer">Parent Quote</Label>
                    </div>
                    <Field label="Scope" isEditing={isEditing} inline>
                      <Input
                        value={displayRecord.requirements.scopeOfUnloading || ""}
                        onChange={(e) => updateRequirementField("scopeOfUnloading", e.target.value)}
                        disabled={!isEditing}
                        placeholder="Unloading scope"
                        className={!isEditing ? "bg-transparent border-none p-0 h-auto text-xs" : "h-8 text-xs"}
                      />
                    </Field>
                  </div>
                </div>
              </Section>

              {/* Products Section */}
              <Section
                label="Products"
                icon={<Sparkles className="size-4 text-primary" />}
                action={isEditing && (
                  <Button variant="ghost" size="sm" onClick={addProduct} className="h-7 text-xs text-primary px-2">
                    <Plus className="size-3 mr-1" /> Add
                  </Button>
                )}
              >
                <div className="space-y-4">
                  {(displayRecord.products || []).map((product, idx) => (
                    <div
                      key={idx}
                      className={`space-y-3 pb-4 border-b border-gray-100 last:border-0 ${isEditing ? "bg-gray-50/50 p-3 rounded-lg border-none" : ""}`}
                    >
                      <div className="flex justify-between items-start">
                        <Field label={`Product ${idx + 1}`} isEditing={isEditing} className="flex-1">
                          <Input
                            value={product.name || product.category}
                            onChange={(e) => updateProduct(idx, "name", e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-transparent border-none p-0 h-auto font-medium" : "h-8"}
                          />
                        </Field>
                        {isEditing && (
                          <Button variant="ghost" size="icon" onClick={() => removeProduct(idx)} className="size-8 text-red-500 hover:text-red-600">
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <Field label="Quantity" isEditing={isEditing}>
                          <Input
                            value={product.quantity || ""}
                            onChange={(e) => updateProduct(idx, "quantity", e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-transparent border-none p-0 h-auto text-sm" : "h-8 text-sm"}
                          />
                        </Field>
                        <Field label="Brand/Grade" isEditing={isEditing}>
                          <Input
                            value={product.brand || product.grade || "—"}
                            onChange={(e) => updateProduct(idx, "brand", e.target.value)}
                            disabled={!isEditing}
                            className={!isEditing ? "bg-transparent border-none p-0 h-auto text-sm" : "h-8 text-sm"}
                          />
                        </Field>
                      </div>
                      <Field label="Specifications" isEditing={isEditing}>
                        <Textarea
                          value={product.specifications || ""}
                          onChange={(e) => updateProduct(idx, "specifications", e.target.value)}
                          disabled={!isEditing}
                          className={!isEditing ? "bg-transparent border-none p-0 min-h-0 h-auto text-sm" : "min-h-[40px] text-sm"}
                        />
                      </Field>
                    </div>
                  ))}
                  {!displayRecord.products?.length && (
                    <p className="text-sm text-gray-500 italic">No specific products detailed.</p>
                  )}
                </div>
              </Section>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="m-0">
            <div className="p-6">
              <div className="grid gap-3">
                {documents.map((doc) => (
                  <DocumentCard key={doc.id} doc={doc} renderFileBadge={renderFileBadge} />
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
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
    <article className="rounded-xl border border-gray-200 bg-white p-2 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
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
