import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useWorkspaceNavigation } from "../useWorkspaceNavigation";

describe("useWorkspaceNavigation", () => {
  it("initializes in Prism with Pluto on the enquiry list page", () => {
    const { result } = renderHook(() => useWorkspaceNavigation());

    expect(result.current.workspaceMode).toBe("prism");
    expect(result.current.pluto).toEqual({
      page: "enquiry-list",
      selectedEnquiryId: null,
    });
  });

  it("switches workspaces without resetting Pluto navigation state", () => {
    const { result } = renderHook(() => useWorkspaceNavigation());

    act(() => {
      result.current.openPlutoEnquiry("ENQ-2402");
      result.current.setWorkspaceMode("pluto");
    });

    expect(result.current.workspaceMode).toBe("pluto");
    expect(result.current.pluto).toEqual({
      page: "enquiry-detail",
      selectedEnquiryId: "ENQ-2402",
    });

    act(() => {
      result.current.setWorkspaceMode("prism");
    });

    expect(result.current.workspaceMode).toBe("prism");
    expect(result.current.pluto.selectedEnquiryId).toBe("ENQ-2402");
  });

  it("opens a Pluto enquiry detail and keeps the selection when going back to list", () => {
    const { result } = renderHook(() => useWorkspaceNavigation());

    act(() => {
      result.current.openPlutoEnquiry("ENQ-2404");
    });

    expect(result.current.pluto).toEqual({
      page: "enquiry-detail",
      selectedEnquiryId: "ENQ-2404",
    });

    act(() => {
      result.current.goToPlutoList();
    });

    expect(result.current.pluto).toEqual({
      page: "enquiry-list",
      selectedEnquiryId: "ENQ-2404",
    });
  });

  it("can clear Pluto selection explicitly", () => {
    const { result } = renderHook(() => useWorkspaceNavigation());

    act(() => {
      result.current.openPlutoEnquiry("ENQ-2405");
      result.current.clearPlutoSelection();
    });

    expect(result.current.pluto).toEqual({
      page: "enquiry-list",
      selectedEnquiryId: null,
    });
  });
});
