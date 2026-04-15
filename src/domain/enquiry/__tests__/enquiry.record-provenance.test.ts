import { describe, expect, it } from "vitest";
import {
  buildEnquiryRecordFromIntake,
  coerceEnquiryRecordOrigin,
  resolveRecordOriginFromIntake,
} from "../enquiry.record";
import type { EnquiryIntake } from "../enquiry.intake";
import { enquiryReducer, initialEnquiryState } from "../enquiry.reducer";
import { createEnquiryRecordEvent } from "../enquiry.events";

function baseIntake(overrides: Partial<EnquiryIntake> = {}): EnquiryIntake {
  return {
    buyer: { buyerId: "buyer_001", manualName: "Acme" },
    requirements: { categories: ["Steel"] },
    source: { medium: "manual" },
    ...overrides,
  };
}

describe("enquiry record provenance", () => {
  it("resolves quick vs detailed origins for manual and internal mediums", () => {
    expect(resolveRecordOriginFromIntake(baseIntake({ source: { medium: "manual", rfqMode: "quick" } }))).toBe(
      "quick_rfq",
    );
    expect(resolveRecordOriginFromIntake(baseIntake({ source: { medium: "manual", rfqMode: "detailed" } }))).toBe(
      "manual",
    );
    expect(resolveRecordOriginFromIntake(baseIntake({ source: { medium: "internal", rfqMode: "detailed" } }))).toBe(
      "detailed_rfq",
    );
    expect(resolveRecordOriginFromIntake(baseIntake({ source: { medium: "internal", rfqMode: "quick" } }))).toBe(
      "quick_rfq",
    );
  });

  it("maps mail and whatsapp mediums to neutral intake origins", () => {
    expect(resolveRecordOriginFromIntake(baseIntake({ source: { medium: "mail" } }))).toBe("mail_intake");
    expect(resolveRecordOriginFromIntake(baseIntake({ source: { medium: "whatsapp" } }))).toBe("whatsapp_intake");
  });

  it("coerces legacy surface-specific labels", () => {
    expect(coerceEnquiryRecordOrigin("pluto-detailed-rfq")).toBe("detailed_rfq");
    expect(coerceEnquiryRecordOrigin("prism-manual")).toBe("manual");
    expect(coerceEnquiryRecordOrigin("mail-intake")).toBe("mail_intake");
  });

  it("applies legacy creationSource when reducing ENQUIRY_RECORD_CREATED", () => {
    const event = createEnquiryRecordEvent(
      "ENQ-9999",
      {
        enquiryId: "ENQ-9999",
        createdAt: new Date(),
        creationSource: "whatsapp-intake",
        buyer: { name: "X" },
        requirements: { categories: [] },
        assignment: {},
      } as any,
    );

    const next = enquiryReducer(initialEnquiryState, event);
    expect(next.records["ENQ-9999"]?.origin).toBe("whatsapp_intake");
  });

  it("buildEnquiryRecordFromIntake sets neutral origin from intake", () => {
    const intake = baseIntake({
      source: { medium: "internal", rfqMode: "detailed" },
    });
    const record = buildEnquiryRecordFromIntake("ENQ-1", intake, "p_bdm_1");
    expect(record.origin).toBe("detailed_rfq");
  });

  it("hydrates direct-order products and delivery location from directOrderSnapshot", () => {
    const intake = baseIntake({
      requirements: {
        categories: ["Steel"],
        paymentTerms: "Net 30",
      },
      source: {
        medium: "internal",
        orderIntent: "direct_order",
        directOrderSnapshot: {
          rfqNumber: "RFQ-DO-9",
          buyerCrmCode: "CRM-DO-9",
          poNumber: "PO-DO-9",
          shippingAddress: "Dock Zone 9",
          billingAddress: "Finance Lane",
          paymentTerms: "Net 30",
          incoterms: "FOB",
          assignedCmId: "persona-cm-ravi",
          lineItems: [{ category: "Steel", name: "TMT", quantity: "10 MT" }],
        },
      },
    });

    const record = buildEnquiryRecordFromIntake("ENQ-DO-1", intake, "p_bdm_1");
    expect(record.origin).toBe("direct_order");
    expect(record.products).toHaveLength(1);
    expect(record.products?.[0]).toMatchObject({ category: "Steel", name: "TMT", quantity: "10 MT" });
    expect(record.requirements.deliveryLocation).toBe("Dock Zone 9");
  });
});
