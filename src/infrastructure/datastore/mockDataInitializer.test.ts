import { describe, expect, it } from "vitest";
import { initializeMockEnquiryState } from "./mockDataInitializer";

describe("mockDataInitializer", () => {
  it("seeds every mock enquiry record as quick RFQ mode", () => {
    const state = initializeMockEnquiryState();
    const records = Object.values(state.records);

    expect(records.length).toBeGreaterThan(0);
    for (const record of records) {
      expect(record.responseMode).toBe("quick");
    }

    // Keep source origins intact so badges/preview reflect intake channel.
    expect(records.some((record) => record.origin === "mail_intake")).toBe(true);
    expect(records.some((record) => record.origin === "whatsapp_intake")).toBe(true);
    expect(records.some((record) => record.origin === "website_intake")).toBe(true);

    const enq2415 = state.records["ENQ-2415"];
    expect(enq2415).toBeDefined();
    expect(enq2415?.sourceCorrespondence?.kind).toBe("whatsapp");
    if (enq2415?.sourceCorrespondence?.kind === "whatsapp") {
      expect(enq2415.sourceCorrespondence.body).not.toBe("Inbound WhatsApp enquiry pending BDM assignment.");
      expect(enq2415.sourceCorrespondence.body).toContain("TMT 500D");
      expect(enq2415.sourceCorrespondence.body).toContain("Noida");
    }
    expect(enq2415?.requirements.notes).not.toBe("Inbound WhatsApp enquiry pending BDM assignment.");
  });
});
