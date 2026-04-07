import { describe, expect, it, vi } from "vitest";
import { createEnquiryFromBuyerMail, findBuyerMailGroup } from "../enquiry.mail-creation";
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

describe("enquiry.mail-creation", () => {
  const mockEnquiries: Enquiry[] = [
    { id: "ENQ-2401" } as Enquiry,
    { id: "ENQ-2402" } as Enquiry,
  ];

  const mockGroups: GroupChannel[] = [
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
      id: "grp_buyer_b1_mail",
      name: "Acme Corp - Mail",
      type: "buyer",
      channelKind: "mail",
      status: "active",
      memberIds: ["p_bdm_1", "p_buyer_acme_001"],
      memberPersonaIds: ["p_bdm_1", "p_buyer_acme_001"],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date(),
      lastActivity: new Date(),
      buyerId: "buyer_001",
      buyerPersonaId: "p_buyer_acme_001",
      unread: false,
      unreadCount: 0,
    } as GroupChannel,
  ];

  it("finds the buyer mail group by buyer identity", () => {
    const group = findBuyerMailGroup(mockGroups, "buyer_001", "p_buyer_acme_001");
    expect(group?.id).toBe("grp_buyer_b1_mail");
  });

  it("creates an enquiry from buyer mail and returns the mail thread events", () => {
    const result = createEnquiryFromBuyerMail({
      buyerPersonaId: "p_buyer_acme_001",
      buyerId: "buyer_001",
      buyerName: "Acme Corp",
      subject: "Need quote",
      body: "Please share the latest quote for 500 MT.",
      existingEnquiries: mockEnquiries,
      allGroupChannels: mockGroups,
    });

    expect(result.success).toBe(true);
    expect(result.enquiryId).toBe("ENQ-2403");
    expect(result.groupId).toBe("grp_buyer_b1_mail");
    expect(result.threadId).toBeDefined();
    expect(result.rootMessageId).toBeDefined();
    expect(result.events?.map((event) => event.type)).toEqual([
      "ENQUIRY_CREATED",
      "MESSAGE_SENT",
      "THREAD_CREATED",
      "MEMBER_ADDED",
    ]);

    const enquiryEvent = result.events?.[0];
    expect(enquiryEvent?.type).toBe("ENQUIRY_CREATED");
    expect(enquiryEvent?.payload.buyerName).toBe("Acme Corp");
    expect(enquiryEvent?.payload.buyerPersonaId).toBe("p_buyer_acme_001");

    const threadEvent = result.events?.[2];
    expect(threadEvent?.type).toBe("THREAD_CREATED");
      expect(threadEvent?.payload.enquiryId).toBe("ENQ-2403");
      expect(threadEvent?.payload.rootMessageId).toBe(result.rootMessageId);

    const messageEvent = result.events?.[1];
    expect(messageEvent?.type).toBe("MESSAGE_SENT");
    expect(messageEvent?.payload.message.threadId).toBe(result.threadId);
  });

  it("auto-creates the buyer mail group when it does not exist", () => {
    const result = createEnquiryFromBuyerMail({
      buyerPersonaId: "p_buyer_acme_001",
      buyerId: "buyer_001",
      buyerName: "Acme Corp",
      subject: "Need quote",
      body: "Please share the latest quote for 500 MT.",
      existingEnquiries: mockEnquiries,
      allGroupChannels: [],
    });

    expect(result.success).toBe(true);
    expect(result.groupId).toBeDefined();
    expect(result.events?.map((event) => event.type)).toEqual([
      "GROUP_CREATED",
      "ENQUIRY_CREATED",
      "MESSAGE_SENT",
      "THREAD_CREATED",
      "MEMBER_ADDED",
    ]);

    const groupEvent = result.events?.[0];
    expect(groupEvent?.type).toBe("GROUP_CREATED");
    expect(groupEvent?.payload.channelKind).toBe("mail");
    expect(groupEvent?.payload.buyerId).toBe("buyer_001");
    expect(groupEvent?.payload.buyerPersonaId).toBe("p_buyer_acme_001");
      expect(groupEvent?.payload.createdBy).toBe("p_bdm_1");
      expect(groupEvent?.payload.members.map((m: any) => m.id)).toContain("p_buyer_acme_001");
    });
});
