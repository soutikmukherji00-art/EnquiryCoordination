import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlutoEnquiryDetailPage } from "../PlutoEnquiryDetailPage";
import { PlutoEnquiryListPage } from "../PlutoEnquiryListPage";
import { PlutoEnquiryChatPage } from "../PlutoEnquiryChatPage";
import type { Message } from "@/domain/message/message.types";
import type { Thread } from "@/domain/message/thread.types";
import type {
  PlutoDetailHeaderViewModel,
  PlutoKpiCardViewModel,
  PlutoListItemViewModel,
  PlutoRoleScreenConfig,
} from "../pluto.types";
import type { EnquiryRecord } from "@/domain/enquiry/enquiry.record";

let mockIsMobileView = false;

vi.mock("@/hooks/useBreakpoint", () => ({
  useBreakpoint: () => "desktop",
  isMobile: () => mockIsMobileView,
}));

vi.mock("@/app/components/ThreadPanel", () => ({
  ThreadPanel: ({ thread, groupName }: { thread: Thread; groupName: string }) => (
    <div data-testid={`thread-panel-${groupName}`}>
      {groupName}:{thread.messages.length}
    </div>
  ),
}));

vi.mock("@/app/components/StructuredPanel", () => ({
  StructuredPanel: () => <div data-testid="structured-panel">Structured data panel</div>,
}));

const roleConfig: PlutoRoleScreenConfig = {
  role: "CM",
  emptyStateTitle: "Pick an enquiry",
  sections: [
    {
      id: "sourcing-plan",
      title: "Sourcing Plan",
      fields: ["Supply strategy", "Target sellers"],
    },
  ],
};

const listItems: PlutoListItemViewModel[] = [
  {
    id: "ENQ-2401",
    buyerName: "Ramesh Industries",
    status: "Pending Response",
    stateTone: "accent",
    ageLabel: "4 days",
    lastActivityLabel: "1 day ago",
    createdAtTime: new Date("2026-04-05T09:00:00Z").getTime(),
    assignedCMName: "Priya Sharma",
    valueLabel: "₹75,000",
    categoriesLabel: "Steel",
    regionLabel: "North",
    isNew: true,
    sourceBadge: "Email",
    unreadCount: 3,
    mentionCount: 1,
  },
  {
    id: "ENQ-2402",
    buyerName: "Global Manufacturing Ltd",
    status: "Converted to Order",
    stateTone: "success",
    ageLabel: "2 days",
    lastActivityLabel: "2 hours ago",
    createdAtTime: new Date("2026-04-07T09:00:00Z").getTime(),
    assignedCMName: "Meera Iyer",
    valueLabel: "₹1,20,000",
    categoriesLabel: "Polymer",
    regionLabel: "South",
    isNew: false,
    sourceBadge: "WhatsApp",
    unreadCount: 0,
    mentionCount: 0,
  },
];

const kpiCards: PlutoKpiCardViewModel[] = [
  { id: "total", label: "Total", value: "2", tone: "accent" },
  { id: "converted", label: "Converted", value: "1", tone: "success" },
];

const detailHeader: PlutoDetailHeaderViewModel = {
  id: "ENQ-2401",
  buyerName: "Ramesh Industries",
  status: "Pending Response",
  stateTone: "accent",
  assignedCMName: "Priya Sharma",
  valueLabel: "₹75,000",
  categoriesLabel: "Steel",
  createdAtLabel: "4 days ago",
  lastActivityLabel: "1 day ago",
};

