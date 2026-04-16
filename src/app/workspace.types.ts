export type WorkspaceMode = "prism" | "pluto" | "rfq";

export type PlutoPage =
  | "enquiry-list"
  | "enquiry-detail"
  | "create-detailed-rfq"
  | "enquiry-chat"
  | "order-summary"
  /** BDM review step before RM Approved (win signals / prefills) */
  | "bdm-mark-won"
  /** Standalone direct order (Buyer PO / OCR) under Pluto — enquiry stage, not RFQ workspace */
  | "direct-order-ocr"
  | "cm-enquiry-preview"
  | "cm-review-order-summary";

export interface PlutoNavigationState {
  page: PlutoPage;
  selectedEnquiryId: string | null;
}

export interface WorkspaceNavigationState {
  workspaceMode: WorkspaceMode;
  pluto: PlutoNavigationState;
}
