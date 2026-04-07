/**
 * Unit tests for enquiry thread creation domain service
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateNextEnquiryId,
  findThreadInGroups,
  resolveBuyerInfo,
  createEnquiryFromThread,
  getNavigationStateAfterCreation,
} from "../enquiry.thread-creation";
import type { Enquiry } from "../enquiry.types";
import type { GroupChannel, Thread } from "@/domain/message/group.types";

// Mock dependencies
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

vi.mock("../enquiry.member-assignment", () => ({
  autoAssignTeamMembers: vi.fn((enquiryId: string, creatorId: string) => ({
    events: [
      {
        type: "MEMBER_ADDED",
        payload: {
          enquiryId,
          memberId: `member_${creatorId}`,
          personaId: creatorId,
          role: "BDM",
          timestamp: new Date(),
        },
      },
    ],
  })),
}));

describe("enquiry.thread-creation", () => {
  describe("generateNextEnquiryId", () => {
    it("should generate ENQ-2401 for empty enquiry list", () => {
      const result = generateNextEnquiryId([]);
      expect(result).toBe("ENQ-2401");
    });

    it("should generate next sequential ID", () => {
      const enquiries: Enquiry[] = [
        { id: "ENQ-2401" } as Enquiry,
        { id: "ENQ-2402" } as Enquiry,
        { id: "ENQ-2403" } as Enquiry,
      ];
      const result = generateNextEnquiryId(enquiries);
      expect(result).toBe("ENQ-2404");
    });

    it("should handle non-sequential IDs correctly", () => {
      const enquiries: Enquiry[] = [
        { id: "ENQ-2401" } as Enquiry,
        { id: "ENQ-2405" } as Enquiry,
        { id: "ENQ-2403" } as Enquiry,
      ];
      const result = generateNextEnquiryId(enquiries);
      expect(result).toBe("ENQ-2406");
    });

    it("should ignore invalid enquiry IDs", () => {
      const enquiries: Enquiry[] = [
        { id: "ENQ-2401" } as Enquiry,
        { id: "INVALID-ID" } as Enquiry,
        { id: "ENQ-ABC" } as Enquiry,
      ];
      const result = generateNextEnquiryId(enquiries);
      expect(result).toBe("ENQ-2402");
    });
  });

  describe("findThreadInGroups", () => {
    const mockGroups: GroupChannel[] = [
      {
        id: "group_001",
        name: "Group 1",
        threads: [
          { id: "thread_001", title: "Thread 1" } as Thread,
          { id: "thread_002", title: "Thread 2" } as Thread,
        ],
      } as GroupChannel,
      {
        id: "group_002",
        name: "Group 2",
        threads: [
          { id: "thread_003", title: "Thread 3" } as Thread,
        ],
      } as GroupChannel,
    ];

    it("should find thread in first group", () => {
      const result = findThreadInGroups("thread_001", mockGroups);
      expect(result).toEqual({
        thread: { id: "thread_001", title: "Thread 1" },
        groupId: "group_001",
      });
    });

    it("should find thread in second group", () => {
      const result = findThreadInGroups("thread_003", mockGroups);
      expect(result).toEqual({
        thread: { id: "thread_003", title: "Thread 3" },
        groupId: "group_002",
      });
    });

    it("should return null for non-existent thread", () => {
      const result = findThreadInGroups("thread_999", mockGroups);
      expect(result).toBeNull();
    });

    it("should handle empty groups array", () => {
      const result = findThreadInGroups("thread_001", []);
      expect(result).toBeNull();
    });

    it("should handle groups with no threads", () => {
      const emptyGroups: GroupChannel[] = [
        { id: "group_001", name: "Group 1", threads: [] } as GroupChannel,
      ];
      const result = findThreadInGroups("thread_001", emptyGroups);
      expect(result).toBeNull();
    });
  });

  describe("resolveBuyerInfo", () => {
    it("should resolve buyer information correctly", () => {
      const result = resolveBuyerInfo("buyer_001");
      expect(result).toEqual({
        buyerName: "Acme Corp",
        buyerPersonaId: "p_buyer_acme_001",
      });
    });

    it("should handle unknown buyer with fallback name", () => {
      const result = resolveBuyerInfo("buyer_unknown");
      expect(result).toEqual({
        buyerName: "Unknown Buyer",
        buyerPersonaId: undefined,
      });
    });
  });

  describe("createEnquiryFromThread", () => {
    const mockEnquiries: Enquiry[] = [
      { id: "ENQ-2401" } as Enquiry,
      { id: "ENQ-2402" } as Enquiry,
    ];

    const mockGroups: GroupChannel[] = [
      {
        id: "group_001",
        name: "Group 1",
        threads: [
          { id: "thread_001", title: "Thread 1" } as Thread,
          { id: "thread_002", title: "Thread 2", enquiryId: "ENQ-2401" } as Thread,
        ],
      } as GroupChannel,
    ];

    it("should successfully create enquiry from thread", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      expect(result.enquiryId).toBe("ENQ-2403");
      expect(result.groupId).toBe("group_001");
      expect(result.events).toBeDefined();
      expect(result.events?.length).toBeGreaterThan(0);
    });

    it("should return error if thread not found", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_999",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Thread not found");
      expect(result.enquiryId).toBeUndefined();
    });

    it("should return error if thread already tagged", () => {
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

    it("should include enquiry creation event", () => {
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
      expect(enquiryEvent?.payload).toMatchObject({
        enquiryId: "ENQ-2403",
        buyerName: "Acme Corp",
      });
    });

    it("should include thread tagged event", () => {
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
      expect(tagEvent?.payload).toMatchObject({
        threadId: "thread_001",
        enquiryId: "ENQ-2403",
      });
    });

    it("should include team member assignment events", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_001",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      const memberEvent = result.events?.find(e => e.type === "MEMBER_ADDED");
      expect(memberEvent).toBeDefined();
    });

    it("should handle unknown buyer", () => {
      const result = createEnquiryFromThread({
        threadId: "thread_001",
        buyerId: "buyer_unknown",
        existingEnquiries: mockEnquiries,
        allGroupChannels: mockGroups,
        creatorPersonaId: "p_bdm_001",
      });

      expect(result.success).toBe(true);
      const enquiryEvent = result.events?.find(e => e.type === "ENQUIRY_CREATED");
      expect(enquiryEvent?.payload.buyerName).toBe("Unknown Buyer");
    });
  });

  describe("getNavigationStateAfterCreation", () => {
    it("should return correct navigation state", () => {
      const result = getNavigationStateAfterCreation(
        "ENQ-2403",
        "thread_001",
        "group_001"
      );

      expect(result).toEqual({
        selectedEnquiryId: "ENQ-2403",
        selectedThreadId: "thread_001",
        selectedGroupId: "group_001",
        selectedBuyerDMId: null,
        selectedSellerDMId: null,
        threadViewMode: "main",
        threadPanelOpen: true,
        currentChannel: "internal",
      });
    });
  });
});
