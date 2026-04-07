import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "../MessageBubble";
import type { Message, Persona } from "@/domain/enquiry/enquiry.types";

describe("MessageBubble", () => {
  const personaMap = new Map<string, Persona>();

  it("shows a role badge beside the sender name", () => {
    const message: Message = {
      id: "msg-1",
      type: "user",
      sender: "Aishwarya D",
      senderRole: "CX",
      content: "Hello world",
      timestamp: new Date("2026-04-06T10:05:00Z"),
    };

    render(
      <MessageBubble
        message={message}
        isCurrentUser={false}
        isMobileView={false}
        currentChannel="group"
        currentRole="CX"
        enquiryId="ENQ-1"
        selectionMode={false}
        isSelected={false}
        getMessageSenderDisplay={() => ({ sender: "Aishwarya D", role: "CX" })}
        getPersonaById={() => undefined}
        personaMap={personaMap}
        renderSharedIndicator={() => null}
        renderMessageContent={() => <span>{message.content}</span>}
        isImage={() => false}
        onQuickAction={vi.fn()}
        toggleMessageSelection={vi.fn()}
        setSelectionMode={vi.fn()}
        setSelectedMessages={vi.fn()}
      />
    );

    expect(screen.getByText("Aishwarya D")).toBeInTheDocument();
    expect(screen.getByText("CX")).toBeInTheDocument();
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });
});
