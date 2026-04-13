import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { buildStructuredDocuments } from "../structured-panel.utils";
import { StructuredPanel } from "../StructuredPanel";
import type { Message } from "@/domain/message/message.types";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
  },
}));

function buildRecord(overrides: Partial<EnquiryRecord> = {}): EnquiryRecord {
  return {
    enquiryId: "ENQ-1001",
    createdAt: new Date("2026-04-13T10:00:00Z"),
    creationSource: "pluto-detailed-rfq",
    buyer: {
      id: "buyer_1",
      name: "Ramesh Industries",
      company: "Ramesh Industries",
    },
    requirements: {
      categories: ["Steel"],
      paymentTerms: "credit",
      enhancerTypes: [],
    },
    assignment: {},
    products: [
      { category: "Steel", name: "TMT Rebar", quantity: "50 MT" },
      { category: "Steel", name: "Beams", quantity: "100 MT" },
    ],
    ...overrides,
  };
}

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

  it("deduplicates the same PO document even when the URLs differ across channels", () => {
    const messagesByChannel: Record<string, Message[]> = {
      internal: [
        {
          id: "msg-internal-1",
          type: "user",
          content: "",
          sender: "Amit Kumar",
          senderRole: "BDM",
          timestamp: new Date("2026-04-06T10:05:00Z"),
          attachment: {
            name: "purchase-order.pdf",
            type: "application/pdf",
            url: "https://example.com/internal-copy-of-po.pdf",
            markAsPO: true,
          },
        },
      ],
      thread_123: [
        {
          id: "msg-thread-1",
          type: "user",
          content: "",
          sender: "Amit Kumar",
          senderRole: "BDM",
          timestamp: new Date("2026-04-06T10:06:00Z"),
          attachment: {
            name: "purchase-order.pdf",
            type: "application/pdf",
            url: "https://example.com/thread-copy-of-po.pdf",
            markAsPO: true,
          },
        },
      ],
    };

    const documents = buildStructuredDocuments(messagesByChannel);
    const uploaded = documents.filter((doc) => doc.name === "purchase-order.pdf");

    expect(uploaded).toHaveLength(1);
    expect(uploaded[0].sourceLabel).toContain("Internal chat");
    expect(uploaded[0].sourceLabel).toContain("Thread replies");
  });
});

describe("StructuredPanel cart drilldown", () => {
  it("shows line item summary card with count", () => {
    render(
      <StructuredPanel
        enquiryId="ENQ-1001"
        record={buildRecord()}
        summary="test summary"
        onDispatchEvent={vi.fn()}
      />,
    );

    expect(screen.getByText("Line Items")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("navigates to cart L1 and back", () => {
    render(
      <StructuredPanel
        enquiryId="ENQ-1001"
        record={buildRecord()}
        summary="test summary"
        onDispatchEvent={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /2 items/i }));
    expect(screen.getByText("Line Items (2)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(screen.getByText("Structured Data")).toBeInTheDocument();
    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("updates cart items and dispatches saved record", () => {
    const onDispatchEvent = vi.fn();
    render(
      <StructuredPanel
        enquiryId="ENQ-1001"
        record={buildRecord()}
        summary="test summary"
        onDispatchEvent={onDispatchEvent}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));
    fireEvent.click(screen.getByRole("button", { name: /2 items/i }));

    fireEvent.change(screen.getByLabelText("Quantity for Beams"), {
      target: { value: "150 MT" },
    });

    const removeButtons = screen.getAllByRole("button", { name: /remove/i });
    fireEvent.click(removeButtons[0]);
    expect(screen.getByText("Line Items (1)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add item/i }));
    fireEvent.click(screen.getByRole("button", { name: /add catalog item TMT Rebar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Add Items" }));
    expect(screen.getByText("Line Items (2)")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    expect(onDispatchEvent).toHaveBeenCalledTimes(1);
    const dispatchedEvent = onDispatchEvent.mock.calls[0][0];
    expect(dispatchedEvent.type).toBe("ENQUIRY_RECORD_UPDATED");
    expect(dispatchedEvent.payload.record.products).toHaveLength(2);
    expect(dispatchedEvent.payload.record.products[0].name).toBe("Beams");
    expect(dispatchedEvent.payload.record.products[0].quantity).toBe("150 MT");
    expect(dispatchedEvent.payload.record.products[1].name).toBe("TMT Rebar");
  });
});
