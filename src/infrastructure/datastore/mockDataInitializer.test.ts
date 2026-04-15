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
  });
});
