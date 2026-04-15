import type { Category } from "@/domain/category/category.types";
import type { EnquiryIntake } from "@/domain/enquiry/enquiry.intake";
import type { DraftEnquiryDocument } from "@/domain/enquiry/enquiry.creation";
import type { DirectOrderSummaryData } from "@/app/rfq/direct-order.flow";

const CATEGORY_VALUES: Category[] = ["Steel", "Polymer", "Bitumen", "Cement"];

function inferCategoriesFromLineItems(data: DirectOrderSummaryData): Category[] {
  for (const line of data.lineItems) {
    const raw = (line.category || "").toLowerCase();
    for (const c of CATEGORY_VALUES) {
      if (raw.includes(c.toLowerCase())) {
        return [c];
      }
    }
  }
  return ["Steel"];
}

function attachmentMimeFromName(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return "application/pdf";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}

function buildNotes(data: DirectOrderSummaryData): string {
  const parts = [
    `Direct order from Buyer PO (OCR). RFQ ref: ${data.rfqNumber}. CRM: ${data.buyerCrmCode}.`,
    `PO: ${data.poNumber}. Incoterms: ${data.incoterms}.`,
    `Ship to: ${data.shippingAddress}`.slice(0, 500),
    `Bill to: ${data.billingAddress}`.slice(0, 500),
  ];
  return parts.join("\n");
}

/**
 * Builds {@link EnquiryIntake} for domain enquiry creation after BDM marks a direct order as won.
 */
export function buildIntakeFromDirectOrderSummary(data: DirectOrderSummaryData): EnquiryIntake {
  const poAttachment: DraftEnquiryDocument = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `po-${Date.now()}`,
    name: data.poDocumentName,
    type: attachmentMimeFromName(data.poDocumentName),
    url: data.poDocumentUrl,
    markAsPO: true,
  };

  return {
    buyer: {
      manualName: data.buyerAccount.trim() || "Unknown buyer",
      manualCompany: data.buyerAccount.trim() || undefined,
    },
    requirements: {
      categories: inferCategoriesFromLineItems(data),
      primaryCMId: data.assignedCmId,
      paymentTerms: data.paymentTerms,
      deliveryLocation: data.shippingAddress,
      notes: buildNotes(data),
    },
    source: {
      medium: "internal",
      orderIntent: "direct_order",
      attachments: [poAttachment],
      directOrderSnapshot: {
        rfqNumber: data.rfqNumber,
        buyerCrmCode: data.buyerCrmCode,
        poNumber: data.poNumber,
        shippingAddress: data.shippingAddress,
        billingAddress: data.billingAddress,
        paymentTerms: data.paymentTerms,
        incoterms: data.incoterms,
        assignedCmId: data.assignedCmId,
        lineItems: data.lineItems.map((line) => ({ ...line })),
      },
    },
  };
}
