import { describe, expect, it, vi } from "vitest";
import {
  createEnquiryFromBuyerIntake,
  findBuyerIntakeGroup,
} from "../enquiry.buyer-intake";
import type { Enquiry } from "../enquiry.types";
import type { GroupChannel } from "@/domain/message/group.types";

vi.mock("@/domain/buyer/buyer.mock-data", () => ({
  getBuyerById: vi.fn((id: string) => {
    if (id === "buyer_001") {
      return { id: "buyer_001", name: "Acme Corp" };
    }
    return null;
  }),
  getContactsForBuyer: vi.fn((buyerId: string) => {
    if (buyerId === "buyer_001") {
      return [
        { id: "c_acme_001", name: "Acme Contact", phone: "9999999999", role: "Purchasing Manager" },
      ];
    }
    return [];
  }),
  getPrimaryContactForBuyer: vi.fn((buyerId: string) => {
    if (buyerId === "buyer_001") {
      return { id: "c_acme_001", name: "Acme Contact", phone: "9999999999", role: "Purchasing Manager" };
    }
    return undefined;
  }),
}));

vi.mock("@/domain/buyer/buyer-persona-mapping", () => ({
  getBuyerPersonaFromBuyerId: vi.fn((id: string) => {
    if (id === "buyer_001") {
      return "p_buyer_acme_001";
    }
    return undefined;
  }),
  getBdmPersonaFromBuyerId: vi.fn((id: string) => {
    if (id === "buyer_001") {
      return "p_bdm_1";
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
          member: {
            id: `member_${creatorId}`,
            userId: "u_101",
            personaId: creatorId,
            role: "BDM",
            joinedAt: new Date(),
          },
          timestamp: new Date(),
        },
      },
    ],
  })),
}));

describe("enquiry.buyer-intake", () => {
  const mockEnquiries: Enquiry[] = [
    { id: "ENQ-2401" } as Enquiry,
    { id: "ENQ-2402" } as Enquiry,
  ];

  const whatsappGroups: GroupChannel[] = [
    {
      id: "grp_buyer_b1_whatsapp",
      name: "Acme Corp - WhatsApp",
      type: "buyer",
      channelKind: "whatsapp",
      status: "active",
      memberIds: ["c_1"],
      memberPersonaIds: ["p_buyer_acme_001", "p_bdm_1"],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date(),
      lastActivity: new Date(),
      buyerId: "buyer_001",
      buyerPersonaId: "p_buyer_acme_001",
      unread: false,
      unreadCount: 0,
    } as GroupChannel,
    {
      id: "grp_internal_steel",
      name: "Steel Internal",
      type: "custom",
      status: "active",
      memberIds: ["p_bdm_1"],
      memberPersonaIds: ["p_bdm_1"],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date(),
      lastActivity: new Date(),
      threads: [],
      unread: false,
      unreadCount: 0,
    } as GroupChannel,
  ];

  it("finds the buyer WhatsApp group by buyer identity", () => {
    const group = findBuyerIntakeGroup(whatsappGroups, "buyer_001", "p_buyer_acme_001", "whatsapp");
    expect(group?.id).toBe("grp_buyer_b1_whatsapp");
  });

  it("creates an enquiry from buyer WhatsApp and emits the expected events", () => {
    const result = createEnquiryFromBuyerIntake({
      buyerPersonaId: "p_buyer_acme_001",
      buyerId: "buyer_001",
      buyerName: "Acme Corp",
      body: "Please share the latest quote for 500 MT.",
      existingEnquiries: mockEnquiries,
      allGroupChannels: whatsappGroups,
      channelKind: "whatsapp",
    });

    expect(result.success).toBe(true);
    expect(result.enquiryId).toBe("ENQ-2403");
    expect(result.groupId).toBe("grp_buyer_b1_whatsapp");
    expect(result.threadId).toBeDefined();
    expect(result.rootMessageId).toBeDefined();
    expect(result.events?.map((event) => event.type)).toEqual([
      "ENQUIRY_CREATED",
      "ENQUIRY_RECORD_CREATED",
      "MESSAGE_SENT",
      "THREAD_CREATED",
      "MESSAGE_SENT",
      "THREAD_CREATED",
      "GROUP_TAGGED",
      "MEMBER_ADDED",
    ]);

    const threadEvent = result.events?.[3];
    expect(threadEvent?.type).toBe("THREAD_CREATED");
    expect(threadEvent?.payload.enquiryId).toBe("ENQ-2403");
    expect(threadEvent?.payload.title).toContain("WhatsApp");
    expect(threadEvent?.payload.unread).toBe(true);
    expect(threadEvent?.payload.unreadCount).toBe(1);

    const messageEvent = result.events?.[2];
    expect(messageEvent?.type).toBe("MESSAGE_SENT");
    expect(messageEvent?.payload.message.content).toBe("Please share the latest quote for 500 MT.");
    expect(messageEvent?.payload.message.sender).toBe("Acme Contact");
    expect(messageEvent?.payload.message.senderPersonaId).toBe("p_buyer_acme_001");

    const internalThreadEvent = result.events?.[5];
    expect(internalThreadEvent?.type).toBe("THREAD_CREATED");
    expect(internalThreadEvent?.payload.channelId).toBe("grp_internal_steel");
    expect(internalThreadEvent?.payload.enquiryId).toBe("ENQ-2403");

    const groupTaggedEvent = result.events?.[6];
    expect(groupTaggedEvent?.type).toBe("GROUP_TAGGED");
    expect(groupTaggedEvent?.payload.groupId).toBe("grp_internal_steel");
    expect(groupTaggedEvent?.payload.enquiryId).toBe("ENQ-2403");
  });

  it("auto-creates the buyer WhatsApp group when it does not exist", () => {
    const result = createEnquiryFromBuyerIntake({
      buyerPersonaId: "p_buyer_acme_001",
      buyerId: "buyer_001",
      buyerName: "Acme Corp",
      body: "Need a quick WhatsApp reply.",
      existingEnquiries: mockEnquiries,
      allGroupChannels: [],
      channelKind: "whatsapp",
    });

    expect(result.success).toBe(true);
    expect(result.groupId).toBeDefined();
    expect(result.events?.map((event) => event.type)).toEqual([
      "GROUP_CREATED",
      "ENQUIRY_CREATED",
      "ENQUIRY_RECORD_CREATED",
      "MESSAGE_SENT",
      "THREAD_CREATED",
      "MEMBER_ADDED",
    ]);

    const groupEvent = result.events?.[0];
    expect(groupEvent?.type).toBe("GROUP_CREATED");
    expect(groupEvent?.payload.channelKind).toBe("whatsapp");
    expect(groupEvent?.payload.name).toBe("Acme Corp - WhatsApp");
  });
});
