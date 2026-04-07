/**
 * Domain: Audit Reducer
 * 
 * Audit entries are generated automatically from domain events.
 */

import { AuditEntry } from "./audit.types";
import { EnquiryEvent } from "../enquiry/enquiry.events";
import { MessageEvent } from "../message/message.events";
import {
  formatStateChange,
  formatMessageSent,
  formatMessageShared,
  formatSellerChannelCreated,
  formatFanOut,
  formatEnquiryCreated,
  formatEnquiryConverted,
} from "./audit.formatters";

export interface AuditDomainState {
  entries: Record<string, AuditEntry[]>; // enquiryId -> entries
}

export const initialAuditState: AuditDomainState = {
  entries: {},
};

export type AuditableEvent = EnquiryEvent | MessageEvent;

/**
 * Generates audit entries from domain events
 */
export const auditReducer = (
  state: AuditDomainState,
  event: AuditableEvent
): AuditDomainState => {
  let newEntry: AuditEntry | null = null;
  let enquiryId: string | null = null;

  switch (event.type) {
    case "ENQUIRY_CREATED":
      enquiryId = event.payload.enquiryId;
      newEntry = formatEnquiryCreated(event);
      break;

    case "ENQUIRY_REGION_ASSIGNED":
      enquiryId = event.payload.enquiryId;
      newEntry = {
        id: `audit_${Date.now()}_${Math.random()}`,
        type: "system",
        timestamp: event.payload.timestamp,
        content: `Region assigned: ${event.payload.region}`,
        actor: "System",
        actorRole: "System",
      };
      break;

    case "PRIMARY_CM_ASSIGNED":
      enquiryId = event.payload.enquiryId;
      newEntry = {
        id: `audit_${Date.now()}_${Math.random()}`,
        type: "system",
        timestamp: event.payload.timestamp,
        content: `Member ${event.payload.memberId} assigned as primary CM`,
        actor: "System",
        actorRole: "System",
      };
      break;

    case "MEMBER_ADDED":
      enquiryId = event.payload.enquiryId;
      newEntry = {
        id: `audit_${Date.now()}_${Math.random()}`,
        type: "system",
        timestamp: event.payload.timestamp,
        content: `${event.payload.member.role} (${event.payload.member.personaId}) joined enquiry`,
        actor: "System",
        actorRole: "System",
      };
      break;

    case "MEMBER_REMOVED":
      enquiryId = event.payload.enquiryId;
      newEntry = {
        id: `audit_${Date.now()}_${Math.random()}`,
        type: "system",
        timestamp: event.payload.timestamp,
        content: `Member ${event.payload.memberId} removed from enquiry`,
        actor: "System",
        actorRole: "System",
      };
      break;

    case "MEMBER_TAGGED":
      enquiryId = event.payload.enquiryId;
      newEntry = {
        id: `audit_${Date.now()}_${Math.random()}`,
        type: "message",
        timestamp: event.payload.timestamp,
        content: `Tagged ${event.payload.memberId} in message ${event.payload.messageId}`,
        actor: event.payload.taggedByPersonaId,
        actorRole: "Internal",
      };
      break;

    case "MEMBER_ROLE_UPDATED":
      enquiryId = event.payload.enquiryId;
      newEntry = {
        id: `audit_${Date.now()}_${Math.random()}`,
        type: "field_update",
        timestamp: event.payload.timestamp,
        content: `Member ${event.payload.memberId} role changed to ${event.payload.role}`,
        actor: "System",
        actorRole: "System",
        metadata: {
          field: "member_role",
          newValue: event.payload.role,
        },
      };
      break;

    case "ENQUIRY_STATE_CHANGED":
      enquiryId = event.payload.enquiryId;
      newEntry = formatStateChange(event);
      break;

    case "ENQUIRY_CONVERTED":
      enquiryId = event.payload.enquiryId;
      newEntry = formatEnquiryConverted(event);
      break;

    case "MESSAGE_SENT":
      enquiryId = event.payload.enquiryId;
      newEntry = formatMessageSent(event);
      break;

    case "MESSAGE_SHARED":
      enquiryId = event.payload.enquiryId;
      newEntry = formatMessageShared(event);
      break;

    case "SELLER_CHANNEL_CREATED":
      enquiryId = event.payload.enquiryId;
      newEntry = formatSellerChannelCreated(event);
      break;

    case "MESSAGES_FAN_OUT":
      enquiryId = event.payload.enquiryId;
      newEntry = formatFanOut(event);
      break;

    default:
      return state;
  }

  if (!enquiryId || !newEntry) return state;

  const existingEntries = state.entries[enquiryId] || [];

  return {
    ...state,
    entries: {
      ...state.entries,
      [enquiryId]: [...existingEntries, newEntry],
    },
  };
};