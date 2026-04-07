import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { TagInternalGroupModal } from "../TagInternalGroupModal";
import type { GroupChannel } from "@/domain/message/group.types";

describe("TagInternalGroupModal", () => {
  const onClose = vi.fn();
  const onConfirm = vi.fn();

  const groups: GroupChannel[] = [
    {
      id: "group_1",
      name: "North Sales Ops",
      type: "custom",
      status: "active",
      memberIds: ["p_bdm_1", "p_cm_1"],
      memberPersonaIds: ["p_bdm_1", "p_cm_1"],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date(),
      threads: [],
    },
    {
      id: "group_2",
      name: "West Sales Ops",
      type: "custom",
      status: "active",
      memberIds: ["p_bdm_1", "p_cm_2"],
      memberPersonaIds: ["p_bdm_1", "p_cm_2"],
      messages: [],
      createdBy: "p_bdm_1",
      createdAt: new Date(),
      threads: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lets the user choose an internal group and confirm the tag", () => {
    render(
      <TagInternalGroupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        enquiryId="ENQ-2401"
        groups={groups}
      />
    );

    fireEvent.click(screen.getByText("West Sales Ops"));
    fireEvent.click(screen.getByRole("button", { name: "Tag group" }));

    expect(onConfirm).toHaveBeenCalledWith("group_2");
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an empty state when no groups are available", () => {
    render(
      <TagInternalGroupModal
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        enquiryId="ENQ-2401"
        groups={[]}
      />
    );

    expect(screen.getByText("No internal groups available")).toBeInTheDocument();
    expect(screen.getByText(/Create a Birla Pivot group first/i)).toBeInTheDocument();
  });
});
