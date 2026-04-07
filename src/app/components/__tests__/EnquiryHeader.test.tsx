import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PolicyProvider } from "@/infrastructure";
import { EnquiryHeader } from "../EnquiryHeader";
import type { Enquiry, Member, Persona } from "@/domain/enquiry/enquiry.types";

describe("EnquiryHeader", () => {
  const enquiry = {
    id: "ENQ-EQ69CA1264X",
    state: "Awaiting Response",
    buyerName: "GODREJ AND BOYCE MANUFACTURING CO LTD",
    estimatedValue: 12,
    categories: ["Bitumen"],
    memberIds: [],
    createdAt: new Date(),
    lastActivity: new Date(),
  } as Enquiry;

  const members: Member[] = [
    {
      id: "m1",
      userId: "u1",
      personaId: "p_bdm_1",
      role: "BDM",
      joinedAt: new Date(),
    },
    {
      id: "m2",
      userId: "u2",
      personaId: "p_cm_1",
      role: "CM",
      joinedAt: new Date(),
    },
  ];

  const personas = new Map<string, Persona>([
    [
      "p_bdm_1",
      {
        id: "p_bdm_1",
        userId: "u1",
        displayName: "Amit Kumar",
        role: "BDM",
        isExternal: false,
      },
    ],
    [
      "p_cm_1",
      {
        id: "p_cm_1",
        userId: "u2",
        displayName: "Priya Sharma",
        role: "CM",
        isExternal: false,
      },
    ],
  ]);

  it("renders the enquiry identity, value, category, and action cluster", () => {
    render(
      <PolicyProvider role="BDM">
        <EnquiryHeader
          enquiry={enquiry}
          currentState={enquiry.state}
          members={members}
          personas={personas}
          onStateChange={vi.fn()}
          onConvertToOrder={vi.fn()}
          onToggleAuditTrail={vi.fn()}
          showAuditTrail={false}
        />
      </PolicyProvider>
    );

    expect(screen.getByText("#ENQ-EQ69CA1264X")).toBeInTheDocument();
    expect(
      screen.getByText("GODREJ AND BOYCE MANUFACTURING CO LTD")
    ).toBeInTheDocument();
    expect(screen.getByText("₹12.00")).toBeInTheDocument();
    expect(screen.getByText("Bitumen")).toBeInTheDocument();
    expect(screen.getByText("Awaiting Response")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});
