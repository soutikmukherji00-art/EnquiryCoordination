import { describe, expect, it } from "vitest";
import { messageReducer, initialMessageState } from "@/domain/message/message.reducer";
import type { MessageEvent } from "@/domain/message/message.events";
import type { Message } from "@/domain/message/message.types";

const baseGroup = {
  id: "group_t",
  name: "Test",
  type: "custom" as const,
  status: "active" as const,
  memberIds: [],
  memberPersonaIds: [],
  createdBy: "p1",
  createdAt: new Date(),
};

describe("MESSAGE_WIN_MARKS_UPDATED", () => {
  it("sets attachment.markAsPO on a group main message", () => {
    const msg: Message = {
      id: "m-main",
      type: "user",
      content: "see file",
      timestamp: new Date(),
      attachment: { name: "po.pdf", type: "application/pdf", markAsPO: false },
    };
    const state = {
      ...initialMessageState,
      groupChannels: [{ ...baseGroup, messages: [msg], threads: [] }],
    };
    const event: MessageEvent = {
      type: "MESSAGE_WIN_MARKS_UPDATED",
      payload: { messageId: "m-main", markAsPO: true, timestamp: new Date() },
    };
    const next = messageReducer(state, event);
    expect(next.groupChannels[0].messages[0].attachment?.markAsPO).toBe(true);
  });

  it("sets markAsBuyerConfirmation on a thread reply", () => {
    const reply: Message = {
      id: "m-reply",
      type: "user",
      content: "Confirmed.",
      timestamp: new Date(),
    };
    const state = {
      ...initialMessageState,
      groupChannels: [
        {
          ...baseGroup,
          messages: [],
          threads: [
            {
              id: "th1",
              groupId: "group_t",
              rootMessageId: "root",
              enquiryId: "ENQ-1",
              messages: [reply],
              replyCount: 1,
              participants: [],
              createdBy: "p1",
              createdAt: new Date(),
            },
          ],
        },
      ],
    };
    const event: MessageEvent = {
      type: "MESSAGE_WIN_MARKS_UPDATED",
      payload: { messageId: "m-reply", buyerConfirmation: true, timestamp: new Date() },
    };
    const next = messageReducer(state, event);
    expect(next.groupChannels[0].threads?.[0].messages[0].markAsBuyerConfirmation).toBe(true);
  });

  it("clears buyer confirmation when false", () => {
    const reply: Message = {
      id: "m-reply",
      type: "user",
      content: "x",
      timestamp: new Date(),
      markAsBuyerConfirmation: true,
    };
    const state = {
      ...initialMessageState,
      groupChannels: [
        {
          ...baseGroup,
          messages: [],
          threads: [
            {
              id: "th1",
              groupId: "group_t",
              rootMessageId: "root",
              enquiryId: "ENQ-1",
              messages: [reply],
              replyCount: 1,
              participants: [],
              createdBy: "p1",
              createdAt: new Date(),
            },
          ],
        },
      ],
    };
    const event: MessageEvent = {
      type: "MESSAGE_WIN_MARKS_UPDATED",
      payload: { messageId: "m-reply", buyerConfirmation: false, timestamp: new Date() },
    };
    const next = messageReducer(state, event);
    expect(next.groupChannels[0].threads?.[0].messages[0].markAsBuyerConfirmation).toBeUndefined();
  });
});
