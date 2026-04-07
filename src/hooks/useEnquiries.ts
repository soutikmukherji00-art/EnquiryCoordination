/**
 * Hook: Enquiries
 * 
 * Manages enquiry state and actions.
 */

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAppStore } from "./useAppStore";
import { Enquiry, EnquiryState } from "@/domain/enquiry/enquiry.types";
import { EnquiryEvent } from "@/domain/enquiry/enquiry.events";
import { useEnquiryState, useEnquiryDispatch } from "@/infrastructure/state/EnquiryContext";
import { selectAllEnquiries } from "@/domain/enquiry/enquiry.selectors";

export const useEnquiries = () => {
  const { dataStore, realtimeService } = useAppStore();
  const enquiryState = useEnquiryState();
  const dispatch = useEnquiryDispatch();
  
  // Get enquiries from EnquiryContext (single source of truth)
  const enquiries = useMemo(() => {
    const allEnquiries = selectAllEnquiries(enquiryState);
    return allEnquiries.sort((a, b) => 
      b.lastActivity.getTime() - a.lastActivity.getTime()
    );
  }, [enquiryState]);

  // Actions
  const changeEnquiryState = useCallback(
    async (enquiryId: string, newState: EnquiryState, actor: string, actorRole: string) => {
      const enquiry = enquiries.find((e) => e.id === enquiryId);
      if (!enquiry) return;

      const event: EnquiryEvent = {
        type: "ENQUIRY_STATE_CHANGED",
        payload: {
          enquiryId,
          fromState: enquiry.state,
          toState: newState,
          changedBy: actor,
          changedByRole: actorRole,
          timestamp: new Date(),
        },
      };

      // Dispatch to reducer (updates context)
      dispatch(event);
      
      // Also persist to dataStore and realtime
      await dataStore.appendEvent(event);
      await realtimeService.publish(event);
    },
    [dataStore, realtimeService, enquiries, dispatch]
  );

  const convertEnquiry = useCallback(
    async (enquiryId: string, actor: string, actorRole: string) => {
      const event: EnquiryEvent = {
        type: "ENQUIRY_CONVERTED",
        payload: {
          enquiryId,
          convertedBy: actor,
          convertedByRole: actorRole,
          timestamp: new Date(),
        },
      };

      // Dispatch to reducer (updates context)
      dispatch(event);
      
      // Also persist to dataStore and realtime
      await dataStore.appendEvent(event);
      await realtimeService.publish(event);
    },
    [dataStore, realtimeService, dispatch]
  );

  return {
    enquiries,
    loading: false, // No async loading needed - data comes from context
    changeEnquiryState,
    convertEnquiry,
    reload: () => {}, // No-op - context updates automatically
  };
};

// Helper to check if event is enquiry event
function isEnquiryEvent(event: any): event is EnquiryEvent {
  return [
    "ENQUIRY_CREATED",
    "ENQUIRY_STATE_CHANGED",
    "ENQUIRY_CONVERTED",
    "ENQUIRY_PARTICIPANT_ADDED",
  ].includes(event.type);
}