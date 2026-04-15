import { describe, expect, it } from "vitest";
import { getDirectOrderSummaryValidationErrors } from "@/app/rfq/direct-order.validation";
import type { DirectOrderSummaryData } from "@/app/rfq/direct-order.flow";

function buildSummary(overrides: Partial<DirectOrderSummaryData> = {}): DirectOrderSummaryData {
  return {
    rfqNumber: "RFQ-DO-1",
    buyerCrmCode: "CRM-1",
    creationDate: "15 Apr 2026",
    createdBy: "BDM User",
    poDocumentName: "Buyer_PO_1.pdf",
    poDocumentUrl: "https://example.com/po.pdf",
    grasimGstAndSignature: "Verified",
    poNumber: "PO-10",
    buyerAccount: "Acme Infra",
    shippingAddress: "Yard 21",
    billingAddress: "Mumbai Office",
    paymentTerms: "Net 30",
    lineItems: [{ category: "Steel", name: "TMT", quantity: "10 MT" }],
    incoterms: "EXW",
    shippingChargesToBuyer: "0",
    invoiceTermsAndConditions: "Test cert required",
    assignedCmId: "persona-cm-ravi",
    ...overrides,
  };
}

const cmOptions = [{ id: "persona-cm-ravi", name: "Ravi CM" }];

describe("getDirectOrderSummaryValidationErrors", () => {
  it("returns empty errors when mandatory fields are present", () => {
    expect(getDirectOrderSummaryValidationErrors(buildSummary(), cmOptions)).toEqual([]);
  });

  it("flags each required field when missing", () => {
    const summary = buildSummary({
      buyerAccount: " ",
      lineItems: [],
      shippingAddress: " ",
      billingAddress: "",
      paymentTerms: " ",
      incoterms: "",
      assignedCmId: "",
    });

    expect(getDirectOrderSummaryValidationErrors(summary, cmOptions)).toEqual([
      "Buyer Account is required.",
      "At least one line item is required.",
      "Shipping Address is required.",
      "Billing Address is required.",
      "Payment Terms are required.",
      "INCOTERMS is required.",
      "Assign Category Manager is required.",
    ]);
  });

  it("flags unknown CM assignment", () => {
    const summary = buildSummary({ assignedCmId: "persona-cm-missing" });
    expect(getDirectOrderSummaryValidationErrors(summary, cmOptions)).toContain(
      "Assigned Category Manager is invalid.",
    );
  });
});
