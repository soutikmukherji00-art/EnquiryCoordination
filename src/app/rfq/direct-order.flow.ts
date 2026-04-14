import { addCatalogSelectionsToCart, type EnquiryProductLine } from "@/domain/enquiry/enquiry.cart";

export interface DirectOrderSummaryData {
  rfqNumber: string;
  buyerCrmCode: string;
  creationDate: string;
  createdBy: string;
  poDocumentName: string;
  poDocumentUrl: string;
  grasimGstAndSignature: string;
  poNumber: string;
  buyerAccount: string;
  shippingAddress: string;
  billingAddress: string;
  paymentTerms: string;
  lineItems: EnquiryProductLine[];
  incoterms: string;
  shippingChargesToBuyer: string;
  invoiceTermsAndConditions: string;
  assignedCmId: string;
}

export function buildInitialDirectOrderSummaryData(
  rfqNumber: string = "RFQ-DO-1024",
): DirectOrderSummaryData {
  const lineItems = addCatalogSelectionsToCart([], ["tmt-rebar", "beams-ismb-200"], "Steel & Allied").map(
    (item, index) => ({
      ...item,
      quantity: item.quantity || `${index + 8} MT`,
    }),
  );

  return {
    rfqNumber,
    buyerCrmCode: "CRM-BUY-99123",
    creationDate: "14 Apr 2026",
    createdBy: "Aditi Sharma (BDM)",
    poDocumentName: "Buyer_PO_1.pdf",
    poDocumentUrl: "#",
    grasimGstAndSignature: "Verified in OCR run",
    poNumber: "PO-78965-A",
    buyerAccount: "Grasim - Infra Projects West",
    shippingAddress: "Warehouse Plot 22, Sanand GIDC, Ahmedabad - 382110",
    billingAddress: "Accounts Dept, Grasim Industries, Mumbai - 400001",
    paymentTerms: "30% Advance, Balance against dispatch",
    lineItems,
    incoterms: "EXW",
    shippingChargesToBuyer: "45000",
    invoiceTermsAndConditions: "Material test certificate to be provided with dispatch.",
    assignedCmId: "persona-cm-ravi",
  };
}
