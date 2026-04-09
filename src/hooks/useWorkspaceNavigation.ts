import { useCallback, useState } from "react";
import type {
  PlutoNavigationState,
  WorkspaceMode,
  WorkspaceNavigationState,
} from "@/app/workspace.types";

interface GoToPlutoListOptions {
  selectedEnquiryId?: string | null;
}

export interface WorkspaceNavigationActions {
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  goToPlutoList: (options?: GoToPlutoListOptions) => void;
  openPlutoEnquiry: (enquiryId: string) => void;
  clearPlutoSelection: () => void;
}

const initialPlutoNavigationState: PlutoNavigationState = {
  page: "enquiry-list",
  selectedEnquiryId: null,
};

export function useWorkspaceNavigation(
  initialWorkspaceMode: WorkspaceMode = "prism",
): WorkspaceNavigationState & WorkspaceNavigationActions {
  const [workspaceMode, setWorkspaceModeState] =
    useState<WorkspaceMode>(initialWorkspaceMode);
  const [pluto, setPluto] = useState<PlutoNavigationState>(
    initialPlutoNavigationState,
  );

  const setWorkspaceMode = useCallback((mode: WorkspaceMode) => {
    setWorkspaceModeState(mode);
  }, []);

  const goToPlutoList = useCallback((options?: GoToPlutoListOptions) => {
    setPluto((previous) => ({
      page: "enquiry-list",
      selectedEnquiryId:
        options && "selectedEnquiryId" in options
          ? options.selectedEnquiryId ?? null
          : previous.selectedEnquiryId,
    }));
  }, []);

  const openPlutoEnquiry = useCallback((enquiryId: string) => {
    setPluto({
      page: "enquiry-detail",
      selectedEnquiryId: enquiryId,
    });
  }, []);

  const clearPlutoSelection = useCallback(() => {
    setPluto(initialPlutoNavigationState);
  }, []);

  return {
    workspaceMode,
    pluto,
    setWorkspaceMode,
    goToPlutoList,
    openPlutoEnquiry,
    clearPlutoSelection,
  };
}
