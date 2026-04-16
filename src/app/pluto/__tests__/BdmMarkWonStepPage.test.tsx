import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import type {
  ProceedToOrderSelection,
  WinSignalBuyerConfirmationSnippet,
  WinSignalPODocument,
} from "@/domain/enquiry/enquiry.approval";
import { BdmMarkWonStepPage } from "../BdmMarkWonStepPage";

function buildRecord(overrides: Partial<EnquiryRecord> = {}): EnquiryRecord {
  return {
    enquiryId: "ENQ-1",
    createdAt: new Date("2026-04-10T10:00:00Z"),
    origin: "manual",
    buyer: {
      name: "Ramesh Industries",
      company: "Ramesh Industries",
      gstin: "27ABCDE1234F1Z5",
      primaryContact: "Amit",
      ...overrides.buyer,
    },
    requirements: {
      categories: ["Steel"],
      deliveryLocation: "Delhi Project Site",
      paymentTerms: "advance",
      estimatedValue: 75000,
      notes: "Hi there",
      ...overrides.requirements,
    },
    assignment: {
      primaryCMId: "cm-1",
      primaryCMName: "Priya Sharma",
      ...overrides.assignment,
    },
    products: [
      {
        category: "Steel",
        name: "TMT 500D",
        quantity: "200",
      },
    ],
    logisticsDetails: {
      incoterms: "EXW",
      totalShippingChargesToBuyer: 123,
      ...overrides.logisticsDetails,
    },
    attachments: [],
    ...overrides,
  };
}

