import { describe, expect, it } from "vitest";
import {
  resolvePostAddContactRedirect,
  resolveBdmPlutoSelectionDestination,
  resolveQuickRfqPrismSyncOptions,
  shouldShowQuickRfqBuyerAccountPrompt,
} from "@/app/App";

describe("resolveBdmPlutoSelectionDestination", () => {
  it("routes draft enquiries to detail even when response mode is quick", () => {
    expect(
      resolveBdmPlutoSelectionDestination({
        normalizedState: "Draft",
        responseMode: "quick",
      }),
    ).toBe("detail");
  });

  it("routes non-draft enquiries by response mode", () => {
    expect(
      resolveBdmPlutoSelectionDestination({
        normalizedState: "Awaiting Response",
        responseMode: "quick",
      }),
    ).toBe("chat");
    expect(
      resolveBdmPlutoSelectionDestination({
        normalizedState: "Awaiting Response",
        responseMode: "detailed",
      }),
    ).toBe("detailed-rfq");
    expect(
      resolveBdmPlutoSelectionDestination({
        normalizedState: "Awaiting Response",
        responseMode: "direct",
      }),
    ).toBe("direct-order");
  });
});

describe("resolveQuickRfqPrismSyncOptions", () => {
  it("uses normal Prism thread sync when buyer identity exists", () => {
    expect(
      resolveQuickRfqPrismSyncOptions({ missingBuyerIdentity: false }),
    ).toBeUndefined();
  });

  it("keeps silent fallback when buyer identity is missing", () => {
    expect(
      resolveQuickRfqPrismSyncOptions({ missingBuyerIdentity: true }),
    ).toEqual({ silentMissingThread: true });
  });
});

describe("shouldShowQuickRfqBuyerAccountPrompt", () => {
  it("returns true for BDM quick RFQ with missing buyer identity", () => {
    expect(
      shouldShowQuickRfqBuyerAccountPrompt({
        role: "BDM",
        responseMode: "quick",
        buyerId: undefined,
        buyerPersonaId: undefined,
      }),
    ).toBe(true);
  });

  it("returns false when buyer identity exists", () => {
    expect(
      shouldShowQuickRfqBuyerAccountPrompt({
        role: "BDM",
        responseMode: "quick",
        buyerId: "buyer_1",
        buyerPersonaId: undefined,
      }),
    ).toBe(false);
  });

  it("returns false outside quick RFQ BDM flow", () => {
    expect(
      shouldShowQuickRfqBuyerAccountPrompt({
        role: "CM",
        responseMode: "quick",
        buyerId: undefined,
        buyerPersonaId: undefined,
      }),
    ).toBe(false);
    expect(
      shouldShowQuickRfqBuyerAccountPrompt({
        role: "BDM",
        responseMode: "detailed",
        buyerId: undefined,
        buyerPersonaId: undefined,
      }),
    ).toBe(false);
  });
});

describe("resolvePostAddContactRedirect", () => {
  it("routes successful contact add to Pluto detail preview", () => {
    expect(resolvePostAddContactRedirect({ enquiryId: "ENQ-2001" })).toEqual({
      workspaceMode: "pluto",
      destination: "detail",
      enquiryId: "ENQ-2001",
    });
  });
});
