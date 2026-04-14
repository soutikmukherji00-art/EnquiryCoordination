import type { RfqDetailsFormValues } from "@/app/rfq/rfq-details.schema";

function createLineItem(index: number, productName: string, quantity: number, unitPrice: number) {
  return {
    id: `line-${index + 1}`,
    productName,
    quantity,
    unitPrice,
    cnToBuyer: false,
    cnFromSeller: false,
  };
}

export function buildRfqDetailsInitialValues(rfqId: string): RfqDetailsFormValues {
  return {
    rfqNumber: rfqId,
    buyerName: "Lodha Buildcorp",
    ticketReference: "TKT-29817",
    dependencyReason: "Pending final grade confirmation",
    isSez: false,
    rmName: "aarya-shah",
    cmName: "mohit-jain",
    marginDays: 7,
    enhancerType: "bg",
    rateOfInterest: 13.5,
    paymentTerms: "30-days",
    quoteDeliveryEta: "2026-04-21",
    billingAddress: "Lodha Buildcorp, Lodha Excelus, Mumbai - 400011",
    poNumber: "",
    poDate: "",
    poDocumentName: "",
    scopeOfUnloading: "Buyer to provide unloading support at site.",
    parentQuote: "",
    remarks: "",
    invoiceTerms: "GST invoice with HSN breakup required.",
    buyerShippingAddress: "Plot 43, MIDC Taloja, Navi Mumbai - 410208",
    sellerId: "seller-alpha",
    warehouseId: "alpha-vasai",
    logisticsMode: "seller-arranged",
    programFlag: false,
    lineItems: [
      createLineItem(0, "TMT Bars Fe500D 12mm", 25, 58100),
      createLineItem(1, "Structural Steel Angles", 10, 62400),
    ],
  };
}

export function getLineItemTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

export function getGrandTotal(
  lineItems: Array<{ quantity: number; unitPrice: number }>,
): number {
  return lineItems.reduce(
    (total, line) => total + getLineItemTotal(line.quantity, line.unitPrice),
    0,
  );
}
