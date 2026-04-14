import { describe, expect, it } from "vitest";
import { getLandingWorkspaceModeForRole, ROLE_LANDING_WORKSPACE } from "@/app/workspace.landing";

describe("workspace landing configuration", () => {
  it("routes internal roles to their default workspace", () => {
    expect(getLandingWorkspaceModeForRole("BDM")).toBe("pluto");
    expect(getLandingWorkspaceModeForRole("CM")).toBe("pluto");
    expect(getLandingWorkspaceModeForRole("CX")).toBe("rfq");
  });

  it("routes external roles to Prism", () => {
    expect(getLandingWorkspaceModeForRole("Buyer")).toBe("prism");
    expect(getLandingWorkspaceModeForRole("Seller")).toBe("prism");
  });

  it("keeps an explicit mapping for every role", () => {
    expect(ROLE_LANDING_WORKSPACE).toEqual({
      BDM: "pluto",
      CM: "pluto",
      CX: "rfq",
      Buyer: "prism",
      Seller: "prism",
    });
  });
});
