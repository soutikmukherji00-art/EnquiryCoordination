import { describe, expect, it } from "vitest";
import type { Message } from "@/domain/message/message.types";
import { mergeWinMarkOverrides } from "@/domain/message/share.types";

function msg(overrides: Partial<Message> & { id: string }): Message {
  return {
    id: overrides.id,
    content: overrides.content ?? "",
    timestamp: overrides.timestamp ?? new Date(),
    sender: overrides.sender ?? "Buyer",
    senderRole: overrides.senderRole ?? "Buyer",
    ...overrides,
  } as Message;
}

describe("mergeWinMarkOverrides", () => {
  it("merges selection-bar overrides into buildInitialWinMarks base", () => {
    const messages = [
      msg({
        id: "m1",
        content: "ok",
        attachment: { name: "doc.pdf", type: "application/pdf", url: "" },
      }),
    ];
    const merged = mergeWinMarkOverrides(messages, {
      m1: { po: true, buyerConfirmation: false },
    });
    expect(merged.m1).toEqual({ po: true, buyerConfirmation: false });
  });

  it("returns base when overrides are undefined", () => {
    const messages = [msg({ id: "m1", content: "hi" })];
    const merged = mergeWinMarkOverrides(messages, undefined);
    expect(merged.m1).toEqual({ po: false, buyerConfirmation: false });
  });
});
