import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
      />
    );

    expect(screen.getByTestId("app-shell-header")).toHaveClass("bg-[#1f2126]");
    expect(screen.getByText("Birla Pivot")).toBeInTheDocument();
    expect(screen.queryByText("Projects")).not.toBeInTheDocument();
  });
});
