import { describe, expect, it } from "vitest";
import {
  getConnectGroupSectionLabel,
  getVisibleConnectGroupSections,
} from "../group-display.utils";

describe("group display labels", () => {
  it("maps BDM to Birla Pivot + Buyers", () => {
    expect(getVisibleConnectGroupSections("BDM")).toEqual(["birla-pivot", "buyer"]);
    expect(getConnectGroupSectionLabel("birla-pivot")).toBe("Birla Pivot");
    expect(getConnectGroupSectionLabel("buyer")).toBe("Buyers");
  });

  it("maps CM to Birla Pivot + Seller", () => {
    expect(getVisibleConnectGroupSections("CM")).toEqual(["birla-pivot", "seller"]);
    expect(getConnectGroupSectionLabel("seller")).toBe("Seller");
  });

  it("maps CX to all connect sections", () => {
    expect(getVisibleConnectGroupSections("CX")).toEqual(["birla-pivot", "buyer", "seller"]);
  });
});
