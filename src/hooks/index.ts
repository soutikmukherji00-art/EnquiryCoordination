/**
 * Hooks Layer Exports
 * 
 * Central export point for all application hooks.
 */

// Re-export all hooks for easier importing

// Existing hooks
export { useAppStore, AppStoreProvider } from "./useAppStore";
export { useAudit } from "./useAudit";
export { useBuyerDMChannels, useBuyerDMChannel } from "./useBuyerDMChannels";
export { useComposerState } from "./useComposerState";
export { useEnquiries } from "./useEnquiries";
export { useEnquiryCreation } from "./useEnquiryCreation";
export { useMentionDetection } from "./useMentionDetection";
export { useMessages } from "./useMessages";
export { useRole } from "./useRole";
export { useSellerChannels } from "./useSellerChannels";
export { useVoiceMessage } from "./useVoiceMessage";
export { useVoiceRecording } from "./useVoiceRecording";
export { useGroupChannels, useGroupChannelsByStatus, usePendingGroupChannels, useActiveGroupChannels } from "./useGroupChannels";
export { useSellerGroups, useSellerGroup, useSellerGroupsForSeller, useCanCreateSellerGroups } from "./useSellerGroups";

// New optimization hooks
export { useFilteredEnquiries } from "./useFilteredEnquiries";
export { useEnrichedEnquiries } from "./useEnrichedEnquiries";
export { useChannelMessages } from "./useChannelMessages";
export { useEnrichedChannels } from "./useEnrichedChannels";
export { useVisibleChannels } from "./useVisibleChannels";
export { useAppHandlers } from "./useAppHandlers";
export { useAppNavigation } from "./useAppNavigation";
export type { AppNavigationState, NavigationContext } from "./useAppNavigation";
export { useUnifiedMessageHandlers } from "./useUnifiedMessageHandlers";
export type { UnifiedMessageHandlersOptions } from "./useUnifiedMessageHandlers";
export { useMessageHandlers } from "./useMessageHandlers";
export { useSellerHandlers } from "./useSellerHandlers";
export { useEnquiryHandlers } from "./useEnquiryHandlers";

// Share policy hook
export { useSharePolicy } from "./useSharePolicy";
export type { UseSharePolicyOptions, UseSharePolicyReturn } from "./useSharePolicy";

// Responsive hooks
export { useBreakpoint, isMobile, isTablet, isDesktop, isMobileOrTablet } from "./useBreakpoint";
export type { Breakpoint } from "./useBreakpoint";
export { useMobileNavigation } from "./useMobileNavigation";
export type { MobileScreen, ConversationTab, MobileNavigationState, MobileNavigationActions } from "./useMobileNavigation";

// State management orchestration (Phase 1 Refactor)
export { useNavigationState, isViewActive, getPrimarySelectionId } from "./useNavigationState";
export type { ViewContext, NavigationState, NavigationActions } from "./useNavigationState";
export { useModalState, hasOpenModal } from "./useModalState";
export type { ModalState, ModalActions } from "./useModalState";
export { useMobileState } from "./useMobileState";
export type { MobileState, MobileActions } from "./useMobileState";
export { useAppOrchestrator } from "./useAppOrchestrator";
export type { AppOrchestratorState } from "./useAppOrchestrator";