/**
 * Infrastructure: Enquiry Context
 * 
 * React context provider for enquiry state management.
 * Subscribes to realtime events to keep all roles in sync.
 */

import * as React from "react";
import { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from "react";
import {
  EnquiryStateStore,
  enquiryReducer,
  initialEnquiryState,
} from "@/domain/enquiry/enquiry.reducer";
import { EnquiryEvent } from "@/domain/enquiry/enquiry.events";
import * as selectors from "@/domain/enquiry/enquiry.selectors";
import { Role } from "@/domain/enquiry/enquiry.types";
import { RealtimeService } from "@/infrastructure/realtime/realtime.interface";

/**
 * Context value type
 */
interface EnquiryContextValue {
  // State
  state: EnquiryStateStore;
  
  // Dispatch
  dispatch: (event: EnquiryEvent) => void;
  
  // Selectors (bound to current state)
  selectors: typeof selectors;
}

/**
 * Context
 */
const EnquiryContext = createContext<EnquiryContextValue | undefined>(undefined);

/**
 * Provider Props
 */
interface EnquiryProviderProps {
  children: React.ReactNode;
  initialState?: EnquiryStateStore;
  realtimeService: RealtimeService;
}

/**
 * Provider Component
 */
export function EnquiryProvider({ children, initialState, realtimeService }: EnquiryProviderProps) {
  const [state, dispatch] = useReducer(
    enquiryReducer,
    initialState || initialEnquiryState
  );

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<EnquiryContextValue>(
    () => ({ state, dispatch, selectors }),
    [state]
  );

  // Subscribe to all realtime events to keep state in sync across roles
  useEffect(() => {
    const unsubscribe = realtimeService.subscribeAll((event) => {
      // Only dispatch enquiry events
      if (isEnquiryEvent(event)) {
        dispatch(event);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [realtimeService]);

  return (
    <EnquiryContext.Provider value={contextValue}>
      {children}
    </EnquiryContext.Provider>
  );
}

/**
 * Optimized event type checker using Set for O(1) lookup
 */
const ENQUIRY_EVENT_TYPES = new Set([
  "ENQUIRY_CREATED",
  "ENQUIRY_REGION_ASSIGNED",
  "PRIMARY_CM_ASSIGNED",
  "MEMBER_ADDED",
  "MEMBER_REMOVED",
  "MEMBER_TAGGED",
  "MEMBER_ROLE_UPDATED",
  "ENQUIRY_STATE_CHANGED",
  "ENQUIRY_CONVERTED",
  "ENQUIRY_VIEWED",
]);

// Helper to check if event is an enquiry event
function isEnquiryEvent(event: any): event is EnquiryEvent {
  return ENQUIRY_EVENT_TYPES.has(event.type);
}

/**
 * Hook to access enquiry context
 */
export function useEnquiryContext() {
  const context = useContext(EnquiryContext);
  if (!context) {
    throw new Error("useEnquiryContext must be used within EnquiryProvider");
  }
  return context;
}

/**
 * Hook to access enquiry state
 */
export function useEnquiryState() {
  const { state } = useEnquiryContext();
  return state;
}

/**
 * Hook to dispatch enquiry events
 */
export function useEnquiryDispatch() {
  const { dispatch } = useEnquiryContext();
  return dispatch;
}

/**
 * Hook to access selectors with current state bound
 */
export function useEnquirySelectors() {
  const { state, selectors } = useEnquiryContext();
  
  return {
    selectEnquiry: useCallback(
      (enquiryId: string) => selectors.selectEnquiry(state, enquiryId),
      [state]
    ),
    selectAllEnquiries: useCallback(
      () => selectors.selectAllEnquiries(state),
      [state]
    ),
    selectMembers: useCallback(
      (enquiryId: string) => selectors.selectMembers(state, enquiryId),
      [state]
    ),
    selectPrimaryCM: useCallback(
      (enquiryId: string) => selectors.selectPrimaryCM(state, enquiryId),
      [state]
    ),
    selectVisibleMembers: useCallback(
      (enquiryId: string, viewerRole: Role) => 
        selectors.selectVisibleMembers(state, enquiryId, viewerRole),
      [state]
    ),
    selectMembersByRole: useCallback(
      (enquiryId: string, role: Role) => 
        selectors.selectMembersByRole(state, enquiryId, role),
      [state]
    ),
    selectSellerParticipants: useCallback(
      (enquiryId: string) => selectors.selectSellerParticipants(state, enquiryId),
      [state]
    ),
    selectCMParticipants: useCallback(
      (enquiryId: string) => selectors.selectCMParticipants(state, enquiryId),
      [state]
    ),
    selectIsMember: useCallback(
      (enquiryId: string, personaId: string) => 
        selectors.selectIsMember(state, enquiryId, personaId),
      [state]
    ),
    selectMemberByPersonaId: useCallback(
      (enquiryId: string, personaId: string) => 
        selectors.selectMemberByPersonaId(state, enquiryId, personaId),
      [state]
    ),
    selectMemberCount: useCallback(
      (enquiryId: string) => selectors.selectMemberCount(state, enquiryId),
      [state]
    ),
    selectCanConvert: useCallback(
      (enquiryId: string) => selectors.selectCanConvert(state, enquiryId),
      [state]
    ),
    selectEnquiriesByState: useCallback(
      (filterState: string) => selectors.selectEnquiriesByState(state, filterState),
      [state]
    ),
    selectEnquiriesSortedByActivity: useCallback(
      () => selectors.selectEnquiriesSortedByActivity(state),
      [state]
    ),
    selectEnquiriesForPersona: useCallback(
      (personaId: string) => selectors.selectEnquiriesForPersona(state, personaId),
      [state]
    ),
  };
}

/**
 * Hook for specific enquiry (commonly used pattern)
 */
export function useEnquiry(enquiryId: string) {
  const { state } = useEnquiryContext();
  const enquiry = selectors.selectEnquiry(state, enquiryId);
  const members = selectors.selectMembers(state, enquiryId);
  const primaryCM = selectors.selectPrimaryCM(state, enquiryId);
  const canConvert = selectors.selectCanConvert(state, enquiryId);
  
  return {
    enquiry,
    members,
    primaryCM,
    canConvert,
  };
}

/**
 * Hook for enquiry members with visibility filtering
 */
export function useEnquiryMembers(enquiryId: string, viewerRole: Role) {
  const { state } = useEnquiryContext();
  const allMembers = selectors.selectMembers(state, enquiryId);
  const visibleMembers = selectors.selectVisibleMembers(state, enquiryId, viewerRole);
  const primaryCM = selectors.selectPrimaryCM(state, enquiryId);
  const memberCount = selectors.selectMemberCount(state, enquiryId);
  
  return {
    allMembers,
    visibleMembers,
    primaryCM,
    memberCount,
  };
}