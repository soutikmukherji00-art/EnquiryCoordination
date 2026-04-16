import { useCallback, useState } from "react";
import type {
  PlutoNavigationState,
  WorkspaceMode,
  WorkspaceNavigationState,
} from "@/app/workspace.types";

interface GoToPlutoListOptions {
  selectedEnquiryId?: string | null;
}

interface OpenDetailedRFQCreationOptions {
  selectedEnquiryId?: string | null;
}

export interface WorkspaceNavigationActions {
  setWorkspaceMode: (mode: WorkspaceMode) => void;
  goToPlutoList: (options?: GoToPlutoListOptions) => void;
  openPlutoEnquiry: (enquiryId: string) => void;
  openDetailedRFQCreation: (options?: OpenDetailedRFQCreationOptions) => void;
  clearPlutoSelection: () => void;
  openPlutoEnquiryChat: (enquiryId: string) => void;
  openPlutoOrderSummary: (enquiryId: string) => void;
  openPlutoBdmMarkWon: (enquiryId: string) => void;
  openPlutoDirectOrderOcr: () => void;
  openPlutoDirectOrderCmPreview: () => void;
  openPlutoDirectOrderCmReview: () => void;
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

  const openDetailedRFQCreation = useCallback((options?: OpenDetailedRFQCreationOptions) => {
    setPluto({
      page: "create-detailed-rfq",
      selectedEnquiryId: options?.selectedEnquiryId ?? null,
    });
  }, []);

  const clearPlutoSelection = useCallback(() => {
    setPluto(initialPlutoNavigationState);
  }, []);

  const openPlutoEnquiryChat = useCallback((enquiryId: string) => {
    setPluto({
      page: "enquiry-chat",
      selectedEnquiryId: enquiryId,
    });
  }, []);

  const openPlutoOrderSummary = useCallback((enquiryId: string) => {
    setPluto({
      page: "order-summary",
      selectedEnquiryId: enquiryId,
    });
  }, []);

  const openPlutoBdmMarkWon = useCallback((enquiryId: string) => {
    setPluto({
      page: "bdm-mark-won",
      selectedEnquiryId: enquiryId,
    });
  }, []);

  const openPlutoDirectOrderOcr = useCallback(() => {
    setPluto({
      page: "direct-order-ocr",
      selectedEnquiryId: null,
    });
  }, []);

  const openPlutoDirectOrderCmPreview = useCallback(() => {
    setPluto({
      page: "cm-enquiry-preview",
      selectedEnquiryId: null,
    });
  }, []);

  const openPlutoDirectOrderCmReview = useCallback(() => {
    setPluto({
      page: "cm-review-order-summary",
      selectedEnquiryId: null,
    });
  }, []);

  return {
    workspaceMode,
    pluto,
    setWorkspaceMode,
    goToPlutoList,
    openPlutoEnquiry,
    openDetailedRFQCreation,
    clearPlutoSelection,
    openPlutoEnquiryChat,
    openPlutoOrderSummary,
    openPlutoBdmMarkWon,
    openPlutoDirectOrderOcr,
    openPlutoDirectOrderCmPreview,
    openPlutoDirectOrderCmReview,
  };
}
