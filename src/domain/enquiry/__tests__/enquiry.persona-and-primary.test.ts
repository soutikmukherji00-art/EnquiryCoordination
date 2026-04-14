import { describe, expect, it } from "vitest";
import type { Enquiry, Member } from "../enquiry.types";
import { pickDefaultPersonaForRole } from "../enquiry.persona-defaults";
import { selectPrimaryCM } from "../enquiry.selectors";
import type { EnquiryStateStore } from "../enquiry.reducer";
import { hydrateEnquiryPrimaryCMFromRecord } from "../enquiry.state-hydration";
import { initializeMockEnquiryState } from "@/infrastructure/datastore/mockDataInitializer";
import { PERSONAS } from "@/domain/persona/persona.data";

describe("pickDefaultPersonaForRole", () => {
  it("prefers a CM who appears on at least one enquiry over the first CM in PERSONAS", () => {
    const enquiries: Enquiry[] = [
      {
        id: "ENQ-X",
        state: "Draft",
        memberIds: ["m_ENQ-X_p_cm_east"],
        categories: [],
        createdAt: new Date(),
        lastActivity: new Date(),
      },
    ];
    const picked = pickDefaultPersonaForRole("CM", enquiries, PERSONAS);
    expect(picked.id).toBe("p_cm_east");
  });

  it("falls back to first persona of role when no enquiry matches any candidate", () => {
    const enquiries: Enquiry[] = [];
    const picked = pickDefaultPersonaForRole("CM", enquiries, PERSONAS);
    expect(picked.role).toBe("CM");
    expect(picked.id).toBe("p_cm_north");
  });
});

describe("selectPrimaryCM record fallback", () => {
  it("resolves primary CM from record.assignment when lean primaryCMId is unset", () => {
    const cmMember: Member = {
      id: "m_E_p_cm_east",
      userId: "u",
      personaId: "p_cm_east",
      role: "CM",
      joinedAt: new Date(),
    };
    const state: EnquiryStateStore = {
      enquiries: {
        E: {
          id: "E",
          state: "Draft",
          memberIds: [cmMember.id],
          categories: [],
          createdAt: new Date(),
          lastActivity: new Date(),
        },
      },
      membersByEnquiry: { E: [cmMember] },
      records: {
        E: {
          enquiryId: "E",
          createdAt: new Date(),
          buyer: { name: "B" },
          requirements: { categories: [] },
          assignment: { primaryCMId: "p_cm_east" },
          products: [],
        } as any,
      },
    };
    expect(selectPrimaryCM(state, "E")).toEqual(cmMember);
  });
});

describe("hydrateEnquiryPrimaryCMFromRecord", () => {
  it("sets lean primaryCMId and isPrimaryCM flags from record", () => {
    const cm: Member = {
      id: "m_E_cm",
      userId: "u",
      personaId: "p_cm_south",
      role: "CM",
      joinedAt: new Date(),
    };
    const enquiry: Enquiry = {
      id: "E",
      state: "Draft",
      memberIds: [cm.id],
      categories: [],
      createdAt: new Date(),
      lastActivity: new Date(),
    };
    const { enquiry: next, members } = hydrateEnquiryPrimaryCMFromRecord(enquiry, [cm], {
      enquiryId: "E",
      createdAt: new Date(),
      buyer: {},
      requirements: { categories: [] },
      assignment: { primaryCMId: "p_cm_south" },
      products: [],
    } as any);
    expect(next.primaryCMId).toBe(cm.id);
    expect(members[0].isPrimaryCM).toBe(true);
  });
});

describe("initializeMockEnquiryState primary CM hydration", () => {
  it("mirrors record primary CM onto lean ENQ-2404", () => {
    const state = initializeMockEnquiryState();
    const enq = state.enquiries["ENQ-2404"];
    expect(enq?.primaryCMId).toBe("m_ENQ-2404_p_cm_east");
    const primary = selectPrimaryCM(state, "ENQ-2404");
    expect(primary?.personaId).toBe("p_cm_east");
  });
});
