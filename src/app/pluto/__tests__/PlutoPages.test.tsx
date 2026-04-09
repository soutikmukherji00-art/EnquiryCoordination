import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { PlutoEnquiryDetailPage } from "../PlutoEnquiryDetailPage";
import { PlutoEnquiryListPage } from "../PlutoEnquiryListPage";
import type {
  PlutoDetailHeaderViewModel,
  PlutoKpiCardViewModel,
  PlutoListItemViewModel,
  PlutoRoleScreenConfig,
} from "../pluto.types";

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
        header={detailHeader}
        roleConfig={roleConfig}
        canManageMembers={true}
        canChangeState={true}
        canShareMessages={true}
        onBack={vi.fn()}
      />,
    );

    expect(screen.getByText("Ramesh Industries")).toBeInTheDocument();
    expect(screen.queryByText("Enquiry preview")).not.toBeInTheDocument();
    expect(screen.queryByText(/Pluto is reading the same enquiry record/i)).not.toBeInTheDocument();
    expect(screen.queryByText("State-aware")).not.toBeInTheDocument();
    expect(screen.queryByText("Sync contract")).not.toBeInTheDocument();
    expect(screen.queryByText(/Structured Pluto fields will render here/i)).not.toBeInTheDocument();
    expect(screen.getByText("Supply strategy")).toBeInTheDocument();
  });
});
