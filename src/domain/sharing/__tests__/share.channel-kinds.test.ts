import { describe, expect, it } from "vitest";
import {
  getShareSourceKindFromContext,
  mapChannelToSourceKind,
  mapChannelToTargetKind,
} from "../share.channel-kinds";

describe("share channel kind mapping", () => {
  it("maps legacy channel strings to source kinds consistently", () => {
    expect(mapChannelToSourceKind("internal")).toBe("enquiry-internal");
    expect(mapChannelToSourceKind("buyer-dm")).toBe("buyer-dm");
    expect(mapChannelToSourceKind("seller-dm-p_1-s_1")).toBe("seller-dm");
    expect(mapChannelToSourceKind("group_123")).toBe("group-main");
  });

  it("maps legacy channel strings to target kinds consistently", () => {
    expect(mapChannelToTargetKind("buyer-multi:dm-1,dm-2")).toBe("buyer-dm");
    expect(mapChannelToTargetKind("seller-multi:s_1,s_2")).toBe("seller-dm");
    expect(mapChannelToTargetKind("ENQ-001")).toBe("group-main");
  });

  it("maps share source contexts to source kinds", () => {
    expect(
      getShareSourceKindFromContext({ type: "buyer-dm", id: "dm-p_1" } as any),
    ).toBe("buyer-dm");
    expect(
      getShareSourceKindFromContext({ type: "enquiry-channel", channel: "buyer" } as any),
    ).toBe("enquiry-buyer");
  });
});