describe("Pluto pages", () => {
  it("removes prototype copy from the list page", () => {
    render(
      <PlutoEnquiryListPage
        items={listItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    expect(screen.getByText("Enquiries")).toBeInTheDocument();
    expect(screen.queryByText("Pluto")).not.toBeInTheDocument();
    expect(screen.queryByText("Visible in Pluto")).not.toBeInTheDocument();
    expect(screen.queryByText("Still being coordinated")).not.toBeInTheDocument();
    expect(screen.queryByText("Preview")).not.toBeInTheDocument();
    expect(screen.queryByText("Assigned CM:")).not.toBeInTheDocument();
  });

  it("applies search filters only after apply and clears them on reset", () => {
    const onSearchChange = vi.fn();

    render(
      <PlutoEnquiryListPage
        items={listItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={onSearchChange}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Type 3 letters"), {
      target: { value: "Global" },
    });

    expect(screen.getByText("Ramesh Industries")).toBeInTheDocument();
    expect(screen.getByText("Global Manufacturing Ltd")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(onSearchChange).toHaveBeenCalledWith("Global");
    expect(screen.queryByText("Ramesh Industries")).not.toBeInTheDocument();
    expect(screen.getByText("Global Manufacturing Ltd")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    expect(onSearchChange).toHaveBeenLastCalledWith("");
    expect(screen.getByText("Ramesh Industries")).toBeInTheDocument();
    expect(screen.getByText("Global Manufacturing Ltd")).toBeInTheDocument();
  });

  it("keeps the detail page minimal and removes explanatory copy", () => {
    render(
      <PlutoEnquiryDetailPage
        enquiryId="ENQ-2401"
        header={detailHeader}
        roleConfig={roleConfig}
        canManageMembers={true}
        canChangeState={true}
        canShareMessages={true}
        onBack={vi.fn()}
        showBackButton
      />,
    );

    expect(screen.getByRole("heading", { name: "Ramesh Industries" })).toBeInTheDocument();
    expect(screen.queryByText("Enquiry preview")).not.toBeInTheDocument();
    expect(screen.queryByText(/Pluto is reading the same enquiry record/i)).not.toBeInTheDocument();
    expect(screen.queryByText("State-aware")).not.toBeInTheDocument();
    expect(screen.queryByText("Sync contract")).not.toBeInTheDocument();
    expect(screen.queryByText(/Structured Pluto fields will render here/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Respond to Enquiry")).not.toBeInTheDocument();
    expect(screen.queryByText("Enquiry content")).not.toBeInTheDocument();
    expect(screen.queryByText("Internal notes")).not.toBeInTheDocument();
    expect(screen.queryByText("Requirement intelligence")).not.toBeInTheDocument();
  });

  it("mail-origin enquiry shows Proceed and opens the three-method chooser", async () => {
    const mailRecord: EnquiryRecord = {
      enquiryId: "ENQ-2402",
      createdAt: new Date("2026-04-08T10:42:00+05:30"),
      origin: "mail_intake",
      buyer: { name: "Global Manufacturing Ltd" },
      requirements: { categories: ["Steel"], notes: "Short summary." },
      assignment: {},
      sourceCorrespondence: {
        kind: "email",
        subject: "RFQ pipes",
        from: "buyer@example.com",
        to: "inbox@example.com",
        receivedAt: "Tue, 8 Apr 2026 10:42:00 +0530",
        body: "Please quote.",
      },
    };

    const onDetailed = vi.fn();
    render(
      <PlutoEnquiryDetailPage
        enquiryId="ENQ-2402"
        header={{
          ...detailHeader,
          id: "ENQ-2402",
          buyerName: "Global Manufacturing Ltd",
        }}
        roleConfig={roleConfig}
        canManageMembers={true}
        canChangeState={true}
        canShareMessages={true}
        onBack={vi.fn()}
        showBackButton
        record={mailRecord}
        onOpenDetailedRFQCreation={onDetailed}
      />,
    );

    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.queryByText("Internal notes")).not.toBeInTheDocument();
    expect(screen.queryByText("Requirement intelligence")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Proceed$/ })).toBeInTheDocument();
    const headerProceed = screen.getByRole("button", { name: /^Proceed$/ });
    fireEvent.pointerDown(headerProceed, { button: 0, pointerId: 1, bubbles: true });
    const menu = await waitFor(() => screen.getByRole("menu"));
    expect(menu).toBeInTheDocument();
    fireEvent.click(within(menu).getByRole("menuitem", { name: /Detailed RFQ/i }));
    expect(onDetailed).toHaveBeenCalled();
  });

  it("renders channel tabs and switches thread content without reloading page shell", () => {
    mockIsMobileView = false;
    const onSelectEnquiryThread = vi.fn();
    const baseMessage = (id: string): Message => ({
      id,
      type: "user",
      content: `message-${id}`,
      timestamp: new Date(),
    });
    const thread: Thread = {
      id: "thread-1",
      groupId: "g-internal",
      rootMessageId: "root-1",
      enquiryId: "ENQ-2401",
      title: "Thread",
      messages: [baseMessage("m1"), baseMessage("m2")],
      replyCount: 2,
      participants: ["p_cm"],
      createdBy: "p_cm",
      createdAt: new Date(),
    };

    render(
      <PlutoEnquiryChatPage
        enquiryId="ENQ-2401"
        thread={thread}
        selectedThreadId="thread-1"
        rootMessage={baseMessage("root-1")}
        groupName="Grp Internal Steel"
        groupId="g-internal"
        enquiryThreads={[
          { threadId: "thread-1", groupId: "g-internal", groupName: "Grp Internal Steel", unreadCount: 0, mentionCount: 0 },
          { threadId: "thread-2", groupId: "g-buyer", groupName: "Grp Buyer B1 Whatsapp", unreadCount: 2, mentionCount: 1 },
        ]}
        onSelectEnquiryThread={onSelectEnquiryThread}
        currentPersonaId="p_cm"
        currentUser="cm@ecs.test"
        currentRole="CM"
        personaMap={new Map()}
        onSendReply={vi.fn()}
        record={undefined}
        summary="Summary"
        onDispatchEvent={vi.fn()}
        onBack={vi.fn()}
        enquiryData={{
          enquiryId: "ENQ-2401",
          buyerName: "Ramesh Industries",
          state: "Active",
          estimatedValue: 75000,
          categories: ["Steel"],
        }}
        messagesByChannel={{
          buyer: [baseMessage("b1")],
          internal: [baseMessage("i1"), baseMessage("i2")],
        }}
      />,
    );

    expect(screen.getByText("Grp Internal Steel")).toBeInTheDocument();
    expect(screen.getByText("Grp Buyer B1 Whatsapp")).toBeInTheDocument();
    expect(screen.getAllByText("Ramesh Industries")).toHaveLength(1);

    fireEvent.click(screen.getByRole("button", { name: /Grp Buyer B1 Whatsapp/i }));
    expect(onSelectEnquiryThread).toHaveBeenCalledWith("thread-2", "g-buyer");

    fireEvent.click(screen.getByRole("button", { name: /Grp Internal Steel/i }));
    expect(screen.getByTestId("thread-panel-Grp Internal Steel")).toHaveTextContent("Grp Internal Steel:2");
  });

  it("shows chat/details toggle in mobile mode", () => {
    mockIsMobileView = true;
    const message: Message = {
      id: "m1",
      type: "user",
      content: "hello",
      timestamp: new Date(),
    };
    const thread: Thread = {
      id: "thread-2",
      groupId: "g-internal",
      rootMessageId: "root-2",
      enquiryId: "ENQ-2402",
      title: "Thread",
      messages: [message],
      replyCount: 1,
      participants: ["p_cm"],
      createdBy: "p_cm",
      createdAt: new Date(),
    };

    render(
      <PlutoEnquiryChatPage
        enquiryId="ENQ-2402"
        thread={thread}
        selectedThreadId="thread-2"
        rootMessage={message}
        groupName="Grp Internal Steel"
        groupId="g-internal"
        enquiryThreads={[
          { threadId: "thread-2", groupId: "g-internal", groupName: "Grp Internal Steel", unreadCount: 0, mentionCount: 0 },
        ]}
        currentPersonaId="p_cm"
        currentUser="cm@ecs.test"
        currentRole="CM"
        personaMap={new Map()}
        onSendReply={vi.fn()}
        record={undefined}
        summary="Summary"
        onDispatchEvent={vi.fn()}
        onBack={vi.fn()}
        enquiryData={{
          enquiryId: "ENQ-2402",
          buyerName: "Global Manufacturing Ltd",
          state: "Active",
          estimatedValue: 120000,
          categories: ["Polymer"],
        }}
      />,
    );

    expect(screen.getByRole("button", { name: "Chat" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Details" }));
    expect(screen.getByTestId("structured-panel")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Chat" }));
    expect(screen.getByTestId("thread-panel-Grp Internal Steel")).toBeInTheDocument();
    mockIsMobileView = false;
  });
});
