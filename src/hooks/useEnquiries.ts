/**
 * Hook: Enquiries
 * 
 * Manages enquiry state and actions.
 */

import { useCallback, useMemo } from "react";
import { useAppStore } from "./useAppStore";
import { EnquiryState } from "@/domain/enquiry/enquiry.types";
import { EnquiryEvent } from "@/domain/enquiry/enquiry.events";
import { canPerformTransition, canConvertToOrder, normalizeEnquiryState } from "@/domain/enquiry/enquiry.state-machine";
import { useEnquiryState } from "@/infrastructure/state/EnquiryContext";
import { selectAllEnquiries } from "@/domain/enquiry/enquiry.selectors";

export const useEnquiries = () => {
  const { dataStore, realtimeService } = useAppStore();
  const enquiryState = useEnquiryState();
  
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
      const fromState = normalizeEnquiryState(enquiry.state);
      const toState = normalizeEnquiryState(newState);
      if (fromState === toState) return;

      const eventByTransition = (() => {
        if (fromState === "Unassigned" && toState === "Draft") return "RESET_TO_DRAFT" as const;
        if (fromState === "Draft" && toState === "Awaiting Response") return "SUBMIT_REQUIREMENT" as const;
        if (fromState === "Awaiting Response" && toState === "CM Responded") return "SUBMIT_RESPONSE" as const;
        if (fromState === "CM Responded" && toState === "RM Approved") return "MARK_AS_WON" as const;
        if (fromState === "RM Approved" && toState === "Draft") return "RESET_TO_DRAFT" as const;
        if (fromState === "Awaiting Response" && toState === "Draft") return "RESET_TO_DRAFT" as const;
        if (fromState === "CM Responded" && toState === "Draft") return "RESET_TO_DRAFT" as const;
        return null;
      })();
      if (!eventByTransition) return;
      if (!canPerformTransition({
        enquiryState: fromState,
        userRole: actorRole as any,
        event: eventByTransition,
      })) {
        return;
      }

      const event: EnquiryEvent = {
        type: "ENQUIRY_STATE_CHANGED",
        payload: {
          enquiryId,
          fromState,
          toState,
          changedBy: actor,
          changedByRole: actorRole,
          timestamp: new Date(),
        },
      };

      await dataStore.appendEvent(event);
      await realtimeService.publish(event);
    },
    [dataStore, realtimeService, enquiries]
  );

  const convertEnquiry = useCallback(
    async (enquiryId: string, actor: string, actorRole: string) => {
      const enquiry = enquiries.find((e) => e.id === enquiryId);
      if (!enquiry) return;
      const currentState = normalizeEnquiryState(enquiry.state);
      if (!canConvertToOrder(currentState)) return;
      if (!canPerformTransition({
        enquiryState: currentState,
        userRole: actorRole as any,
        event: "CM_CONFIRM_ORDER",
      })) {
        return;
      }

      const event: EnquiryEvent = {
        type: "ENQUIRY_CONVERTED",
        payload: {
          enquiryId,
          convertedBy: actor,
          convertedByRole: actorRole,
          timestamp: new Date(),
        },
      };

      await dataStore.appendEvent(event);
      await realtimeService.publish(event);
    },
    [dataStore, realtimeService, enquiries]
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