export type WorkspaceMode = "prism" | "pluto";

export type PlutoPage = "enquiry-list" | "enquiry-detail" | "create-detailed-rfq" | "enquiry-chat";

export interface PlutoNavigationState {
  page: PlutoPage;
  selectedEnquiryId: string | null;
}

export interface WorkspaceNavigationState {
  workspaceMode: WorkspaceMode;
  pluto: PlutoNavigationState;
}
