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

  it("shows a Seller RFQ chip above the message body when flagged", () => {
    const message: Message = {
      id: "msg-rfq",
      type: "user",
      sender: "Aishwarya D",
      senderRole: "CM",
      content: "Please review this RFQ",
      sellerRfq: true,
      timestamp: new Date("2026-04-06T10:05:00Z"),
    };

    render(
      <MessageBubble
        message={message}
        isCurrentUser={false}
        isMobileView={false}
        currentChannel="group"
        currentRole="CM"
        enquiryId="ENQ-1"
        selectionMode={false}
        isSelected={false}
        getMessageSenderDisplay={() => ({ sender: "Aishwarya D", role: "CM" })}
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

    expect(screen.getByText("Seller RFQ")).toBeInTheDocument();
    expect(screen.getByText("Please review this RFQ")).toBeInTheDocument();
  });

  it("shows a start thread action for messages without a thread", () => {
    const message: Message = {
      id: "msg-2",
      type: "user",
      sender: "Aishwarya D",
      senderRole: "CX",
      content: "Please review this",
      timestamp: new Date("2026-04-06T10:05:00Z"),
    };
    const onCreateThreadFromMessage = vi.fn();

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
        onCreateThreadFromMessage={onCreateThreadFromMessage}
        toggleMessageSelection={vi.fn()}
        setSelectionMode={vi.fn()}
        setSelectedMessages={vi.fn()}
      />
    );

    expect(screen.getByTitle("Start thread")).toBeInTheDocument();
  });

  it("does not show a manual start thread action for mail channel messages", () => {
    const message: Message = {
      id: "msg-3",
      type: "user",
      sender: "Aishwarya D",
      senderRole: "CX",
      content: "Please review this mail",
      timestamp: new Date("2026-04-06T10:05:00Z"),
    };

    render(
      <MessageBubble
        message={message}
        isCurrentUser={false}
        isMobileView={false}
        currentChannel="mail"
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
        onCreateThreadFromMessage={vi.fn()}
        channelKind="mail"
        toggleMessageSelection={vi.fn()}
        setSelectionMode={vi.fn()}
        setSelectedMessages={vi.fn()}
      />
    );

    expect(screen.queryByTitle("Start thread")).not.toBeInTheDocument();
  });

  it("shows an open thread affordance for threaded mail messages even without replies", () => {
    const message: Message = {
      id: "msg-4",
      type: "user",
      sender: "Ramesh Industries",
      senderRole: "Buyer",
      content: "Subject: Request for latest quote",
      threadId: "thread-mail-1",
      replyCount: 0,
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
        getMessageSenderDisplay={() => ({ sender: "Ramesh Industries", role: "Buyer" })}
        getPersonaById={() => undefined}
        personaMap={personaMap}
        renderSharedIndicator={() => null}
        renderMessageContent={() => <span>{message.content}</span>}
        isImage={() => false}
        onQuickAction={vi.fn()}
        onOpenThread={vi.fn()}
        channelKind="mail"
        toggleMessageSelection={vi.fn()}
        setSelectionMode={vi.fn()}
        setSelectedMessages={vi.fn()}
      />
    );

    expect(screen.getByText("Open thread")).toBeInTheDocument();
  });

  it("renders document attachments as file cards and preserves the PO badge", () => {
    const message: Message = {
      id: "msg-5",
      type: "user",
      sender: "Aishwarya D",
      senderRole: "BDM",
      content: "",
      attachment: {
        name: "purchase-order.pdf",
        type: "application/pdf",
        url: "https://example.com/purchase-order.pdf",
        markAsPO: true,
      },
      timestamp: new Date("2026-04-06T10:05:00Z"),
    };

    render(
      <MessageBubble
        message={message}
        isCurrentUser={false}
        isMobileView={false}
        currentChannel="group"
        currentRole="BDM"
        enquiryId="ENQ-1"
        selectionMode={false}
        isSelected={false}
        getMessageSenderDisplay={() => ({ sender: "Aishwarya D", role: "BDM" })}
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

    expect(screen.getByText("purchase-order.pdf")).toBeInTheDocument();
    expect(screen.getByText("Document attachment")).toBeInTheDocument();
    expect(screen.getByText("PO")).toBeInTheDocument();
  });
});
