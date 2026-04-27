import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlutoEnquiryDetailPage } from "../PlutoEnquiryDetailPage";
import { PLUTO_BUYER_CONTACT_SEARCH_EMPTY_MESSAGE, PlutoEnquiryListPage } from "../PlutoEnquiryListPage";
import { PlutoEnquiryChatPage } from "../PlutoEnquiryChatPage";
import { PlutoWorkspace } from "../PlutoWorkspace";
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
  ThreadPanel: ({
    thread,
    groupName,
    onProceedToOrderSelectionChange,
  }: {
    thread: Thread;
    groupName: string;
    onProceedToOrderSelectionChange?: (selection: {
      enquiryId: string;
      sourceMessages: Message[];
      winMarksByMessageId: Record<string, { po: boolean; buyerConfirmation: boolean }>;
    } | null) => void;
  }) => (
    <div data-testid={`thread-panel-${groupName}`}>
      {groupName}:{thread.messages.length}
      <button
        type="button"
        onClick={() =>
          onProceedToOrderSelectionChange?.({
            enquiryId: thread.enquiryId ?? "ENQ-2401",
            sourceMessages: thread.messages,
            winMarksByMessageId: Object.fromEntries(
              thread.messages.map((message) => [
                message.id,
                { po: Boolean(message.attachment), buyerConfirmation: message.content.trim().length > 0 },
              ]),
            ),
          })
        }
      >
        Mock select messages
      </button>
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
    hasMissingBuyerIdentity: false,
    buyerEmails: ["ramesh.patel@rameshindustries.com"],
    buyerPhones: ["919876543210"],
    hasAssignedBdm: true,
    status: "RM Approved",
    stateTone: "accent",
    ageLabel: "4 days",
    lastActivityLabel: "1 day ago",
    lastActivityTime: new Date("2026-04-08T09:00:00Z").getTime(),
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
    hasMissingBuyerIdentity: false,
    buyerEmails: ["vikram.malhotra@globalmfg.com"],
    buyerPhones: ["919876543213"],
    hasAssignedBdm: true,
    status: "Converted to Order",
    stateTone: "success",
    ageLabel: "2 days",
    lastActivityLabel: "2 hours ago",
    lastActivityTime: new Date("2026-04-06T09:00:00Z").getTime(),
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
  hasMissingBuyerIdentity: false,
  status: "RM Approved",
  stateTone: "accent",
  assignedCMName: "Priya Sharma",
  valueLabel: "₹75,000",
  categoriesLabel: "Steel",
  createdAtLabel: "4 days ago",
  lastActivityLabel: "1 day ago",
};

