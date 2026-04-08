import { describe, expect, it } from "vitest";
import { buildInternalEnquiryThread, findInternalGroupForEnquiry } from "@/domain/enquiry/enquiry.creation";
import type { GroupChannel } from "@/domain/message/group.types";
import type { Message } from "@/domain/message/message.types";

describe("internal enquiry thread creation", () => {
  const groups: GroupChannel[] = [
    {
      id: "grp_internal_steel",
      name: "Steel Internal",
      type: "custom",
      status: "active",
      memberIds: [],
      memberPersonaIds: [],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      threads: [],
    },
    {
      id: "grp_internal_polymer",
      name: "Polymer Internal",
      type: "custom",
      status: "active",
      memberIds: [],
      memberPersonaIds: [],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      threads: [],
    },
  ];

  it("chooses the category-matched internal group", () => {
    const group = findInternalGroupForEnquiry(groups, ["Steel"]);

    expect(group?.id).toBe("grp_internal_steel");
  });

  it("falls back to the first internal group when no category matches", () => {
    const group = findInternalGroupForEnquiry(groups, ["Bitumen"]);

    expect(group?.id).toBe("grp_internal_steel");
  });

  it("builds a root thread message and thread event for the selected category", () => {
    const poMessage: Message = {
      id: "po-msg-1",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: "p_bdm_1",
      senderRole: "BDM",
      content: "",
      timestamp: new Date("2026-04-06T10:05:00Z"),
      attachment: {
        name: "purchase-order.pdf",
        type: "application/pdf",
        url: "https://example.com/purchase-order.pdf",
        markAsPO: true,
      },
    };

    const result = buildInternalEnquiryThread({
      enquiryId: "ENQ-2501",
      data: {
        buyerName: "Acme Corp",
        categories: ["Steel"],
        notes: "Need 200 MT TMT 500D",
      },
      creatorPersonaId: "p_bdm_1",
      creatorRole: "BDM",
      allGroupChannels: groups,
      sourceMessages: [
        {
          id: "summary-msg-1",
          type: "system",
          sender: "Amit Kumar",
          senderPersonaId: "p_bdm_1",
          senderRole: "BDM",
          content: "New enquiry ENQ-2501 • Buyer: Acme Corp • Category: Steel",
          timestamp: new Date("2026-04-06T10:04:00Z"),
        },
        poMessage,
      ],
    });

    expect(result).not.toBeNull();
    expect(result?.groupId).toBe("grp_internal_steel");
    expect(result?.threadTitle).toContain("Acme Corp");
    expect(result?.threadTitle).toContain("Steel");
    expect(result?.events).toHaveLength(1);

    const threadEvent = result?.events[0];
    expect(threadEvent?.type).toBe("THREAD_CREATED");
    expect(threadEvent && "payload" in threadEvent ? threadEvent.payload.enquiryId : undefined).toBe("ENQ-2501");
    expect(threadEvent && "payload" in threadEvent ? threadEvent.payload.rootMessageId : undefined).toBe("po-msg-1");
    expect(threadEvent && "payload" in threadEvent ? threadEvent.payload.rootMessage?.attachment?.name : undefined).toBe("purchase-order.pdf");
  });
});
