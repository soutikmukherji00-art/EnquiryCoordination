import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { EnquiryList } from "../EnquiryList";
import type { GroupChannel } from "@/domain/message/group.types";

vi.mock("@/infrastructure", () => ({
  useCurrentRole: () => ({ currentRole: "BDM" }),
  useEnquiryState: () => ({
    enquiries: {},
    membersByEnquiry: {},
  }),
}));

vi.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => "desktop",
  isMobile: () => false,
}));

describe("EnquiryList - mail-created enquiry tagging", () => {
  const baseProps = {
    enquiries: [],
    selectedId: null,
    selectedChannel: "internal",
    onSelectEnquiry: vi.fn(),
    onSelectChannel: vi.fn(),
    searchQuery: "",
    onSearchChange: vi.fn(),
    channels: [],
    currentPersonaId: "p_bdm_1",
    buyerDMChannels: [],
    sellerDMChannels: [],
    groupChannels: [],
    currentPersona: {
      id: "p_bdm_1",
      displayName: "Amit Kumar",
    },
    currentUser: "u_1",
    selectedThreadId: null,
    onSelectThread: vi.fn(),
    onSelectGroup: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the inline internal-group nudge for mail-created enquiries with no internal group", () => {
    const groupChannels: GroupChannel[] = [
      {
        id: "grp_mail_1",
        name: "Acme Corp - Mail",
        type: "buyer",
        channelKind: "mail",
        status: "active",
        memberIds: ["p_bdm_1"],
        memberPersonaIds: ["p_bdm_1", "p_buyer_1"],
        messages: [],
        createdBy: "p_bdm_1",
        createdAt: new Date(),
        buyerId: "buyer_1",
        buyerPersonaId: "p_buyer_1",
        threads: [
          {
            id: "thread_1",
            groupId: "grp_mail_1",
            rootMessageId: "msg_1",
            enquiryId: "ENQ-2401",
            messages: [],
            replyCount: 0,
            participants: [],
            createdBy: "p_bdm_1",
            createdAt: new Date(),
          },
        ],
      },
    ];

    render(
      <EnquiryList
        {...baseProps}
        groupChannels={groupChannels}
        mailCreatedEnquiryIds={new Set(["ENQ-2401"])}
        onRequestTagInternalGroup={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText("ENQ-2401").closest("button")!);
    expect(screen.getByText("Tag internal group")).toBeInTheDocument();
    expect(screen.queryByText("Acme Corp - Mail")).toBeInTheDocument();
  });

  it("renders the tagged internal group instead of the nudge once the group is attached", () => {
    const groupChannels: GroupChannel[] = [
      {
        id: "grp_mail_1",
        name: "Acme Corp - Mail",
        type: "buyer",
        channelKind: "mail",
        status: "active",
        memberIds: ["p_bdm_1"],
        memberPersonaIds: ["p_bdm_1", "p_buyer_1"],
        messages: [],
        createdBy: "p_bdm_1",
        createdAt: new Date(),
        buyerId: "buyer_1",
        buyerPersonaId: "p_buyer_1",
        threads: [
          {
            id: "thread_1",
            groupId: "grp_mail_1",
            rootMessageId: "msg_1",
            enquiryId: "ENQ-2401",
            messages: [],
            replyCount: 0,
            participants: [],
            createdBy: "p_bdm_1",
            createdAt: new Date(),
          },
        ],
      },
      {
        id: "group_internal_1",
        name: "North Sales Ops",
        type: "custom",
        status: "active",
        memberIds: ["p_bdm_1", "p_cm_1"],
        memberPersonaIds: ["p_bdm_1", "p_cm_1"],
        messages: [],
        createdBy: "p_bdm_1",
        createdAt: new Date(),
        enquiryId: "ENQ-2401",
        threads: [],
      },
    ];

    render(
      <EnquiryList
        {...baseProps}
        groupChannels={groupChannels}
        mailCreatedEnquiryIds={new Set(["ENQ-2401"])}
      />
    );

    fireEvent.click(screen.getByText("ENQ-2401").closest("button")!);
    expect(screen.getByText("North Sales Ops")).toBeInTheDocument();
    expect(screen.queryByText("Internal group")).not.toBeInTheDocument();
    expect(screen.queryByText("Tag internal group")).not.toBeInTheDocument();
  });
});
