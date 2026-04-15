import { describe, expect, it } from "vitest";
import type { EnquiryCreatedEvent } from "../enquiry.events";
import { createMemberAddedEvent } from "../enquiry.events";
import type { Member } from "../enquiry.types";
import { enquiryReducer, initialEnquiryState } from "../enquiry.reducer";

const fixedTs = new Date("2026-04-01T12:00:00.000Z");

function seedEnquiry(enquiryId: string) {
  const created: EnquiryCreatedEvent = {
    type: "ENQUIRY_CREATED",
    payload: {
      enquiryId,
      createdByPersonaId: "p_bdm_1",
      buyerName: "Acme",
      timestamp: fixedTs,
    },
  };
  return enquiryReducer(initialEnquiryState, created);
}

describe("enquiry reducer idempotency (single realtime apply)", () => {
  it("ignores duplicate MEMBER_ADDED for the same member id", () => {
    const base = seedEnquiry("ENQ-X");
    const member: Member = {
      id: "m_ENQ-X_p_cm_1",
      userId: "u_cm",
      personaId: "p_cm_1",
      role: "CM",
      joinedAt: fixedTs,
    };
    const evt = createMemberAddedEvent("ENQ-X", member);
    const once = enquiryReducer(base, evt);
    const twice = enquiryReducer(once, evt);
    expect(twice.membersByEnquiry["ENQ-X"]).toEqual(once.membersByEnquiry["ENQ-X"]);
    expect(twice.enquiries["ENQ-X"]?.memberIds).toEqual(once.enquiries["ENQ-X"]?.memberIds);
  });

  it("applies identical ENQUIRY_STATE_CHANGED twice without changing state beyond first apply", () => {
    const base = seedEnquiry("ENQ-Y");
    const evt = {
      type: "ENQUIRY_STATE_CHANGED" as const,
      payload: {
        enquiryId: "ENQ-Y",
        fromState: "Draft" as const,
        toState: "Awaiting Response" as const,
        changedBy: "u1",
        changedByRole: "BDM",
        timestamp: fixedTs,
      },
    };
    const once = enquiryReducer(base, evt);
    const twice = enquiryReducer(once, evt);
    expect(twice.enquiries["ENQ-Y"]?.state).toBe("Awaiting Response");
    expect(twice.enquiries["ENQ-Y"]?.lastActivity).toEqual(once.enquiries["ENQ-Y"]?.lastActivity);
  });

  it("applies identical ENQUIRY_CONVERTED twice with stable converted state", () => {
    const base = seedEnquiry("ENQ-Z");
    const evt = {
      type: "ENQUIRY_CONVERTED" as const,
      payload: {
        enquiryId: "ENQ-Z",
        convertedBy: "u1",
        convertedByRole: "BDM",
        timestamp: fixedTs,
      },
    };
    const once = enquiryReducer(base, evt);
    const twice = enquiryReducer(once, evt);
    expect(twice.enquiries["ENQ-Z"]?.state).toBe("Converted to Order");
    expect(twice.enquiries["ENQ-Z"]?.convertedAt).toEqual(once.enquiries["ENQ-Z"]?.convertedAt);
  });
});
