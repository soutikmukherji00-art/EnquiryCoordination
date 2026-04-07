/**
 * Tests: Enquiry + Members Reducer
 * 
 * Verifies the reducer implementation matches the specification.
 */

import {
  EnquiryStateStore,
  enquiryReducer,
  initialEnquiryState,
} from "@/domain/enquiry/enquiry.reducer";
import {
  createEnquiryCreatedEvent,
  createMemberAddedEvent,
  createPrimaryCMAssignedEvent,
  createEnquiryRegionAssignedEvent,
  createMemberRoleUpdatedEvent,
} from "@/domain/enquiry/enquiry.events";
import {
  selectMembers,
  selectPrimaryCM,
  selectVisibleMembers,
  selectMemberCount,
  selectMembersByRole,
} from "@/domain/enquiry/enquiry.selectors";
import { Member } from "@/domain/enquiry/enquiry.types";

describe("Enquiry + Members Reducer", () => {
  describe("ENQUIRY_CREATED", () => {
    it("creates enquiry with no members initially", () => {
      const event = createEnquiryCreatedEvent(
        "enq_001",
        "p_bdm_1",
        "North",
        "Acme Corp"
      );
      const state = enquiryReducer(initialEnquiryState, event);

      expect(state.enquiries["enq_001"]).toBeDefined();
      expect(state.enquiries["enq_001"].state).toBe("New");
      expect(state.enquiries["enq_001"].region).toBe("North");
      expect(state.enquiries["enq_001"].memberIds).toEqual([]);
      expect(state.membersByEnquiry["enq_001"]).toEqual([]);
    });
  });

  describe("MEMBER_ADDED", () => {
    it("adds member to enquiry", () => {
      let state: EnquiryStateStore = initialEnquiryState;

      // Create enquiry
      state = enquiryReducer(
        state,
        createEnquiryCreatedEvent("enq_001", "p_bdm_1")
      );

      // Add member
      const member: Member = {
        id: "m_enq_001_p_cm_1",
        userId: "u_201",
        personaId: "p_cm_1",
        role: "CM",
        joinedAt: new Date(),
      };
      state = enquiryReducer(state, createMemberAddedEvent("enq_001", member));

      expect(selectMemberCount(state, "enq_001")).toBe(1);
      expect(selectMembers(state, "enq_001")).toContainEqual(member);
      expect(state.enquiries["enq_001"].memberIds).toContain(member.id);
    });

    it("prevents duplicate members", () => {
      let state: EnquiryStateStore = initialEnquiryState;

      state = enquiryReducer(
        state,
        createEnquiryCreatedEvent("enq_001", "p_bdm_1")
      );

      const member: Member = {
        id: "m_enq_001_p_cm_1",
        userId: "u_201",
        personaId: "p_cm_1",
        role: "CM",
        joinedAt: new Date(),
      };

      state = enquiryReducer(state, createMemberAddedEvent("enq_001", member));
      state = enquiryReducer(state, createMemberAddedEvent("enq_001", member));

      expect(selectMemberCount(state, "enq_001")).toBe(1);
    });
  });

  describe("PRIMARY_CM_ASSIGNED", () => {
    it("assigns primary CM", () => {
      let state: EnquiryStateStore = initialEnquiryState;

      // Create enquiry
      state = enquiryReducer(
        state,
        createEnquiryCreatedEvent("enq_001", "p_bdm_1")
      );

      // Add CM member
      const cmMember: Member = {
        id: "m_enq_001_p_cm_1",
        userId: "u_201",
        personaId: "p_cm_1",
        role: "CM",
        joinedAt: new Date(),
      };
      state = enquiryReducer(state, createMemberAddedEvent("enq_001", cmMember));

      // Assign as primary
      state = enquiryReducer(
        state,
        createPrimaryCMAssignedEvent("enq_001", cmMember.id)
      );

      expect(state.enquiries["enq_001"].primaryCMId).toBe(cmMember.id);
      const primaryCM = selectPrimaryCM(state, "enq_001");
      expect(primaryCM?.id).toBe(cmMember.id);
      expect(primaryCM?.isPrimaryCM).toBe(true);
    });

    it("unmarks previous primary CM", () => {
      let state: EnquiryStateStore = initialEnquiryState;

      state = enquiryReducer(
        state,
        createEnquiryCreatedEvent("enq_001", "p_bdm_1")
      );

      // Add two CMs
      const cm1: Member = {
        id: "m_enq_001_p_cm_1",
        userId: "u_201",
        personaId: "p_cm_1",
        role: "CM",
        joinedAt: new Date(),
      };
      const cm2: Member = {
        id: "m_enq_001_p_cm_2",
        userId: "u_202",
        personaId: "p_cm_2",
        role: "CM",
        joinedAt: new Date(),
      };

      state = enquiryReducer(state, createMemberAddedEvent("enq_001", cm1));
      state = enquiryReducer(state, createMemberAddedEvent("enq_001", cm2));

      // Assign first as primary
      state = enquiryReducer(
        state,
        createPrimaryCMAssignedEvent("enq_001", cm1.id)
      );
      expect(selectPrimaryCM(state, "enq_001")?.id).toBe(cm1.id);

      // Assign second as primary
      state = enquiryReducer(
        state,
        createPrimaryCMAssignedEvent("enq_001", cm2.id)
      );

      const primaryCM = selectPrimaryCM(state, "enq_001");
      expect(primaryCM?.id).toBe(cm2.id);

      // First CM should no longer be primary
      const members = selectMembers(state, "enq_001");
      const firstCM = members.find((m) => m.id === cm1.id);
      expect(firstCM?.isPrimaryCM).toBeFalsy();
    });
  });

  describe("ENQUIRY_REGION_ASSIGNED", () => {
    it("assigns region to enquiry", () => {
      let state: EnquiryStateStore = initialEnquiryState;

      state = enquiryReducer(
        state,
        createEnquiryCreatedEvent("enq_001", "p_bdm_1")
      );

      state = enquiryReducer(
        state,
        createEnquiryRegionAssignedEvent("enq_001", "South")
      );

      expect(state.enquiries["enq_001"].region).toBe("South");
    });
  });

  describe("MEMBER_ROLE_UPDATED", () => {
    it("updates member role", () => {
      let state: EnquiryStateStore = initialEnquiryState;

      state = enquiryReducer(
        state,
        createEnquiryCreatedEvent("enq_001", "p_bdm_1")
      );

      const member: Member = {
        id: "m_enq_001_p_cm_1",
        userId: "u_201",
        personaId: "p_cm_1",
        role: "CM",
        joinedAt: new Date(),
      };
      state = enquiryReducer(state, createMemberAddedEvent("enq_001", member));

      // Update role
      state = enquiryReducer(
        state,
        createMemberRoleUpdatedEvent("enq_001", member.id, "BDM")
      );

      const members = selectMembers(state, "enq_001");
      const updatedMember = members.find((m) => m.id === member.id);
      expect(updatedMember?.role).toBe("BDM");
    });

    it("clears primary CM if role changes away from CM", () => {
      let state: EnquiryStateStore = initialEnquiryState;

      state = enquiryReducer(
        state,
        createEnquiryCreatedEvent("enq_001", "p_bdm_1")
      );

      const cmMember: Member = {
        id: "m_enq_001_p_cm_1",
        userId: "u_201",
        personaId: "p_cm_1",
        role: "CM",
        joinedAt: new Date(),
      };
      state = enquiryReducer(state, createMemberAddedEvent("enq_001", cmMember));
      state = enquiryReducer(
        state,
        createPrimaryCMAssignedEvent("enq_001", cmMember.id)
      );

      expect(state.enquiries["enq_001"].primaryCMId).toBe(cmMember.id);

      // Change role to BDM
      state = enquiryReducer(
        state,
        createMemberRoleUpdatedEvent("enq_001", cmMember.id, "BDM")
      );

      expect(state.enquiries["enq_001"].primaryCMId).toBeUndefined();
    });
  });

  describe("Selectors", () => {
    describe("selectVisibleMembers", () => {
      let state: EnquiryStateStore;

      beforeEach(() => {
        state = initialEnquiryState;
        state = enquiryReducer(
          state,
          createEnquiryCreatedEvent("enq_001", "p_bdm_1")
        );

        // Add various members
        const members: Member[] = [
          {
            id: "m_1",
            userId: "u_101",
            personaId: "p_bdm_1",
            role: "BDM",
            joinedAt: new Date(),
          },
          {
            id: "m_2",
            userId: "u_201",
            personaId: "p_cm_1",
            role: "CM",
            joinedAt: new Date(),
          },
          {
            id: "m_3",
            userId: "u_401",
            personaId: "p_buyer_1",
            role: "Buyer",
            joinedAt: new Date(),
          },
          {
            id: "m_4",
            userId: "u_501",
            personaId: "p_seller_1",
            role: "Seller",
            joinedAt: new Date(),
          },
          {
            id: "m_5",
            userId: "u_502",
            personaId: "p_seller_2",
            role: "Seller",
            joinedAt: new Date(),
          },
        ];

        members.forEach((member) => {
          state = enquiryReducer(state, createMemberAddedEvent("enq_001", member));
        });
      });

      it("internal roles see all members", () => {
        const cmView = selectVisibleMembers(state, "enq_001", "CM");
        expect(cmView).toHaveLength(5);

        const bdmView = selectVisibleMembers(state, "enq_001", "BDM");
        expect(bdmView).toHaveLength(5);

        const cxView = selectVisibleMembers(state, "enq_001", "CX");
        expect(cxView).toHaveLength(5);
      });

      it("buyer sees no sellers", () => {
        const buyerView = selectVisibleMembers(state, "enq_001", "Buyer");
        expect(buyerView).toHaveLength(3); // BDM, CM, Buyer (no sellers)
        expect(buyerView.every((m) => m.role !== "Seller")).toBe(true);
      });

      it("seller sees no other sellers", () => {
        const sellerView = selectVisibleMembers(state, "enq_001", "Seller");
        expect(sellerView).toHaveLength(3); // BDM, CM, Buyer (no sellers)
        expect(sellerView.every((m) => m.role !== "Seller")).toBe(true);
      });
    });

    describe("selectMembersByRole", () => {
      it("filters members by role", () => {
        let state: EnquiryStateStore = initialEnquiryState;
        state = enquiryReducer(
          state,
          createEnquiryCreatedEvent("enq_001", "p_bdm_1")
        );

        const cm1: Member = {
          id: "m_1",
          userId: "u_201",
          personaId: "p_cm_1",
          role: "CM",
          joinedAt: new Date(),
        };
        const cm2: Member = {
          id: "m_2",
          userId: "u_202",
          personaId: "p_cm_2",
          role: "CM",
          joinedAt: new Date(),
        };
        const bdm: Member = {
          id: "m_3",
          userId: "u_101",
          personaId: "p_bdm_1",
          role: "BDM",
          joinedAt: new Date(),
        };

        state = enquiryReducer(state, createMemberAddedEvent("enq_001", cm1));
        state = enquiryReducer(state, createMemberAddedEvent("enq_001", cm2));
        state = enquiryReducer(state, createMemberAddedEvent("enq_001", bdm));

        const cms = selectMembersByRole(state, "enq_001", "CM");
        expect(cms).toHaveLength(2);
        expect(cms.every((m) => m.role === "CM")).toBe(true);
      });
    });
  });
});
