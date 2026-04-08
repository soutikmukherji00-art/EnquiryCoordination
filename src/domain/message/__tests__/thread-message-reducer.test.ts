import { describe, expect, it } from "vitest";
import {
  initialMessageState,
  messageReducer,
} from "@/domain/message/message.reducer";
import {
  createGroupCreatedEvent,
  createMessageSentEvent,
  createThreadCreatedEvent,
  createThreadMessageSentEvent,
} from "@/domain/message/message.events";
import type { GroupChannel } from "@/domain/message/group.types";
import type { Message } from "@/domain/message/message.types";

describe("Thread message reducer", () => {
  it("persists thread replies and updates the root message in the Steel Internal group", () => {
    const group: GroupChannel = {
      id: "grp_internal_steel",
      name: "Steel Internal",
      type: "custom",
      status: "active",
      memberIds: ["p_cm_1", "p_bdm_1"],
      memberPersonaIds: ["p_cm_1", "p_bdm_1"],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      threads: [],
    };

    const rootMessage: Message = {
      id: "msg-root-1",
      type: "user",
      sender: "Amit Kumar",
      senderPersonaId: "p_bdm_1",
      senderRole: "BDM",
      content: "Root thread message",
      timestamp: new Date("2026-01-01T00:01:00.000Z"),
    };

    let state = messageReducer(initialMessageState, createGroupCreatedEvent(group));
    state = messageReducer(state, createMessageSentEvent("ENQ-001", group.id, rootMessage));
    state = messageReducer(
      state,
      createThreadCreatedEvent(
        "thread-123",
        group.id,
        "p_bdm_1",
        "Thread title",
        "ENQ-001",
        rootMessage.id,
        rootMessage,
      ),
    );

    const reply: Message = {
      id: "msg-reply-1",
      type: "user",
      sender: "Priya Sharma",
      senderPersonaId: "p_cm_1",
      senderRole: "CM",
      content: "Thread reply",
      timestamp: new Date("2026-01-01T00:02:00.000Z"),
    };

    const newState = messageReducer(
      state,
      createThreadMessageSentEvent("thread-123", group.id, reply),
    );

    const updatedGroup = newState.groupChannels[0];
    const updatedThread = updatedGroup.threads?.[0];
    const updatedRoot = updatedGroup.messages.find((m) => m.id === rootMessage.id);

    expect(updatedThread?.messages).toHaveLength(1);
    expect(updatedThread?.replyCount).toBe(1);
    expect(updatedThread?.messages[0].id).toBe(reply.id);
    expect(updatedRoot?.replyCount).toBe(1);
    expect(updatedRoot?.threadParticipants).toContain("p_cm_1");
  });
});
