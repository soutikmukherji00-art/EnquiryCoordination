/**
 * Navigation State Hook
 * 
 * Centralized state manager for all navigation/selection concerns.
 * Replaces scattered useState calls in App.tsx for:
 * - Enquiry selection
 * - Channel selection (DM, Group, Thread)
 * - View modes and UI states
 * 
 * Implements mutually exclusive selection logic:
 * - Selecting an enquiry clears DM/Group/Thread selection
 * - Selecting a DM clears Enquiry/Group/Thread selection
 * - etc.
 */

import { useState, useCallback } from "react";

export type ViewContext = 
  | { type: "enquiry"; enquiryId: string; channel: string }
  | { type: "buyer-dm"; dmId: string }
  | { type: "seller-dm"; dmId: string }
  | { type: "group"; groupId: string }
  | { type: "thread"; threadId: string; groupId: string; mode: "side-panel" | "main" }
  | { type: "none" };

export interface NavigationState {
  // Current view context
  context: ViewContext;
  
  // Enquiry-specific
  selectedEnquiryId: string | null;
  currentChannel: string;
  showAuditTrail: boolean;
  
  // DM-specific
  selectedBuyerDMId: string | null;
  selectedSellerDMId: string | null;
  
  // Group-specific
  selectedGroupId: string | null;
  
  // Thread-specific
  selectedThreadId: string | null;
  threadPanelOpen: boolean;
  threadViewMode: "side-panel" | "main";
  
  // Search
  searchQuery: string;
}

export interface NavigationActions {
  // Selection actions (mutually exclusive)
  selectEnquiry: (enquiryId: string, channel?: string) => void;
  selectBuyerDM: (dmId: string) => void;
  selectSellerDM: (dmId: string) => void;
  selectGroup: (groupId: string) => void;
  selectThread: (threadId: string, groupId: string, mode?: "side-panel" | "main") => void;
  
  // Enquiry actions
  setChannel: (channel: string) => void;
  toggleAuditTrail: () => void;
  
  // Thread actions
  openThread: (threadId: string, groupId: string, mode?: "side-panel" | "main") => void;
  closeThread: () => void;
  
  // Search
  setSearchQuery: (query: string) => void;
  
  // Clear all selections
  clearSelection: () => void;
}

const initialState: NavigationState = {
  context: { type: "none" },
  selectedEnquiryId: null,
  currentChannel: "internal",
  showAuditTrail: false,
  selectedBuyerDMId: null,
  selectedSellerDMId: null,
  selectedGroupId: null,
  selectedThreadId: null,
  threadPanelOpen: false,
  threadViewMode: "side-panel",
  searchQuery: "",
};

export function useNavigationState(): NavigationState & NavigationActions {
  const [state, setState] = useState<NavigationState>(initialState);
  
  // Select enquiry (clears all other selections)
  const selectEnquiry = useCallback((enquiryId: string, channel: string = "internal") => {
    setState(prev => ({
      ...prev,
      context: { type: "enquiry", enquiryId, channel },
      selectedEnquiryId: enquiryId,
      currentChannel: channel,
      selectedBuyerDMId: null,
      selectedSellerDMId: null,
      selectedGroupId: null,
      selectedThreadId: null,
      threadPanelOpen: false,
      showAuditTrail: false,
    }));
  }, []);
  
  // Select buyer DM (clears all other selections)
  const selectBuyerDM = useCallback((dmId: string) => {
    setState(prev => ({
      ...prev,
      context: { type: "buyer-dm", dmId },
      selectedBuyerDMId: dmId,
      selectedEnquiryId: null,
      selectedSellerDMId: null,
      selectedGroupId: null,
      selectedThreadId: null,
      threadPanelOpen: false,
      showAuditTrail: false,
    }));
  }, []);
  
  // Select seller DM (clears all other selections)
  const selectSellerDM = useCallback((dmId: string) => {
    setState(prev => ({
      ...prev,
      context: { type: "seller-dm", dmId },
      selectedSellerDMId: dmId,
      selectedEnquiryId: null,
      selectedBuyerDMId: null,
      selectedGroupId: null,
      selectedThreadId: null,
      threadPanelOpen: false,
      showAuditTrail: false,
    }));
  }, []);
  
  // Select group (clears all other selections)
  const selectGroup = useCallback((groupId: string) => {
    setState(prev => ({
      ...prev,
      context: { type: "group", groupId },
      selectedGroupId: groupId,
      selectedEnquiryId: null,
      selectedBuyerDMId: null,
      selectedSellerDMId: null,
      selectedThreadId: null,
      threadPanelOpen: false,
      showAuditTrail: false,
    }));
  }, []);
  
  // Select thread
  const selectThread = useCallback((threadId: string, groupId: string, mode: "side-panel" | "main" = "main") => {
    setState(prev => ({
      ...prev,
      context: { type: "thread", threadId, groupId, mode },
      selectedThreadId: threadId,
      selectedGroupId: mode === "main" ? null : groupId, // In main mode, group is not the primary selection
      threadPanelOpen: true,
      threadViewMode: mode,
      selectedEnquiryId: null,
      selectedBuyerDMId: null,
      selectedSellerDMId: null,
      showAuditTrail: false,
    }));
  }, []);
  
  // Open thread (keeps current selection, opens thread panel)
  const openThread = useCallback((threadId: string, groupId: string, mode: "side-panel" | "main" = "side-panel") => {
    setState(prev => ({
      ...prev,
      selectedThreadId: threadId,
      threadPanelOpen: true,
      threadViewMode: mode,
    }));
  }, []);
  
  // Close thread (reverts to group view if in side-panel mode)
  const closeThread = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedThreadId: null,
      threadPanelOpen: false,
      // Restore context based on what was selected before
      context: prev.selectedGroupId 
        ? { type: "group", groupId: prev.selectedGroupId }
        : prev.context,
    }));
  }, []);
  
  // Set channel (for enquiry channel switching)
  const setChannel = useCallback((channel: string) => {
    setState(prev => ({
      ...prev,
      currentChannel: channel,
      context: prev.selectedEnquiryId 
        ? { type: "enquiry", enquiryId: prev.selectedEnquiryId, channel }
        : prev.context,
    }));
  }, []);
  
  // Toggle audit trail
  const toggleAuditTrail = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAuditTrail: !prev.showAuditTrail,
    }));
  }, []);
  
  // Set search query
  const setSearchQuery = useCallback((query: string) => {
    setState(prev => ({
      ...prev,
      searchQuery: query,
    }));
  }, []);
  
  // Clear all selections
  const clearSelection = useCallback(() => {
    setState(initialState);
  }, []);
  
  return {
    ...state,
    selectEnquiry,
    selectBuyerDM,
    selectSellerDM,
    selectGroup,
    selectThread,
    setChannel,
    toggleAuditTrail,
    openThread,
    closeThread,
    setSearchQuery,
    clearSelection,
  };
}

/**
 * Utility: Check if a specific view is active
 */
export function isViewActive(state: NavigationState, view: ViewContext["type"]): boolean {
  return state.context.type === view;
}

/**
 * Utility: Get the current primary selection ID
 */
export function getPrimarySelectionId(state: NavigationState): string | null {
  switch (state.context.type) {
    case "enquiry": return state.selectedEnquiryId;
    case "buyer-dm": return state.selectedBuyerDMId;
    case "seller-dm": return state.selectedSellerDMId;
    case "group": return state.selectedGroupId;
    case "thread": return state.selectedThreadId;
    default: return null;
  }
}
