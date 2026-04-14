import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
    origin: "detailed_rfq",
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
    expect(screen.getByText("Define Terms")).toBeInTheDocument();
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

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(onDispatchEvent).toHaveBeenCalledTimes(1);
    const dispatchedEvent = onDispatchEvent.mock.calls[0][0];
    expect(dispatchedEvent.type).toBe("ENQUIRY_RECORD_UPDATED");
    expect(dispatchedEvent.payload.record.products).toHaveLength(2);
    expect(dispatchedEvent.payload.record.products[0].name).toBe("Beams");
    expect(dispatchedEvent.payload.record.products[0].quantity).toBe("150 MT");
    expect(dispatchedEvent.payload.record.products[1].name).toBe("TMT Rebar");
  });

  it("keeps primary CM id and name in sync when the CM select changes", async () => {
    const onDispatchEvent = vi.fn();
    const cmOptions = [
      { id: "p_cm_a", name: "Rajesh Kumar" },
      { id: "p_cm_b", name: "Priya Sharma" },
    ];
    render(
      <StructuredPanel
        enquiryId="ENQ-1001"
        record={buildRecord({
          assignment: { primaryCMId: "p_cm_a", primaryCMName: "Rajesh Kumar" },
        })}
        summary="test summary"
        onDispatchEvent={onDispatchEvent}
        cmOptions={cmOptions}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /edit/i }));

    const cmTrigger = screen
      .getAllByRole("combobox")
      .find((el) => el.textContent?.includes("Rajesh Kumar"));
    expect(cmTrigger).toBeTruthy();
    fireEvent.click(cmTrigger!);
    const option = await waitFor(() =>
      screen.getByRole("option", { name: "Priya Sharma" }),
    );
    fireEvent.click(option);

    fireEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(onDispatchEvent).toHaveBeenCalledTimes(1);
    const dispatched = onDispatchEvent.mock.calls[0][0];
    expect(dispatched.payload.record.assignment.primaryCMId).toBe("p_cm_b");
    expect(dispatched.payload.record.assignment.primaryCMName).toBe("Priya Sharma");
  });
});

describe("StructuredPanel source preview", () => {
  it("shows concatenated WhatsApp messages for whatsapp-origin records", () => {
    render(
      <StructuredPanel
        enquiryId="ENQ-1001"
        record={buildRecord({
          origin: "whatsapp_intake",
          requirements: {
            ...buildRecord().requirements,
            notes: "Need 200 MT TMT bars by Monday.",
          },
        })}
        summary=""
        onDispatchEvent={vi.fn()}
        messagesByChannel={{
          buyer: [
            {
              id: "w1",
              type: "user",
              content: "Need 200 MT TMT bars by Monday.",
              sender: "Buyer",
              senderRole: "Buyer",
              timestamp: new Date("2026-04-14T09:40:00Z"),
            },
            {
              id: "w2",
              type: "user",
              content: "Also include MTC in dispatch docs.",
              sender: "Buyer",
              senderRole: "Buyer",
              timestamp: new Date("2026-04-14T09:42:00Z"),
            },
          ],
        }}
      />,
    );

    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText(/Need 200 MT TMT bars by Monday\./)).toBeInTheDocument();
    expect(screen.getByText(/Also include MTC in dispatch docs\./)).toBeInTheDocument();
  });

  it("shows only a single mail card for mail-origin records", () => {
    render(
      <StructuredPanel
        enquiryId="ENQ-1001"
        record={buildRecord({
          origin: "mail_intake",
          sourceCorrespondences: [
            {
              kind: "email",
              subject: "RE: RFQ steel coils",
              from: "buyer@example.com",
              to: "rfq@birlapivot.example.com",
              receivedAt: "Tue, 14 Apr 2026 10:20:00 +0530",
              body: "Please include slit-edge spec in quote.",
            },
            {
              kind: "email",
              subject: "RFQ steel coils",
              from: "buyer@example.com",
              to: "rfq@birlapivot.example.com",
              receivedAt: "Tue, 14 Apr 2026 09:40:00 +0530",
              body: "Need 120 MT CR coils, delivery Mumbai.",
            },
          ],
        })}
        summary=""
        onDispatchEvent={vi.fn()}
      />,
    );

    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("RE: RFQ steel coils")).toBeInTheDocument();
    expect(screen.queryByText("RFQ steel coils")).not.toBeInTheDocument();
  });
});
