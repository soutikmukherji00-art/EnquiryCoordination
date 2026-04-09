import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { AppShellHeader } from "../AppShellHeader";
import type { Persona } from "@/domain/enquiry/enquiry.types";

describe("AppShellHeader", () => {
  const currentPersona = {
    id: "p_bdm_1",
    userId: "u_101",
    displayName: "Amit Kumar",
    role: "BDM",
    isExternal: false,
  } as Persona;

  it("renders the black app bar branding without the old projects chip", () => {
    render(
      <AppShellHeader
        currentPersona={currentPersona}
        onPersonaChange={vi.fn()}
        isSidebarOpen={true}
        onSidebarToggle={vi.fn()}
      />
    );

    expect(screen.getByTestId("app-shell-header")).toHaveClass("bg-[#1f2126]");
    expect(screen.getByText("Birla Pivot")).toBeInTheDocument();
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
  });

  it("uses the button beside Birla Pivot as the sidebar toggle", () => {
    const onSidebarToggle = vi.fn();

    render(
      <AppShellHeader
        currentPersona={currentPersona}
        onPersonaChange={vi.fn()}
        isSidebarOpen={false}
        onSidebarToggle={onSidebarToggle}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Expand navigation" }));

    expect(onSidebarToggle).toHaveBeenCalledTimes(1);
  });
});
