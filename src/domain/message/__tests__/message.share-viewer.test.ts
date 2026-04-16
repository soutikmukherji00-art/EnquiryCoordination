import { describe, expect, it } from "vitest";
import {
  isMessageActingAsCurrentUser,
  shouldMaskSharedMessageAsCompanyBotForExternalViewer,
} from "../message.share-viewer";
import type { Message } from "../message.types";

const base = (overrides: Partial<Message> = {}): Message =>
  ({
    id: "m1",
    type: "user",
    content: "hi",
    timestamp: new Date(),
    ...overrides,
  }) as Message;

describe("message.share-viewer", () => {
  it("treats shared-by persona as current user for bubble ownership", () => {
    const msg = base({
      type: "shared",
      sharedByPersonaId: "p_cm",
      senderPersonaId: "p_other",
      sender: "Other",
      senderRole: "CM",
      sharedFrom: {
        channel: "group-main",
        originalSender: "X",
        originalTimestamp: new Date(),
      },
    });
    expect(isMessageActingAsCurrentUser(msg, "p_cm", "CM")).toBe(true);
    expect(isMessageActingAsCurrentUser(msg, "p_buyer", "Buyer")).toBe(false);
  });

  it("masks shared messages for external viewers when not the sharer", () => {
    const msg = base({
      type: "shared",
      sharedByPersonaId: "p_cm",
      sharedFrom: { channel: "group-main", originalSender: "X", originalTimestamp: new Date() },
    });
    expect(
      shouldMaskSharedMessageAsCompanyBotForExternalViewer(
        "Buyer",
        msg,
        false,
      ),
    ).toBe(true);
    expect(
      shouldMaskSharedMessageAsCompanyBotForExternalViewer(
        "Buyer",
        msg,
        true,
      ),
    ).toBe(false);
  });

  it("does not mask for internal roles", () => {
    const msg = base({ type: "shared", sharedByPersonaId: "p_cm" });
    expect(
      shouldMaskSharedMessageAsCompanyBotForExternalViewer("CM", msg, false),
    ).toBe(false);
  });

  it("treats sharedFrom without type shared as shared for external masking", () => {
    const msg = base({
      type: "user",
      sharedByPersonaId: "p_cm",
      sharedFrom: { channel: "thread", originalSender: "Y", originalTimestamp: new Date() },
    });
    expect(
      shouldMaskSharedMessageAsCompanyBotForExternalViewer(
        "Seller",
        msg,
        false,
      ),
    ).toBe(true);
  });
});
