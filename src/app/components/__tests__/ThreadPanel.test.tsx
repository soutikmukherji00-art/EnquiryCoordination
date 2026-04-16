import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ThreadPanel } from "../ThreadPanel";

vi.mock("@/hooks/useVoiceMessage", () => ({
  useVoiceMessage: () => ({
    state: "idle",
    isSupported: false,
    elapsedTime: 0,
    stream: null,
    startRecording: vi.fn(),
    stopRecording: vi.fn(),
    cancelRecording: vi.fn(),
  }),
}));

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("ThreadPanel", () => {
  it("renders the approval CTA in tagged enquiry headers", () => {
    render(
      <ThreadPanel
        thread={{
          id: "thread_1",
          groupId: "group_1",
          rootMessageId: "msg-root",
          enquiryId: "ENQ-2401",
          messages: [],
          replyCount: 0,
          participants: [],
          createdBy: "p_bdm_1",
          createdAt: new Date(),
        }}
        groupName="Internal Group"
        groupId="group_1"
        currentPersonaId="p_bdm_1"
        currentUser="Amit Kumar"
        currentRole="BDM"
        personaMap={new Map()}
        onSendReply={vi.fn()}
        onClose={vi.fn()}
        enquiryData={{
          enquiryId: "ENQ-2401",
          buyerName: "Acme Corp",
          state: "RM Approved",
          estimatedValue: 120000,
          categories: ["Steel" as any],
        }}
        approvalAction={{
          label: "Proceed",
          onClick: vi.fn(),
        }}
      />
    );

    expect(screen.getByText("Proceed")).toBeInTheDocument();
    expect(screen.getByText("RM Approved")).toBeInTheDocument();
  });

  it("does not render an approval CTA when none is provided", () => {
    render(
      <ThreadPanel
        thread={{
          id: "thread_2",
          groupId: "group_2",
          rootMessageId: "msg-root-2",
          enquiryId: "ENQ-2402",
          messages: [],
          replyCount: 0,
          participants: [],
          createdBy: "p_bdm_1",
          createdAt: new Date(),
        }}
        groupName="External Group"
        groupId="group_2"
        currentPersonaId="p_bdm_1"
        currentUser="Amit Kumar"
        currentRole="BDM"
        personaMap={new Map()}
        onSendReply={vi.fn()}
        onClose={vi.fn()}
        enquiryData={{
          enquiryId: "ENQ-2402",
          buyerName: "Buyer Corp",
          state: "RM Approved",
          estimatedValue: 45000,
          categories: ["Steel" as any],
        }}
      />
    );

    expect(screen.queryByText("Proceed")).not.toBeInTheDocument();
  });
});
