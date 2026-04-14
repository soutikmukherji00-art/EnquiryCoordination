export type WorkspaceMode = "prism" | "pluto" | "rfq";

export type PlutoPage =
  | "enquiry-list"
  | "enquiry-detail"
  | "create-detailed-rfq"
  | "enquiry-chat"
  | "order-summary";

export interface PlutoNavigationState {
  page: PlutoPage;
  selectedEnquiryId: string | null;
}

export interface WorkspaceNavigationState {
  workspaceMode: WorkspaceMode;
  pluto: PlutoNavigationState;
}
