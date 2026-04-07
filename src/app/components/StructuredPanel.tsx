import { memo } from "react";
import { Sparkles, Edit2, MapPin } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/components/ui/utils";

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
}

export const StructuredPanel = memo(function StructuredPanel({
  summary,
  structuredData,
  onUpdateField,
  deliveryLocation, // NEW: Delivery location from widget
}: StructuredPanelProps) {
  return (
    <div className="flex flex-col h-full min-h-0 w-full bg-white border-l border-gray-200 overflow-hidden" data-structured-panel>
      <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
        <h2 className="font-semibold text-gray-900">Structured Data</h2>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* AI Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 text-blue-600" />
              <span className="font-medium text-sm text-gray-900">AI Summary</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
          </div>

          {/* Delivery Location (if captured from widget) */}
          {deliveryLocation && (
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="w-full px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-gray-900">Delivery Location</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-3.5 text-[#5249D2]" />
                  <span className="text-xs text-gray-500">AI Captured</span>
                </div>
              </div>
              <div className="px-4 pb-4">
                <div className="bg-gray-50 border border-gray-200 rounded px-3 py-2.5">
                  <p className="text-sm text-gray-900">{deliveryLocation}</p>
                </div>
              </div>
            </div>
          )}

          {/* Buyer Section */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50">
              <span className="font-medium text-sm text-gray-900">Buyer</span>
              <Edit2 className="size-4 text-gray-500" />
            </div>
            <div className="px-4 pb-4 space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-medium text-gray-700">
                    Name
                  </label>
                  {structuredData.buyer.aiExtracted && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      <Sparkles className="size-2.5 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
                <Input
                  value={structuredData.buyer.name}
                  onChange={(e) => onUpdateField("buyer", "name", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-medium text-gray-700">
                    Contact
                  </label>
                  {structuredData.buyer.aiExtracted && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      <Sparkles className="size-2.5 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
                <Input
                  value={structuredData.buyer.contact}
                  onChange={(e) => onUpdateField("buyer", "contact", e.target.value)}
                  className="text-sm"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <label className="text-xs font-medium text-gray-700">
                    Company
                  </label>
                  {structuredData.buyer.aiExtracted && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      <Sparkles className="size-2.5 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
                <Input
                  value={structuredData.buyer.company}
                  onChange={(e) => onUpdateField("buyer", "company", e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>

          {/* Products Section */}
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50">
              <span className="font-medium text-sm text-gray-900">Products</span>
              <Edit2 className="size-4 text-gray-500" />
            </div>
            <div className="px-4 pb-4 space-y-4">
              {structuredData.products.map((product, idx) => (
                <div key={idx} className="space-y-3 pb-4 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <label className="text-xs font-medium text-gray-700">
                        Product {idx + 1}
                      </label>
                      {product.aiExtracted && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                          <Sparkles className="size-2.5 mr-1" />
                          AI
                        </Badge>
                      )}
                    </div>
                    <Input
                      value={product.name}
                      onChange={(e) =>
                        onUpdateField("products", `${idx}.name`, e.target.value)
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
                        onUpdateField("products", `${idx}.quantity`, e.target.value)
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
                        onUpdateField("products", `${idx}.specifications`, e.target.value)
                      }
                      className="text-sm min-h-[60px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commercial Terms Section */}
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
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      <Sparkles className="size-2.5 mr-1" />
                      AI
                    </Badge>
                  )}
                </div>
                <Input
                  value={structuredData.commercial.paymentTerms}
                  onChange={(e) =>
                    onUpdateField("commercial", "paymentTerms", e.target.value)
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
                    onUpdateField("commercial", "deliveryTerms", e.target.value)
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
                    onUpdateField("commercial", "validityPeriod", e.target.value)
                  }
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});