import { describe, expect, it } from "vitest";
import { buildGroupEnquiryThreads, buildInternalEnquiryThread, findInternalGroupForEnquiry } from "@/domain/enquiry/enquiry.creation";
import type { GroupChannel } from "@/domain/message/group.types";
import { createGroupTaggedEvent } from "@/domain/message/message.events";

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

  it("honors an explicitly selected internal group", () => {
    const group = findInternalGroupForEnquiry(groups, ["Steel"], "grp_internal_polymer");

    expect(group?.id).toBe("grp_internal_polymer");
  });

  it("builds an empty enquiry thread for a selected internal group", () => {
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
      preferredGroupId: "grp_internal_polymer",
    });

    expect(result).not.toBeNull();
    expect(result?.groupId).toBe("grp_internal_polymer");
    expect(result?.threadTitle).toContain("Acme Corp");
    expect(result?.threadTitle).toContain("Steel");
    expect(result?.events).toHaveLength(2);

    const threadEvent = result?.events.find((event) => event.type === "THREAD_CREATED");
    expect(threadEvent?.type).toBe("THREAD_CREATED");
    expect(threadEvent && "payload" in threadEvent ? threadEvent.payload.enquiryId : undefined).toBe("ENQ-2501");
    expect(threadEvent && "payload" in threadEvent ? threadEvent.payload.rootMessageId : undefined).toBeUndefined();
    expect(threadEvent && "payload" in threadEvent ? threadEvent.payload.rootMessage : undefined).toBeUndefined();

    const groupTagEvent = result?.events.find((event) => event.type === createGroupTaggedEvent("grp_internal_polymer", "ENQ-2501", "p_bdm_1").type);
    expect(groupTagEvent).toBeDefined();
    expect(groupTagEvent && "payload" in groupTagEvent ? groupTagEvent.payload.groupId : undefined).toBe("grp_internal_polymer");
    expect(groupTagEvent && "payload" in groupTagEvent ? groupTagEvent.payload.enquiryId : undefined).toBe("ENQ-2501");
  });

  it("builds empty threads for every selected group", () => {
    const buyerGroup: GroupChannel = {
      id: "grp_buyer_b1_mail",
      name: "Buyer Mail",
      type: "buyer",
      buyerId: "buyer_1",
      status: "active",
      memberIds: [],
      memberPersonaIds: [],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date("2026-01-01T00:00:00Z"),
      threads: [],
    };

    const result = buildGroupEnquiryThreads({
      enquiryId: "ENQ-2502",
      data: {
        buyerName: "Acme Corp",
        categories: ["Steel"],
      },
      creatorPersonaId: "p_bdm_1",
      creatorRole: "BDM",
      allGroupChannels: [...groups, buyerGroup],
      groupIds: ["grp_buyer_b1_mail", "grp_internal_steel", "grp_internal_steel"],
    });

    expect(result.results).toHaveLength(2);
    expect(result.primaryGroupId).toBe("grp_buyer_b1_mail");
    expect(result.primaryThreadId).toBeTruthy();
    expect(result.results.every((thread) => thread.events.some((event) => event.type === "THREAD_CREATED"))).toBe(true);
    expect(
      result.results.every((thread) =>
        thread.events.every((event) =>
          event.type === "THREAD_CREATED" || event.type === "GROUP_TAGGED",
        ),
      ),
    ).toBe(true);
  });
});
