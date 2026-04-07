import { describe, expect, it } from "vitest";
import { initialMessageState, messageReducer } from "@/domain/message/message.reducer";
import { createGroupCreatedEvent, createGroupTaggedEvent } from "@/domain/message/message.events";

describe("GROUP_TAGGED", () => {
  it("attaches an existing internal group to an enquiry", () => {
    const created = messageReducer(
      initialMessageState,
      createGroupCreatedEvent(
        "group-tag-001",
        "Birla Pivot",
        "custom",
        "active",
        [
          {
            id: "p_bdm_1",
            type: "persona",
            name: "Amit Kumar",
          },
        ],
        "p_bdm_1"
      )
    );

    const tagged = messageReducer(
      created,
      createGroupTaggedEvent("group-tag-001", "ENQ-2401", "p_bdm_1")
    );

    expect(tagged.groupChannels[0].enquiryId).toBe("ENQ-2401");
    expect(tagged.groupChannels[0].lastActivity).toBeDefined();
  });
});