describe("Pluto pages", () => {
  it("sorts list by latest activity by default", () => {
    render(
      <PlutoEnquiryListPage
        items={listItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    const enquiryRows = screen.getAllByRole("button").filter((element) =>
      /ENQ-240\d/.test(element.textContent ?? ""),
    );

    expect(enquiryRows[0]).toHaveTextContent("ENQ-2401");
    expect(enquiryRows[1]).toHaveTextContent("ENQ-2402");
  });

  it("pins draft request enquiries to bottom in default status view", () => {
    const mixedItems: PlutoListItemViewModel[] = [
      {
        ...listItems[0],
        id: "ENQ-2414",
        status: "Draft Request",
        hasAssignedBdm: false,
        lastActivityTime: new Date("2026-04-10T09:00:00Z").getTime(),
      },
      {
        ...listItems[1],
        id: "ENQ-2415",
        status: "Draft Request",
        hasAssignedBdm: false,
        lastActivityTime: new Date("2026-04-09T09:00:00Z").getTime(),
      },
      {
        ...listItems[0],
        id: "ENQ-2416",
        status: "Draft",
        hasAssignedBdm: true,
        lastActivityTime: new Date("2026-04-08T09:00:00Z").getTime(),
      },
    ];

    render(
      <PlutoEnquiryListPage
        items={mixedItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    const enquiryRows = screen.getAllByRole("button").filter((element) =>
      /ENQ-241\d/.test(element.textContent ?? ""),
    );
    expect(enquiryRows[0]).toHaveTextContent("ENQ-2416");
    expect(enquiryRows[1]).toHaveTextContent("ENQ-2414");
    expect(enquiryRows[2]).toHaveTextContent("ENQ-2415");
  });

  it("shows front-card three-dot assign action for unassigned enquiries", async () => {
    const onSelectEnquiry = vi.fn();
    const onReassignPrimaryBdm = vi.fn().mockResolvedValue(undefined);
    const mixedItems: PlutoListItemViewModel[] = [
      {
        ...listItems[0],
        id: "ENQ-2414",
        hasAssignedBdm: false,
        status: "Draft Request",
      },
      {
        ...listItems[1],
        id: "ENQ-2415",
        hasAssignedBdm: true,
      },
    ];

    render(
      <PlutoEnquiryListPage
        items={mixedItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={onSelectEnquiry}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
        canManageMembers
        onReassignPrimaryBdm={onReassignPrimaryBdm}
        currentPersonaId="p_bdm_1"
        currentPersonaRole="BDM"
      />,
    );

    const unassignedMenuTrigger = screen.getByRole("button", {
      name: "More actions for ENQ-2414",
    });
    fireEvent.pointerDown(unassignedMenuTrigger, { button: 0, pointerId: 1, bubbles: true });
    const menu = await waitFor(() => screen.getByRole("menu"));
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Assign to me" }));

    await waitFor(() =>
      expect(onReassignPrimaryBdm).toHaveBeenCalledWith("ENQ-2414", "p_bdm_1"),
    );
    expect(onSelectEnquiry).not.toHaveBeenCalled();
    expect(
      screen.queryByRole("button", { name: "More actions for ENQ-2415" }),
    ).not.toBeInTheDocument();
  });

  it("does not show front-card assign action when user is ineligible", () => {
    render(
      <PlutoEnquiryListPage
        items={[
          {
            ...listItems[0],
            id: "ENQ-2416",
            hasAssignedBdm: false,
            status: "Draft Request",
          },
        ]}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
        canManageMembers={false}
        onReassignPrimaryBdm={vi.fn()}
        currentPersonaId="p_cm_1"
        currentPersonaRole="CM"
      />,
    );

    expect(
      screen.queryByRole("button", { name: "More actions for ENQ-2416" }),
    ).not.toBeInTheDocument();
  });

  it("renders dash buyer label in list items for unidentified buyers", () => {
    render(
      <PlutoEnquiryListPage
        items={[
          {
            ...listItems[0],
            id: "ENQ-2499",
            buyerName: "—",
            hasMissingBuyerIdentity: true,
          },
        ]}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByText(/unknown buyer/i)).not.toBeInTheDocument();
  });

  it("removes prototype copy from the list page", () => {
    render(
      <PlutoEnquiryListPage
        items={listItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
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
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
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

  it("filters by exact buyer email and number via search criteria", () => {
    render(
      <PlutoEnquiryListPage
        items={listItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    const searchCriteriaSelect = screen.getByRole("combobox", { name: "Search Criteria" });
    fireEvent.click(searchCriteriaSelect);
    fireEvent.click(screen.getByRole("option", { name: "Buyer Email ID" }));
    fireEvent.change(screen.getByPlaceholderText("Type 3 letters"), {
      target: { value: "VIKRAM.MALHOTRA@GLOBALMFG.COM" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(screen.queryByText("Ramesh Industries")).not.toBeInTheDocument();
    expect(screen.getByText("Global Manufacturing Ltd")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    fireEvent.click(screen.getByRole("combobox", { name: "Search Criteria" }));
    fireEvent.click(screen.getByRole("option", { name: "Buyer Contact Number" }));
    fireEvent.change(screen.getByPlaceholderText("Type 3 letters"), {
      target: { value: "+91 98765 43210" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(screen.getByText("Ramesh Industries")).toBeInTheDocument();
    expect(screen.queryByText("Global Manufacturing Ltd")).not.toBeInTheDocument();
    expect(screen.queryByText("Buyer Contact")).not.toBeInTheDocument();
  });

  it("shows no-results empty state for buyer email search with no match", () => {
    render(
      <PlutoEnquiryListPage
        items={listItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Search Criteria" }));
    fireEvent.click(screen.getByRole("option", { name: "Buyer Email ID" }));
    fireEvent.change(screen.getByPlaceholderText("Type 3 letters"), {
      target: { value: "no.match@nomail.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(screen.getByText(PLUTO_BUYER_CONTACT_SEARCH_EMPTY_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText("No results found")).not.toBeInTheDocument();
    expect(screen.queryByText("Try a different search term or clear filters.")).not.toBeInTheDocument();
    expect(screen.queryByText(roleConfig.emptyStateTitle)).not.toBeInTheDocument();
  });

  it("shows buyer-contact empty state for buyer number search with no match", () => {
    render(
      <PlutoEnquiryListPage
        items={listItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Search Criteria" }));
    fireEvent.click(screen.getByRole("option", { name: "Buyer Contact Number" }));
    fireEvent.change(screen.getByPlaceholderText("Type 3 letters"), {
      target: { value: "+91 99999 99999" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(screen.getByText(PLUTO_BUYER_CONTACT_SEARCH_EMPTY_MESSAGE)).toBeInTheDocument();
    expect(screen.queryByText("No results found")).not.toBeInTheDocument();
    expect(screen.queryByText(roleConfig.emptyStateTitle)).not.toBeInTheDocument();
  });

  it("shows default role empty state when list is empty without active filters", () => {
    render(
      <PlutoEnquiryListPage
        items={[]}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    expect(screen.getByText(roleConfig.emptyStateTitle)).toBeInTheDocument();
    expect(screen.queryByText("No results found")).not.toBeInTheDocument();
  });

  it("applies moved filters from Additional Filters drawer", () => {
    render(
      <PlutoEnquiryListPage
        items={listItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    expect(screen.getByRole("button", { name: "Additional Filters" })).toBeInTheDocument();
    expect(screen.queryByText("Sort")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Additional Filters" }));

    fireEvent.click(screen.getByRole("combobox", { name: "Category" }));
    fireEvent.click(screen.getByRole("option", { name: "Polymer" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.queryByText("Ramesh Industries")).not.toBeInTheDocument();
    expect(screen.getByText("Global Manufacturing Ltd")).toBeInTheDocument();
  });

  it("supports Draft Request status and assignment gap filters", () => {
    const draftRequestItems: PlutoListItemViewModel[] = [
      {
        ...listItems[0],
        id: "ENQ-2414",
        buyerName: "Ramesh Industries",
        status: "Draft Request",
        hasAssignedBdm: false,
      },
      {
        ...listItems[1],
        id: "ENQ-2415",
        buyerName: "Buyer not tagged",
        hasMissingBuyerIdentity: true,
        status: "Draft Request",
        hasAssignedBdm: true,
      },
      {
        ...listItems[1],
        id: "ENQ-2416",
        buyerName: "Global Manufacturing Ltd",
        status: "Draft",
        hasAssignedBdm: true,
        hasMissingBuyerIdentity: false,
      },
    ];

    render(
      <PlutoEnquiryListPage
        items={draftRequestItems}
        selectedEnquiryId={null}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
      />,
    );

    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "Draft Request" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(screen.getByText("ENQ-2414", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("ENQ-2415", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText("ENQ-2416", { exact: false })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Additional Filters" }));
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Additional Filters" })).getByRole("button", {
        name: "Assignment Gap",
      }),
    );
    fireEvent.click(screen.getByLabelText("Unassigned BDM"));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(screen.getByText("ENQ-2414", { exact: false })).toBeInTheDocument();
    expect(screen.queryByText("ENQ-2415", { exact: false })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    fireEvent.click(screen.getByRole("button", { name: "Additional Filters" }));
    fireEvent.click(
      within(screen.getByRole("dialog", { name: "Additional Filters" })).getByRole("button", {
        name: "Assignment Gap",
      }),
    );
    fireEvent.click(screen.getByLabelText("Unassigned Buyer"));
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));
    fireEvent.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.getByText("ENQ-2414", { exact: false })).toBeInTheDocument();
    expect(screen.getByText("ENQ-2415", { exact: false })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reset" }));
    fireEvent.click(screen.getByRole("combobox", { name: "Status" }));
    fireEvent.click(screen.getByRole("option", { name: "Draft" }));
    fireEvent.click(screen.getByRole("button", { name: "Apply Filters" }));

    expect(screen.queryByText("ENQ-2414", { exact: false })).not.toBeInTheDocument();
    expect(screen.queryByText("ENQ-2415", { exact: false })).not.toBeInTheDocument();
    expect(screen.getByText("ENQ-2416", { exact: false })).toBeInTheDocument();
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
      assignment: { bdmPersonaId: "p_bdm_1" },
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
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getAllByText("Please quote.")).toHaveLength(2);
    expect(screen.queryByText("Internal notes")).not.toBeInTheDocument();
    expect(screen.queryByText("Requirement intelligence")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Proceed$/ })).toBeInTheDocument();
    const headerProceed = screen.getByRole("button", { name: /^Proceed$/ });
    fireEvent.pointerDown(headerProceed, { button: 0, pointerId: 1, bubbles: true });
    const menu = await waitFor(() => screen.getByRole("menu"));
    expect(menu).toBeInTheDocument();
    const menuItems = within(menu).getAllByRole("menuitem");
    expect(menuItems[0]).toHaveTextContent(/Quick RFQ/i);
    expect(menuItems[1]).toHaveTextContent(/Detailed RFQ/i);
    expect(menuItems[2]).toHaveTextContent(/Direct Order/i);
    fireEvent.click(within(menu).getByRole("menuitem", { name: /Detailed RFQ/i }));
    expect(onDetailed).toHaveBeenCalled();
  });

  it("keeps preview visible for unidentified buyers from mail and whatsapp", () => {
    const mailRecord: EnquiryRecord = {
      enquiryId: "ENQ-2501",
      createdAt: new Date("2026-04-08T10:42:00+05:30"),
      origin: "mail_intake",
      buyer: { name: "Unknown buyer" },
      requirements: { categories: ["Steel"], notes: "Mail fallback notes." },
      assignment: { bdmPersonaId: "p_bdm_1" },
      sourceCorrespondence: {
        kind: "email",
        subject: "RFQ pipes",
        from: "buyer@example.com",
        to: "inbox@example.com",
        receivedAt: "Tue, 8 Apr 2026 10:42:00 +0530",
        body: "Please quote.",
      },
    };
    const { rerender } = render(
      <PlutoEnquiryDetailPage
        enquiryId="ENQ-2501"
        header={{
          ...detailHeader,
          id: "ENQ-2501",
          buyerName: "—",
        }}
        roleConfig={roleConfig}
        canManageMembers={true}
        canChangeState={true}
        canShareMessages={true}
        onBack={vi.fn()}
        showBackButton
        record={mailRecord}
      />,
    );

    expect(screen.getByRole("heading", { name: "—" })).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getAllByText("Please quote.")).toHaveLength(2);

    const whatsappRecord: EnquiryRecord = {
      enquiryId: "ENQ-2502",
      createdAt: new Date("2026-04-08T10:42:00+05:30"),
      origin: "whatsapp_intake",
      buyer: { name: "Unassigned buyer" },
      requirements: { categories: ["Steel"], notes: "Need 10 MT by Friday." },
      assignment: { bdmPersonaId: "p_bdm_1" },
    };
    rerender(
      <PlutoEnquiryDetailPage
        enquiryId="ENQ-2502"
        header={{
          ...detailHeader,
          id: "ENQ-2502",
          buyerName: "—",
        }}
        roleConfig={roleConfig}
        canManageMembers={true}
        canChangeState={true}
        canShareMessages={true}
        onBack={vi.fn()}
        showBackButton
        record={whatsappRecord}
      />,
    );

    expect(screen.getByRole("heading", { name: "—" })).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(screen.getAllByText("Need 10 MT by Friday.")).toHaveLength(2);
  });

  it("shows empty notes state when preview body text is unavailable", () => {
    const recordWithoutBody: EnquiryRecord = {
      enquiryId: "ENQ-2600",
      createdAt: new Date("2026-04-08T10:42:00+05:30"),
      origin: "mail_intake",
      buyer: { name: "Global Manufacturing Ltd" },
      requirements: { categories: ["Steel"], notes: "" },
      assignment: { bdmPersonaId: "p_bdm_1" },
      sourceCorrespondence: {
        kind: "email",
        subject: "RFQ pipes",
        from: "buyer@example.com",
        to: "inbox@example.com",
        receivedAt: "Tue, 8 Apr 2026 10:42:00 +0530",
        body: "",
      },
    };

    render(
      <PlutoEnquiryDetailPage
        enquiryId="ENQ-2600"
        header={{
          ...detailHeader,
          id: "ENQ-2600",
          buyerName: "Global Manufacturing Ltd",
        }}
        roleConfig={roleConfig}
        canManageMembers={true}
        canChangeState={true}
        canShareMessages={true}
        onBack={vi.fn()}
        showBackButton
        record={recordWithoutBody}
      />,
    );

    expect(screen.getByText("No notes available for this enquiry.")).toBeInTheDocument();
  });

  it("shows Assign to me for unassigned BDM enquiries and hides it once assigned", async () => {
    const onReassignPrimaryBdm = vi.fn().mockResolvedValue(undefined);
    const unassignedRecord: EnquiryRecord = {
      enquiryId: "ENQ-2402",
      createdAt: new Date("2026-04-08T10:42:00+05:30"),
      origin: "mail_intake",
      buyer: { name: "Global Manufacturing Ltd" },
      requirements: { categories: ["Steel"], notes: "Short summary." },
      assignment: {},
    };

    const { rerender } = render(
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
        record={unassignedRecord}
        onReassignPrimaryBdm={onReassignPrimaryBdm}
        bdmOptions={[
          { id: "p_bdm_1", name: "Amit Kumar" },
          { id: "p_bdm_2", name: "Priya Singh" },
        ]}
        currentPersonaId="p_bdm_1"
        currentPersonaRole="BDM"
      />,
    );

    expect(screen.queryByRole("button", { name: /^Proceed$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "More actions" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Assign to me" }));
    await waitFor(() =>
      expect(onReassignPrimaryBdm).toHaveBeenCalledWith("ENQ-2402", "p_bdm_1"),
    );

    rerender(
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
        record={{
          ...unassignedRecord,
          assignment: { bdmPersonaId: "p_bdm_2" },
        }}
        onReassignPrimaryBdm={onReassignPrimaryBdm}
        bdmOptions={[
          { id: "p_bdm_1", name: "Amit Kumar" },
          { id: "p_bdm_2", name: "Priya Singh" },
        ]}
        currentPersonaId="p_bdm_1"
        currentPersonaRole="BDM"
      />,
    );

    expect(screen.queryByRole("button", { name: "Assign to me" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Proceed$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "More actions" })).toBeInTheDocument();
  });

  it("shows Assign to me when record is missing and fallback says unassigned", async () => {
    const onReassignPrimaryBdm = vi.fn().mockResolvedValue(undefined);
    const { rerender } = render(
      <PlutoEnquiryDetailPage
        enquiryId="ENQ-2414"
        header={{
          ...detailHeader,
          id: "ENQ-2414",
          buyerName: "Ramesh Industries",
          status: "Draft Request",
        }}
        roleConfig={roleConfig}
        canManageMembers={true}
        canChangeState={true}
        canShareMessages={true}
        onBack={vi.fn()}
        showBackButton
        record={undefined}
        hasAssignedBdm={false}
        onReassignPrimaryBdm={onReassignPrimaryBdm}
        bdmOptions={[
          { id: "p_bdm_1", name: "Amit Kumar" },
          { id: "p_bdm_2", name: "Priya Singh" },
        ]}
        currentPersonaId="p_bdm_1"
        currentPersonaRole="BDM"
      />,
    );

    expect(screen.getByRole("button", { name: "Assign to me" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Proceed$/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Assign to me" }));
    await waitFor(() =>
      expect(onReassignPrimaryBdm).toHaveBeenCalledWith("ENQ-2414", "p_bdm_1"),
    );

    rerender(
      <PlutoEnquiryDetailPage
        enquiryId="ENQ-2414"
        header={{
          ...detailHeader,
          id: "ENQ-2414",
          buyerName: "Ramesh Industries",
          status: "Draft",
        }}
        roleConfig={roleConfig}
        canManageMembers={true}
        canChangeState={true}
        canShareMessages={true}
        onBack={vi.fn()}
        showBackButton
        record={undefined}
        hasAssignedBdm={true}
        onReassignPrimaryBdm={onReassignPrimaryBdm}
        bdmOptions={[
          { id: "p_bdm_1", name: "Amit Kumar" },
          { id: "p_bdm_2", name: "Priya Singh" },
        ]}
        currentPersonaId="p_bdm_1"
        currentPersonaRole="BDM"
      />,
    );

    expect(screen.queryByRole("button", { name: "Assign to me" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Proceed$/ })).toBeInTheDocument();
  });

  it("hides Proceed and reassign menu when enquiry is unassigned", () => {
    const unassignedRecord: EnquiryRecord = {
      enquiryId: "ENQ-2402",
      createdAt: new Date("2026-04-08T10:42:00+05:30"),
      origin: "mail_intake",
      buyer: { name: "Global Manufacturing Ltd" },
      requirements: { categories: ["Steel"], notes: "Short summary." },
      assignment: {},
    };

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
        record={unassignedRecord}
        onReassignPrimaryBdm={vi.fn()}
        bdmOptions={[{ id: "p_bdm_1", name: "Amit Kumar" }]}
      />,
    );

    expect(screen.queryByRole("button", { name: /^Proceed$/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "More actions" })).not.toBeInTheDocument();
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

  it("keeps proceed to order disabled until messages are selected", () => {
    mockIsMobileView = false;
    const onProceedToOrderSelection = vi.fn();
    const message: Message = {
      id: "m1",
      type: "user",
      content: "Buyer confirmed the order.",
      timestamp: new Date(),
    };
    const thread: Thread = {
      id: "thread-3",
      groupId: "g-internal",
      rootMessageId: "root-3",
      enquiryId: "ENQ-2403",
      title: "Thread",
      messages: [message],
      replyCount: 1,
      participants: ["p_bdm"],
      createdBy: "p_bdm",
      createdAt: new Date(),
    };

    render(
      <PlutoEnquiryChatPage
        enquiryId="ENQ-2403"
        thread={thread}
        selectedThreadId="thread-3"
        rootMessage={message}
        groupName="Grp Internal Cement"
        groupId="g-internal"
        enquiryThreads={[
          { threadId: "thread-3", groupId: "g-internal", groupName: "Grp Internal Cement", unreadCount: 0, mentionCount: 0 },
        ]}
        currentPersonaId="p_bdm"
        currentUser="bdm@ecs.test"
        currentRole="BDM"
        personaMap={new Map()}
        onSendReply={vi.fn()}
        record={undefined}
        summary="Summary"
        onDispatchEvent={vi.fn()}
        onBack={vi.fn()}
        approvalAction={{
          label: "Proceed to Order",
          onClick: vi.fn(),
        }}
        onProceedToOrderSelection={onProceedToOrderSelection}
        enquiryData={{
          enquiryId: "ENQ-2403",
          buyerName: "Global Manufacturing Ltd",
          state: "CM Responded",
          estimatedValue: 99000,
          categories: ["Cement"],
        }}
      />,
    );

    const proceedButton = screen.getByRole("button", { name: "Proceed to Order" });
    expect(proceedButton).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Mock select messages" }));

    expect(proceedButton).toBeEnabled();
    fireEvent.click(proceedButton);

    expect(onProceedToOrderSelection).toHaveBeenCalledWith(
      "ENQ-2403",
      [message],
      { m1: { po: false, buyerConfirmation: true } },
    );
  });

  it("shows inline buyer tag card in chat and triggers tagging callback", async () => {
    mockIsMobileView = false;
    const onTagBuyerForQuickRfq = vi.fn().mockResolvedValue(undefined);
    const message: Message = {
      id: "m-tag-1",
      type: "user",
      content: "Please quote quickly.",
      timestamp: new Date(),
    };
    const thread: Thread = {
      id: "thread-tag-1",
      groupId: "g-internal",
      rootMessageId: "root-tag-1",
      enquiryId: "ENQ-2416",
      title: "Thread",
      messages: [message],
      replyCount: 1,
      participants: ["p_bdm"],
      createdBy: "p_bdm",
      createdAt: new Date(),
    };

    render(
      <PlutoEnquiryChatPage
        enquiryId="ENQ-2416"
        thread={thread}
        selectedThreadId="thread-tag-1"
        rootMessage={message}
        groupName="Grp Internal Steel"
        groupId="g-internal"
        enquiryThreads={[
          { threadId: "thread-tag-1", groupId: "g-internal", groupName: "Grp Internal Steel", unreadCount: 0, mentionCount: 0 },
        ]}
        currentPersonaId="p_bdm"
        currentUser="bdm@ecs.test"
        currentRole="BDM"
        personaMap={new Map()}
        onSendReply={vi.fn()}
        record={undefined}
        summary="Summary"
        onDispatchEvent={vi.fn()}
        onBack={vi.fn()}
        hasMissingBuyerIdentity
        buyerOptions={[
          { id: "buyer_1", name: "Ramesh Industries" },
          { id: "buyer_2", name: "Global Manufacturing Ltd" },
        ]}
        onTagBuyerForQuickRfq={onTagBuyerForQuickRfq}
      />,
    );

    expect(
      screen.getByText("Buyer is not tagged for this enquiry. Tag a buyer to create Quick RFQ threads."),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByRole("option", { name: "Ramesh Industries" }));
    fireEvent.click(screen.getByRole("button", { name: "Tag Buyer" }));

    await waitFor(() =>
      expect(onTagBuyerForQuickRfq).toHaveBeenCalledWith("ENQ-2416", "buyer_1"),
    );
  });

  it("does not show buyer tag nudge in no-thread setup state", () => {
    const onTagBuyerForQuickRfq = vi.fn().mockResolvedValue(undefined);

    render(
      <PlutoEnquiryChatPage
        enquiryId="ENQ-2416"
        thread={null}
        selectedThreadId={null}
        rootMessage={undefined}
        groupName="Enquiry Chat"
        groupId=""
        enquiryThreads={[]}
        currentPersonaId="p_bdm"
        currentUser="bdm@ecs.test"
        currentRole="BDM"
        personaMap={new Map()}
        onSendReply={vi.fn()}
        record={undefined}
        summary="Summary"
        onDispatchEvent={vi.fn()}
        onBack={vi.fn()}
        hasMissingBuyerIdentity
        buyerOptions={[
          { id: "buyer_1", name: "Ramesh Industries" },
          { id: "buyer_2", name: "Global Manufacturing Ltd" },
        ]}
        onTagBuyerForQuickRfq={onTagBuyerForQuickRfq}
      />,
    );

    expect(screen.getByText("Setting up conversation")).toBeInTheDocument();
    expect(
      screen.queryByText("Buyer is not tagged for this enquiry. Tag a buyer to create Quick RFQ threads."),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Tag Buyer" })).not.toBeInTheDocument();
  });

  it("keeps proceed to order disabled by default in Pluto workspace chat", () => {
    const message: Message = {
      id: "m1",
      type: "user",
      content: "Buyer confirmed the order.",
      timestamp: new Date(),
    };
    const thread: Thread = {
      id: "thread-3",
      groupId: "g-internal",
      rootMessageId: "root-3",
      enquiryId: "ENQ-2403",
      title: "Thread",
      messages: [message],
      replyCount: 1,
      participants: ["p_bdm"],
      createdBy: "p_bdm",
      createdAt: new Date(),
    };

    render(
      <PlutoWorkspace
        navigation={{ page: "enquiry-chat", selectedEnquiryId: "ENQ-2403" } as any}
        listItems={listItems}
        detailHeader={null}
        roleConfig={roleConfig}
        kpiCards={kpiCards}
        searchQuery=""
        onSearchChange={vi.fn()}
        onSelectEnquiry={vi.fn()}
        onBackToList={vi.fn()}
        onCreatePlaceholder={vi.fn()}
        onOpenDetailedRFQCreation={vi.fn()}
        onFabDirectOrder={vi.fn()}
        plutoDirectOrderFlow={{
          summaryData: {
            rfqNumber: "",
            buyerCompanyName: "",
            shipToAddress: "",
            unloadingScope: "",
            expectedDeliveryDate: "",
            lineItems: [],
            amountSummary: {
              subtotal: 0,
              taxesTotal: 0,
              freight: 0,
              grandTotal: 0,
            },
            paymentTerms: "",
            deliveryTerms: "",
            attachments: [],
            assignedCmId: "",
            requestorPersonaId: "",
            notes: "",
          },
          cmOptions: [],
          assignedCmName: "",
          ocrBackButtonLabel: "Back",
          onOcrBack: vi.fn(),
          onMarkAsWon: vi.fn(),
          onCmPreviewBack: vi.fn(),
          onCmPreviewReview: vi.fn(),
          onCmReviewBack: vi.fn(),
          onEditLineItems: vi.fn(),
          onAssignSeller: vi.fn(),
        }}
        onCreateDetailedRFQ={vi.fn()}
        onBackFromOrderSummary={vi.fn()}
        onUpdateOrderSummaryRecord={vi.fn()}
        onConfirmForOrderFromSummary={vi.fn()}
        canManageMembers={true}
        canChangeState={true}
        canShareMessages={true}
        currentPersonaId="p_bdm"
        currentPersonaRole="BDM"
        enquiryChatProps={{
          enquiryId: "ENQ-2403",
          thread,
          selectedThreadId: "thread-3",
          rootMessage: message,
          groupName: "Grp Internal Cement",
          groupId: "g-internal",
          currentPersonaId: "p_bdm",
          currentUser: "bdm@ecs.test",
          currentRole: "BDM",
          personaMap: new Map(),
          onSendReply: vi.fn(),
          approvalAction: {
            label: "Proceed to Order",
            onClick: vi.fn(),
          },
          onProceedToOrderSelection: vi.fn(),
          enquiryData: {
            enquiryId: "ENQ-2403",
            buyerName: "Global Manufacturing Ltd",
            state: "CM Responded",
            estimatedValue: 99000,
            categories: ["Cement"],
          },
          record: undefined,
          summary: "",
          onDispatchEvent: vi.fn(),
        }}
      />,
    );

    const proceedButton = screen.getByRole("button", { name: "Proceed to Order" });
    expect(proceedButton).toBeDisabled();
  });
});
