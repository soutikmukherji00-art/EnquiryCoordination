import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";
import { OrderSummaryPage } from "../OrderSummaryPage";

function buildRecord(): EnquiryRecord {
  return {
    enquiryId: "ENQ-1",
    createdAt: new Date("2026-04-10T10:00:00Z"),
    origin: "manual",
    buyer: {
      name: "Ramesh Industries",
      company: "Ramesh Industries",
      primaryContact: "Amit",
    },
    requirements: {
      categories: ["Steel"],
      deliveryLocation: "Delhi Project Site",
      deliveryLocations: ["Plant 1", "Plant 2"],
      paymentTerms: "advance",
      estimatedValue: 1000,
      etaDays: 3,
      notes: "Initial notes",
    },
    assignment: {},
    products: [
      {
        category: "Steel",
        name: "TMT 500D",
        quantity: "10",
        offeredQuantity: "10",
        sellerBasePrice: 80,
        buyerPrice: 100,
      },
    ],
    sellerDetails: {
      sellerName: "Suresh Industries",
      warehouseName: "Plant 1",
      paymentTerms: "advance",
      sellerCreditDays: 2,
    },
    logisticsDetails: {
      provider: "buyer_shipped",
      transporterName: "Safe Transport",
      totalShippingChargesToBuyer: 250,
    },
  };
}

describe("OrderSummaryPage", () => {
  it("lets CM edit seller details on a dedicated page and persists the structured record", async () => {
    const onRecordUpdate = vi.fn().mockResolvedValue(undefined);
    const onConfirm = vi.fn();

    render(
      <OrderSummaryPage
        enquiryId="ENQ-1"
        record={buildRecord()}
        onBack={vi.fn()}
        onRecordUpdate={onRecordUpdate}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Edit" })[1]);

    expect(screen.getByRole("heading", { name: "Edit Seller Details" })).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue("Suresh Industries"), {
      target: { value: "Updated Seller" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(onRecordUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          sellerDetails: expect.objectContaining({
            sellerName: "Updated Seller",
          }),
        }),
      );
    });

    expect(screen.getByText("Updated Seller")).toBeInTheDocument();
  });
});
