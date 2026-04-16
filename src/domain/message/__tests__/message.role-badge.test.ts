import { describe, it, expect } from "vitest";
import { getMessageRoleBadgeLabel } from "../message.role-badge";
import type { Message } from "../message.types";
import { APP_CONFIG } from "@/domain/utils/constants";

function base(overrides: Partial<Message> = {}): Message {
  return {
    id: "m1",
    type: "user",
    content: "hi",
    timestamp: new Date(),
    ...overrides,
  };
}

describe("getMessageRoleBadgeLabel", () => {
  it('returns BOT for masked messages shown as company name', () => {
    const m = base({
      masked: true,
      sender: APP_CONFIG.COMPANY_NAME,
      displaySender: APP_CONFIG.COMPANY_NAME,
      senderRole: "BDM",
    });
    expect(getMessageRoleBadgeLabel(m)).toBe("BOT");
  });

  it("uses displaySender match when sender differs", () => {
    const m = base({
      masked: true,
      sender: "Someone",
      displaySender: APP_CONFIG.COMPANY_NAME,
      senderRole: "BDM",
    });
    expect(getMessageRoleBadgeLabel(m)).toBe("BOT");
  });

  it("does not label BOT when masked but not company rebrand", () => {
    const m = base({
      masked: true,
      displaySender: "Seller response",
      senderRole: "Seller",
    });
    expect(getMessageRoleBadgeLabel(m)).toBe("Seller");
  });

  it("returns senderRole when not masked company", () => {
    const m = base({ senderRole: "CM" });
    expect(getMessageRoleBadgeLabel(m)).toBe("CM");
  });

  it("uses persona fallback when senderRole missing", () => {
    const m = base({});
    expect(getMessageRoleBadgeLabel(m, "CX")).toBe("CX");
  });
});