describe("BdmMarkWonStepPage (2-column layout)", () => {
  it("renders review-details step without step chips and with proceed CTA", () => {
    const onRecordUpdate = vi.fn();
    const onRunPoExtraction = vi.fn().mockResolvedValue({ themes: [], prefilledFields: [] });
    const onConfirm = vi.fn();
    const onBack = vi.fn();

    const poDocuments: WinSignalPODocument[] = [
      {
        messageId: "m-po-1",
        name: "PO-123.pdf",
        type: "application/pdf",
        timestamp: new Date("2026-04-01T10:00:00Z"),
      },
    ];
    const buyerConfirmations: WinSignalBuyerConfirmationSnippet[] = [
      {
        messageId: "m-buyer-1",
        content: "Buyer confirms receipt of PO.",
        timestamp: new Date("2026-04-01T11:00:00Z"),
      },
    ];

    const proceedSelection: ProceedToOrderSelection = {
      sourceMessages: [
        {
          id: "m-selected-1",
          type: "user",
          sender: "Amit",
          content: "Please convert this to order with the attached PO.",
          timestamp: new Date("2026-04-01T12:00:00Z"),
          attachment: {
            name: "Selected-PO.pdf",
            type: "application/pdf",
            url: "https://example.com/selected-po.pdf",
          },
        },
      ],
      documents: [
        {
          messageId: "m-selected-1",
          name: "Selected-PO.pdf",
          type: "application/pdf",
          url: "https://example.com/selected-po.pdf",
          timestamp: new Date("2026-04-01T12:00:00Z"),
        },
      ],
      previewDocument: {
        name: "ENQ-1-order-preview.txt",
        content: "Message 1\nSender: Amit\n\nPlease convert this to order with the attached PO.",
      },
    };

    render(
      <BdmMarkWonStepPage
        enquiryId="ENQ-1"
        record={buildRecord({})}
        hasWinSignals={true}
        poDocuments={poDocuments}
        buyerConfirmations={buyerConfirmations}
        proceedToOrderSelection={proceedSelection}
        onRecordUpdate={onRecordUpdate}
        onRunPoExtraction={onRunPoExtraction}
        onBack={onBack}
        onConfirm={onConfirm}
        confirmSubmitting={false}
        cmOptions={[{ id: "cm-1", name: "Priya Sharma" }]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Review Details" })).toBeInTheDocument();
    expect(screen.queryByText("1. Review Details")).not.toBeInTheDocument();
    expect(screen.queryByText("2. PO and Billing")).not.toBeInTheDocument();
    expect(screen.queryByText("3. Logistics & Final Checks")).not.toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("Define Terms")).toBeInTheDocument();

    expect(screen.getByLabelText(/Buyer Account/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Ship to/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Scope of Unloading/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Expected ETA/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Buyer Name/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Grasim GST/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Category Manager/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/Primary Contact/i)).not.toBeInTheDocument();

    expect(screen.getByText("Documents")).toBeInTheDocument();
    expect(screen.queryByText("Documents & Buyer confirmation")).not.toBeInTheDocument();
    expect(screen.queryByText(/No PO or buyer-confirmation marks were found yet/i)).not.toBeInTheDocument();

    expect(screen.getByText("PO-123.pdf")).toBeInTheDocument();
    expect(screen.getByText("Selected-PO.pdf")).toBeInTheDocument();
    expect(screen.getByText(/Buyer confirms receipt of PO\./i)).toBeInTheDocument();
    expect(screen.getByText("Preview text file")).toBeInTheDocument();
    expect(screen.getByDisplayValue(/Please convert this to order with the attached PO\./i)).toBeInTheDocument();

    const cta = screen.getByRole("button", { name: "Proceed" });
    expect(cta).toBeInTheDocument();
    expect(cta).toBeEnabled();
  });

  it("shows review-page validation only after user clicks proceed", () => {
    const onRecordUpdate = vi.fn();
    const onRunPoExtraction = vi.fn().mockResolvedValue({ themes: [], prefilledFields: [] });
    const onConfirm = vi.fn();
    const onBack = vi.fn();

    const recordMissingBuyerAccount = buildRecord({
      buyer: { company: "" },
    });

    render(
      <BdmMarkWonStepPage
        enquiryId="ENQ-1"
        record={recordMissingBuyerAccount}
        hasWinSignals={true}
        poDocuments={[]}
        buyerConfirmations={[]}
        onRecordUpdate={onRecordUpdate}
        onRunPoExtraction={onRunPoExtraction}
        onBack={onBack}
        onConfirm={onConfirm}
        confirmSubmitting={false}
        cmOptions={[{ id: "cm-1", name: "Priya Sharma" }]}
      />,
    );

    expect(screen.queryByText("Buyer Account is mandatory.")).not.toBeInTheDocument();

    const cta = screen.getByRole("button", { name: "Proceed" });
    expect(cta).toBeEnabled();
    fireEvent.click(cta);

    expect(screen.getByText("Buyer Account is mandatory.")).toBeInTheDocument();
    expect(screen.getByText(/Complete mandatory fields to continue:/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review Details" })).toBeInTheDocument();
  });

  it("uses cart sheet interactions to manage line items", () => {
    const onRecordUpdate = vi.fn();
    const onRunPoExtraction = vi.fn().mockResolvedValue({ themes: [], prefilledFields: [] });
    const onConfirm = vi.fn();
    const onBack = vi.fn();

    render(
      <BdmMarkWonStepPage
        enquiryId="ENQ-1"
        record={buildRecord({ products: [{ category: "Steel", name: "TMT 500D", quantity: "200" }] })}
        hasWinSignals={true}
        poDocuments={[]}
        buyerConfirmations={[]}
        onRecordUpdate={onRecordUpdate}
        onRunPoExtraction={onRunPoExtraction}
        onBack={onBack}
        onConfirm={onConfirm}
        confirmSubmitting={false}
        cmOptions={[{ id: "cm-1", name: "Priya Sharma" }]}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /click to view and manage cart items/i }));

    expect(screen.getByText("Line Items (1)")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Quantity for TMT 500D/i), {
      target: { value: "250" },
    });
    expect(screen.getByLabelText(/Quantity for TMT 500D/i)).toHaveValue("250");

    fireEvent.click(screen.getByRole("button", { name: /Add catalog item TMT Rebar/i }));
    fireEvent.click(screen.getByRole("button", { name: "Add Items" }));

    expect(screen.getByText("2 items")).toBeInTheDocument();
  });

  it("runs PO analysis on upload and shows summary in the second column", async () => {
    const onRecordUpdate = vi.fn();
    const onRunPoExtraction = vi.fn().mockResolvedValue({
      themes: ["Buyer details", "PO metadata"],
      prefilledFields: ["PO Number", "Ship to"],
    });
    const onConfirm = vi.fn();
    const onBack = vi.fn();

    render(
      <BdmMarkWonStepPage
        enquiryId="ENQ-1"
        record={buildRecord({})}
        hasWinSignals={true}
        poDocuments={[]}
        buyerConfirmations={[]}
        onRecordUpdate={onRecordUpdate}
        onRunPoExtraction={onRunPoExtraction}
        onBack={onBack}
        onConfirm={onConfirm}
        confirmSubmitting={false}
        cmOptions={[{ id: "cm-1", name: "Priya Sharma" }]}
      />,
    );

    const fileInput = screen.getByLabelText(/Add PO/i);
    const file = new File(["po"], "PO-123.pdf", { type: "application/pdf" });
    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(onRunPoExtraction).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByText("PO Analysis Summary")).toBeInTheDocument();
    expect(screen.getByText("Buyer details")).toBeInTheDocument();
    expect(screen.getByText("PO metadata")).toBeInTheDocument();
    const identifiedFields = screen.getByText("Identified fields").closest("div");
    expect(identifiedFields).not.toBeNull();
    expect(within(identifiedFields as HTMLElement).getByText("PO Number")).toBeInTheDocument();
    expect(within(identifiedFields as HTMLElement).getByText("Ship to")).toBeInTheDocument();
  });

  it("moves through wizard steps and validates on submit attempts", async () => {
    const onRecordUpdate = vi.fn().mockResolvedValue(undefined);
    const onRunPoExtraction = vi.fn().mockResolvedValue({ themes: ["PO Theme"], prefilledFields: [] });
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onBack = vi.fn();

    const recordMissingStep2And3 = buildRecord({
      buyer: {
        name: "Ramesh Industries",
        company: "Ramesh Industries",
        gstin: "27ABCDE1234F1Z5",
        primaryContact: "Amit",
      },
      requirements: {
        categories: ["Steel"],
        deliveryLocation: "Delhi Project Site",
        paymentTerms: "advance",
        estimatedValue: 75000,
        notes: "Hi there",
        billingAddress: undefined,
        poNumber: undefined,
        invoiceTermsAndConditions: undefined,
      },
      assignment: {
        primaryCMId: "cm-1",
        primaryCMName: "Priya Sharma",
      },
      products: [{ category: "Steel", name: "TMT 500D", quantity: "200" }],
      logisticsDetails: {
        incoterms: undefined,
        totalShippingChargesToBuyer: undefined,
      },
    });

    render(
      <BdmMarkWonStepPage
        enquiryId="ENQ-1"
        record={recordMissingStep2And3}
        hasWinSignals={true}
        poDocuments={[
          {
            messageId: "m-po-1",
            name: "PO-123.pdf",
            type: "application/pdf",
            timestamp: new Date("2026-04-01T10:00:00Z"),
          },
        ]}
        buyerConfirmations={[]}
        onRecordUpdate={onRecordUpdate}
        onRunPoExtraction={onRunPoExtraction}
        onBack={onBack}
        onConfirm={onConfirm}
        confirmSubmitting={false}
        cmOptions={[{ id: "cm-1", name: "Priya Sharma" }]}
      />,
    );

    const proceed = screen.getByRole("button", { name: "Proceed" });
    expect(proceed).toBeEnabled();
    fireEvent.click(proceed);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "PO and Billing" })).toBeInTheDocument();
    });

    const nextFromPoAndBilling = screen.getByRole("button", { name: "Next" });
    expect(nextFromPoAndBilling).toBeEnabled();
    fireEvent.click(nextFromPoAndBilling);

    expect(screen.getByText("Billing Address is mandatory.")).toBeInTheDocument();
    expect(screen.getByText("PO Number is mandatory.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Billing Address/i), { target: { value: "Plant 1" } });
    fireEvent.change(screen.getByLabelText(/PO Number/i), { target: { value: "PO-001" } });
    fireEvent.change(screen.getByLabelText(/Invoice Terms & Conditions/i), {
      target: { value: "Net 30" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Next" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Logistics & Final Checks" })).toBeInTheDocument();
    });

    const cta = screen.getByRole("button", { name: /Mark as Won/i });
    expect(cta).toBeEnabled();
    fireEvent.click(cta);

    expect(screen.getByText("INCOTERMS is mandatory.")).toBeInTheDocument();
    expect(screen.getByText("Total Shipping charges to Buyer is mandatory.")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/INCOTERMS/i), { target: { value: "FOB" } });
    fireEvent.change(screen.getByLabelText(/Total Shipping charges to Buyer/i), {
      target: { value: "450" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Mark as Won/i }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });
});

