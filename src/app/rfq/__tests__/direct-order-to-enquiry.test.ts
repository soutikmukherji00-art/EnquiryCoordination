import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { buildIntakeFromDirectOrderSummary } from "../direct-order-to-enquiry";
import type { DirectOrderSummaryData } from "../direct-order.flow";

function baseSummary(overrides: Partial<DirectOrderSummaryData> = {}): DirectOrderSummaryData {
  return {
    rfqNumber: "RFQ-1",
    buyerCrmCode: "CRM-1",
    creationDate: "1 Jan 2026",
    createdBy: "Tester",
    poDocumentName: "Buyer_PO.pdf",
    poDocumentUrl: "https://example.com/po.pdf",
    grasimGstAndSignature: "",
    poNumber: "PO-99",
    buyerAccount: "Acme Infra",
    shippingAddress: "Warehouse Rd",
    billingAddress: "HQ",
    paymentTerms: "Net 30",
    lineItems: [{ category: "General hardware", name: "Bolt", quantity: "10" }],
    incoterms: "EXW",
    shippingChargesToBuyer: "0",
    invoiceTermsAndConditions: "",
    assignedCmId: "persona-cm-ravi",
    ...overrides,
  };
}

describe("buildIntakeFromDirectOrderSummary", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID: () => "11111111-2222-4333-8444-555555555555" });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sets primaryCMId, internal source, and direct_order intent", () => {
    const intake = buildIntakeFromDirectOrderSummary(baseSummary({ assignedCmId: "cm-special" }));
    expect(intake.requirements.primaryCMId).toBe("cm-special");
    expect(intake.source.medium).toBe("internal");
    expect(intake.source.orderIntent).toBe("direct_order");
    expect(intake.requirements.paymentTerms).toBe("Net 30");
    expect(intake.requirements.deliveryLocation).toBe("Warehouse Rd");
  });

  it("maps category from first matching line item (case-insensitive substring)", () => {
    expect(
      buildIntakeFromDirectOrderSummary(
        baseSummary({ lineItems: [{ category: "POLYMER grade A", name: "x", quantity: "1" }] }),
      ).requirements.categories,
    ).toEqual(["Polymer"]);

    expect(
      buildIntakeFromDirectOrderSummary(
        baseSummary({ lineItems: [{ category: "Road bitumen", name: "x", quantity: "1" }] }),
      ).requirements.categories,
    ).toEqual(["Bitumen"]);

    expect(
      buildIntakeFromDirectOrderSummary(
        baseSummary({ lineItems: [{ category: "OPC Cement bags", name: "x", quantity: "1" }] }),
      ).requirements.categories,
    ).toEqual(["Cement"]);
  });

  it('defaults categories to ["Steel"] when no known category substring matches', () => {
    const intake = buildIntakeFromDirectOrderSummary(
      baseSummary({ lineItems: [{ category: "Unknown", name: "x", quantity: "1" }] }),
    );
    expect(intake.requirements.categories).toEqual(["Steel"]);
  });

  it("builds buyer from buyerAccount and falls back name when empty", () => {
    const trimmed = buildIntakeFromDirectOrderSummary(baseSummary({ buyerAccount: "  Buyer Co  " }));
    expect(trimmed.buyer.manualName).toBe("Buyer Co");
    expect(trimmed.buyer.manualCompany).toBe("Buyer Co");

    const empty = buildIntakeFromDirectOrderSummary(baseSummary({ buyerAccount: "" }));
    expect(empty.buyer.manualName).toBe("Unknown buyer");
    expect(empty.buyer.manualCompany).toBeUndefined();
  });

  it("includes PO attachment with markAsPO and mime from filename", () => {
    const pdf = buildIntakeFromDirectOrderSummary(
      baseSummary({ poDocumentName: "doc.PDF", poDocumentUrl: "s3://bucket/key" }),
    );
    expect(pdf.source.attachments).toHaveLength(1);
    expect(pdf.source.attachments[0]).toMatchObject({
      name: "doc.PDF",
      url: "s3://bucket/key",
      type: "application/pdf",
      markAsPO: true,
      id: "11111111-2222-4333-8444-555555555555",
    });

    const png = buildIntakeFromDirectOrderSummary(baseSummary({ poDocumentName: "scan.PNG" }));
    expect(png.source.attachments[0].type).toBe("image/png");
    expect(png.source.directOrderSnapshot?.lineItems).toHaveLength(1);
    expect(png.source.directOrderSnapshot?.assignedCmId).toBe("persona-cm-ravi");
  });

  it("concatenates RFQ, PO, incoterms, shipping, and billing into notes", () => {
    const intake = buildIntakeFromDirectOrderSummary(
      baseSummary({
        rfqNumber: "RFQ-X",
        buyerCrmCode: "CRM-Y",
        poNumber: "PO-Z",
        incoterms: "CIF",
        shippingAddress: "Dock 9",
        billingAddress: "Accounts Block",
      }),
    );
    expect(intake.requirements.notes).toContain("RFQ ref: RFQ-X");
    expect(intake.requirements.notes).toContain("CRM: CRM-Y");
    expect(intake.requirements.notes).toContain("PO: PO-Z");
    expect(intake.requirements.notes).toContain("Incoterms: CIF");
    expect(intake.requirements.notes).toContain("Ship to: Dock 9");
    expect(intake.requirements.notes).toContain("Bill to: Accounts Block");
  });
});
