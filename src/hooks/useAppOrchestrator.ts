/**
 * App Orchestrator Hook
 * 
 * Top-level orchestration hook that combines all state managers
 * and provides a unified interface for App.tsx.
 * 
 * This hook consolidates:
 * - Navigation state (selection, routing, view context)
 * - Modal state (dialogs, sheets, widgets)
 * - Mobile state (mobile-specific UI)
 * 
 * Use this as the single source of truth for App.tsx state management.
 */

import { useNavigationState, type ViewContext } from "./useNavigationState";
import { useModalState } from "./useModalState";
import { useMobileState } from "./useMobileState";

export interface AppOrchestratorState {
  // Navigation
  navigation: ReturnType<typeof useNavigationState>;
  
  // Modals
  modals: ReturnType<typeof useModalState>;
  
  // Mobile
  mobile: ReturnType<typeof useMobileState>;
  
  // Computed properties
  currentView: ViewContext;
  isPrimaryViewActive: boolean;
}

/**
 * Main App Orchestrator Hook
 * 
 * Combines all specialized state managers into a single interface.
 * Use this instead of managing state directly in App.tsx.
 * 
 * @example
 * ```tsx
 * function App() {
 *   const app = useAppOrchestrator();
 *   
 *   // Navigation
 *   app.navigation.selectEnquiry('ENQ-1234');
 *   
 *   // Modals
 *   app.modals.openGroupModal();
 *   
 *   // Mobile
 *   app.mobile.setMobileComposer(<Composer />);
 * }
 * ```
 */
export function useAppOrchestrator(): AppOrchestratorState {
  const navigation = useNavigationState();
  const modals = useModalState();
  const mobile = useMobileState();
  
  // Computed: Is any primary view active?
  const isPrimaryViewActive = 
    navigation.selectedEnquiryId !== null ||
    navigation.selectedBuyerDMId !== null ||
    navigation.selectedSellerDMId !== null ||
    navigation.selectedGroupId !== null ||
    (navigation.threadPanelOpen && navigation.threadViewMode === "main");
  
  return {
    navigation,
    modals,
    mobile,
    currentView: navigation.context,
    isPrimaryViewActive,
  };
}

/**
 * Re-export types for convenience
 */
export type {
  ViewContext,
  NavigationState,
  NavigationActions,
} from "./useNavigationState";

export type {
  ModalState,
  ModalActions,
} from "./useModalState";

export type {
  MobileState,
  MobileActions,
} from "./useMobileState";
