import { memo, useMemo, type ReactNode } from "react";
import { FileText, Sparkles, Edit2, Download, ImageIcon } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";
import type { Message } from "@/domain/message/message.types";
import { buildStructuredDocuments, type DocumentItem } from "./structured-panel.utils";

interface StructuredData {
  buyer: {
    name: string;
    contact: string;
    company: string;
    aiExtracted: boolean;
  };
  products: Array<{
    name: string;
    quantity: string;
    specifications: string;
    aiExtracted: boolean;
  }>;
  commercial: {
    paymentTerms: string;
    deliveryTerms: string;
    validityPeriod: string;
    aiExtracted: boolean;
  };
  delivery?: {
    location: string;
    aiExtracted: boolean;
  };
}

interface StructuredPanelProps {
  summary: string;
  structuredData: StructuredData;
  onUpdateField: (section: string, field: string, value: string) => void;
  deliveryLocation?: string | null; // NEW: Delivery location from widget
  messagesByChannel?: Record<string, Message[]> | null;
}

export const StructuredPanel = memo(function StructuredPanel({
  summary,
  structuredData,
  onUpdateField,
  deliveryLocation, // NEW: Delivery location from widget
  messagesByChannel,
}: StructuredPanelProps) {
  const documents = useMemo<DocumentItem[]>(() => {
    return buildStructuredDocuments(messagesByChannel);
  }, [messagesByChannel]);

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

  return (
    <div
      className="flex flex-col h-full min-h-0 w-full bg-white border-l border-gray-200 overflow-hidden"
      data-structured-panel
    >
      <Tabs defaultValue="structured" className="flex-1 min-h-0 flex flex-col">
        <div className="px-4 pt-4 pb-3 border-b border-gray-200">
          <TabsList className="w-full h-auto p-1 bg-gray-100 rounded-xl">
            <TabsTrigger value="structured" className="flex-1">
              Structured Data
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex-1">
              Documents
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <TabsContent value="structured" className="m-0">
            <div className="p-6 space-y-6">
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

              {deliveryLocation && (
                <div className="bg-white rounded-lg border border-gray-200">
                  <div className="w-full px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900">
                        Delivery Location
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-3.5 text-[#5249D2]" />
                      <span className="text-xs text-gray-500">AI Captured</span>
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2.5">
                      <p className="text-sm text-gray-900">
                        {deliveryLocation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <span className="font-medium text-sm text-gray-900">
                    Buyer
                  </span>
                  <Edit2 className="size-4 text-gray-500" />
                </div>
                <div className="px-4 pb-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs font-medium text-gray-700">
                        Name
                      </label>
                      {structuredData.buyer.aiExtracted && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          <Sparkles className="size-2.5 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <Input
                      value={structuredData.buyer.name}
                      onChange={(e) =>
                        onUpdateField("buyer", "name", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs font-medium text-gray-700">
                        Contact
                      </label>
                      {structuredData.buyer.aiExtracted && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          <Sparkles className="size-2.5 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <Input
                      value={structuredData.buyer.contact}
                      onChange={(e) =>
                        onUpdateField("buyer", "contact", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs font-medium text-gray-700">
                        Company
                      </label>
                      {structuredData.buyer.aiExtracted && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          <Sparkles className="size-2.5 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <Input
                      value={structuredData.buyer.company}
                      onChange={(e) =>
                        onUpdateField("buyer", "company", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <span className="font-medium text-sm text-gray-900">
                    Products
                  </span>
                  <Edit2 className="size-4 text-gray-500" />
                </div>
                <div className="px-4 pb-4 space-y-4">
                  {structuredData.products.map((product, idx) => (
                    <div
                      key={idx}
                      className="space-y-3 pb-4 border-b border-gray-100 last:border-0"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-xs font-medium text-gray-700">
                            Product {idx + 1}
                          </label>
                          {product.aiExtracted && (
                            <Badge
                              variant="secondary"
                              className="text-xs px-1.5 py-0"
                            >
                              <Sparkles className="size-2.5 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        <Input
                          value={product.name}
                          onChange={(e) =>
                            onUpdateField(
                              "products",
                              `${idx}.name`,
                              e.target.value,
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Quantity
                        </label>
                        <Input
                          value={product.quantity}
                          onChange={(e) =>
                            onUpdateField(
                              "products",
                              `${idx}.quantity`,
                              e.target.value,
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-700 block mb-1">
                          Specifications
                        </label>
                        <Textarea
                          value={product.specifications}
                          onChange={(e) =>
                            onUpdateField(
                              "products",
                              `${idx}.specifications`,
                              e.target.value,
                            )
                          }
                          className="text-sm min-h-[60px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200">
                <div className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50">
                  <span className="font-medium text-sm text-gray-900">
                    Commercial Terms
                  </span>
                  <Edit2 className="size-4 text-gray-500" />
                </div>
                <div className="px-4 pb-4 space-y-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs font-medium text-gray-700">
                        Payment Terms
                      </label>
                      {structuredData.commercial.aiExtracted && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          <Sparkles className="size-2.5 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <Input
                      value={structuredData.commercial.paymentTerms}
                      onChange={(e) =>
                        onUpdateField(
                          "commercial",
                          "paymentTerms",
                          e.target.value,
                        )
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Delivery Terms
                    </label>
                    <Input
                      value={structuredData.commercial.deliveryTerms}
                      onChange={(e) =>
                        onUpdateField(
                          "commercial",
                          "deliveryTerms",
                          e.target.value,
                        )
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 block mb-1">
                      Validity Period
                    </label>
                    <Input
                      value={structuredData.commercial.validityPeriod}
                      onChange={(e) =>
                        onUpdateField(
                          "commercial",
                          "validityPeriod",
                          e.target.value,
                        )
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
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
          <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
            {doc.type.startsWith("image/") ? (
              <ImageIcon className="size-5 text-blue-600" />
            ) : (
              <FileText className="size-5 text-gray-700" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate text-sm font-medium text-gray-900">{doc.name}</p>
              {renderFileBadge(doc.type, doc.markAsPO)}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">{doc.sourceLabel}</p>
          </div>
        </div>

        <Button asChild variant="ghost" size="icon" className="flex-shrink-0">
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
