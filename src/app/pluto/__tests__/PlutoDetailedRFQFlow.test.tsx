import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlutoDetailedRFQFlow } from "../PlutoDetailedRFQFlow";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";

describe("PlutoDetailedRFQFlow", () => {
  it("shows mandatory buyer error when prefilled enquiry has no buyer identity", () => {
    const prefillRecord: EnquiryRecord = {
      enquiryId: "ENQ-2416",
      createdAt: new Date("2026-04-09T10:00:00Z"),
      origin: "mail_intake",
      buyer: {
        name: "Unknown Buyer",
      },
      requirements: {
        categories: ["Steel"],
      },
      assignment: {
        bdmPersonaId: "p_bdm_1",
      },
    };

    render(
      <PlutoDetailedRFQFlow
        onBack={vi.fn()}
        onSubmit={vi.fn()}
        prefillRecord={prefillRecord}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next Step" }));
    expect(screen.getByText("Buyer name is required")).toBeInTheDocument();
  });
});
