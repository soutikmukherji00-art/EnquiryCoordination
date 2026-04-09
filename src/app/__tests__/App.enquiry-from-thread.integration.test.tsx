/**
 * Integration tests for creating enquiries from threads
 * Tests the complete flow from UI action to state updates
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createEnquiryFromThread,
  getNavigationStateAfterCreation,
} from "@/domain/enquiry/enquiry.thread-creation";
import type { Enquiry } from "@/domain/enquiry/enquiry.types";
import type { GroupChannel, Thread } from "@/domain/message/group.types";

vi.mock("@/domain/buyer/buyer.mock-data", () => ({
  getBuyerById: vi.fn((id: string) => {
    if (id === "buyer_001") {
      return { id: "buyer_001", name: "Acme Corp" };
    }
    return null;
  }),
}));

vi.mock("@/domain/buyer/buyer-persona-mapping", () => ({
  getBuyerPersonaFromBuyerId: vi.fn((id: string) => {
    if (id === "buyer_001") {
      return "p_buyer_acme_001";
    }
    return undefined;
  }),
}));

describe("App: Create Enquiry From Thread Integration", () => {
  describe("End-to-end enquiry creation flow", () => {
    const mockEnquiries: Enquiry[] = [
      {
        id: "ENQ-2401",
        buyerName: "Test Buyer",
        state: "new",
        createdBy: "p_bdm_001",
        createdAt: new Date(),
        members: [],
      } as Enquiry,
    ];

    const mockGroups: GroupChannel[] = [
      {
        id: "group_buyer_001",
        name: "Buyer Group",
        type: "buyer",
        buyerId: "buyer_001",
        buyerPersonaId: "p_buyer_acme_001",
        threads: [
          {
            id: "thread_001",
            title: "Product inquiry",
            createdAt: new Date(),
            creatorId: "p_bdm_001",
            messageCount: 5,
          } as Thread,
          {
            id: "thread_002",
            title: "Already tagged thread",
            createdAt: new Date(),
            creatorId: "p_bdm_001",
            messageCount: 3,
            enquiryId: "ENQ-2401",
          } as Thread,
        ],
      } as GroupChannel,
      {
        id: "grp_internal_steel",
        name: "Steel Internal",
        type: "custom",
        threads: [
          {
            id: "thread_003",
            title: "Internal discussion",
            createdAt: new Date(),
            creatorId: "p_cm_001",
            messageCount: 2,
          } as Thread,
        ],
      } as GroupChannel,
    ];

    it("should create enquiry from untagged thread", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      expect(result.enquiryId).toBe("ENQ-2402");
      expect(result.groupId).toBe("group_buyer_001");
      expect(result.events).toHaveLength(3); // ENQUIRY_CREATED, THREAD_TAGGED, MEMBER_ADDED
    });

    it("should reject creation for already tagged thread", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_002",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Thread is already tagged to an enquiry");
      expect(result.enquiryId).toBeUndefined();
    });

    it("should reject creation for non-existent thread", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_999",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Thread not found");
    });

    it("should generate correct navigation state", () => {
      const navState = getNavigationStateAfterCreation(
        "ENQ-2402",
        "thread_001",
        "group_buyer_001"
      );

      expect(navState.selectedEnquiryId).toBe("ENQ-2402");
      expect(navState.selectedThreadId).toBe("thread_001");
      expect(navState.selectedGroupId).toBe("group_buyer_001");
      expect(navState.selectedBuyerDMId).toBeNull();
      expect(navState.selectedSellerDMId).toBeNull();
      expect(navState.threadViewMode).toBe("main");
      expect(navState.threadPanelOpen).toBe(true);
      expect(navState.currentChannel).toBe("internal");
    });

    it("should create enquiry with correct buyer information", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      const enquiryEvent = result.events?.find(e => e.type === "ENQUIRY_CREATED");
      expect(enquiryEvent).toBeDefined();
      expect(enquiryEvent?.payload.buyerName).toBe("Acme Corp");
      expect(enquiryEvent?.payload.buyerPersonaId).toBe("p_buyer_acme_001");
    });

    it("should tag thread with new enquiry ID", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      const tagEvent = result.events?.find(e => e.type === "THREAD_TAGGED");
      expect(tagEvent).toBeDefined();
      expect(tagEvent?.payload.threadId).toBe("thread_001");
      expect(tagEvent?.payload.enquiryId).toBe("ENQ-2402");
    });

    it("should auto-assign team members", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      const memberEvents = result.events?.filter(e => e.type === "MEMBER_ADDED");
      expect(memberEvents).toBeDefined();
      expect(memberEvents!.length).toBeGreaterThan(0);
    });

    it("should tag the parent custom group when creating from an internal thread", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_003",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      const groupTagEvent = result.events?.find((event) => event.type === "GROUP_TAGGED");
      expect(groupTagEvent).toBeDefined();
      expect(groupTagEvent && "payload" in groupTagEvent ? groupTagEvent.payload.groupId : undefined).toBe("grp_internal_steel");
      expect(groupTagEvent && "payload" in groupTagEvent ? groupTagEvent.payload.enquiryId : undefined).toBe("ENQ-2402");
    });
  });

  describe("Edge cases and error handling", () => {
    it("should handle empty enquiry list", () => {
      const mockGroups: GroupChannel[] = [
        {
          id: "group_001",
          threads: [
            { id: "thread_001", title: "Test" } as Thread,
          ],
        } as GroupChannel,
      ];

      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: [],
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      expect(result.enquiryId).toBe("ENQ-2401");
    });

    it("should handle empty group list", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: [],
        allGroupChannels: [],
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Thread not found");
    });

    it("should handle groups with no threads", () => {
      const mockGroups: GroupChannel[] = [
        {
          id: "group_001",
          threads: [],
        } as GroupChannel,
      ];

      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: [],
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Thread not found");
    });

    it("should handle unknown buyer gracefully", () => {
      const mockGroups: GroupChannel[] = [
        {
          id: "group_001",
          threads: [
            { id: "thread_001", title: "Test" } as Thread,
          ],
        } as GroupChannel,
      ];

      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_unknown",
        existingEnquiries: [],
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      const enquiryEvent = result.events?.find(e => e.type === "ENQUIRY_CREATED");
      expect(enquiryEvent?.payload.buyerName).toBe("Unknown Buyer");
    });
  });

  describe("Event ordering and consistency", () => {
    it("should dispatch events in correct order", () => {
      const mockGroups: GroupChannel[] = [
        {
          id: "group_001",
          threads: [
            { id: "thread_001", title: "Test" } as Thread,
          ],
        } as GroupChannel,
      ];

      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: [],
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      expect(result.events).toBeDefined();
      
      // First event should be ENQUIRY_CREATED
      expect(result.events![0].type).toBe("ENQUIRY_CREATED");
      
      // Second event should be THREAD_TAGGED
      expect(result.events![1].type).toBe("THREAD_TAGGED");
      
      // Remaining events should be team member assignments
      const memberEvents = result.events!.slice(2);
      memberEvents.forEach(event => {
        expect(event.type).toBe("MEMBER_ADDED");
      });
    });

    it("should use consistent enquiry ID across all events", () => {
      const mockGroups: GroupChannel[] = [
        {
          id: "group_001",
          threads: [
            { id: "thread_001", title: "Test" } as Thread,
          ],
        } as GroupChannel,
      ];

      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: [],
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      const enquiryId = result.enquiryId;

      // All events should reference the same enquiry ID
      result.events?.forEach(event => {
        expect(event.payload.enquiryId).toBe(enquiryId);
      });
    });
  });
});
