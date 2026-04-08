import { describe, expect, it } from "vitest";
import { buildStructuredDocuments } from "../StructuredPanel";
import type { Message } from "@/domain/message/message.types";

describe("StructuredPanel document aggregation", () => {
  it("preserves the PO flag on uploaded documents", () => {
    const messagesByChannel: Record<string, Message[]> = {
      internal: [
        {
          id: "msg-1",
          type: "user",
          content: "",
          sender: "Amit Kumar",
          senderRole: "BDM",
          timestamp: new Date("2026-04-06T10:05:00Z"),
          attachment: {
            name: "purchase-order.pdf",
            type: "application/pdf",
            url: "https://example.com/purchase-order.pdf",
            markAsPO: true,
          },
        },
      ],
    };

    const documents = buildStructuredDocuments(messagesByChannel);
    const uploaded = documents.find((doc) => doc.name === "purchase-order.pdf");

    expect(uploaded).toBeDefined();
    expect(uploaded?.markAsPO).toBe(true);
    expect(uploaded?.sourceLabel).toBe("Internal chat");
  });

  it("labels thread attachments as thread replies", () => {
    const messagesByChannel: Record<string, Message[]> = {
      thread_123: [
        {
          id: "msg-thread-1",
          type: "user",
          content: "",
          sender: "Amit Kumar",
          senderRole: "BDM",
          timestamp: new Date("2026-04-06T10:05:00Z"),
          attachment: {
            name: "thread-note.pdf",
            type: "application/pdf",
            url: "https://example.com/thread-note.pdf",
          },
        },
      ],
    };

    const documents = buildStructuredDocuments(messagesByChannel);
    const uploaded = documents.find((doc) => doc.name === "thread-note.pdf");

    expect(uploaded).toBeDefined();
    expect(uploaded?.sourceLabel).toBe("Thread replies");
  });
});
