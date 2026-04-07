/**
 * Domain: Enquiry Events
 * 
 * All state changes to enquiries are expressed as domain events.
 * Events are the single source of truth for what happened.
 * Membership changes are explicit events.
 */

import { EnquiryState, Role, Member } from "./enquiry.types";

/**
 * Union type of all enquiry events
 */
export type EnquiryEvent =
  | EnquiryCreatedEvent
  | EnquiryRegionAssignedEvent
  | PrimaryCMAssignedEvent
  | MemberAddedEvent
  | MemberRemovedEvent
  | MemberTaggedEvent
  | MemberRoleUpdatedEvent
  | EnquiryStateChangedEvent
  | EnquiryConvertedEvent
  | EnquiryViewedEvent;

/**
 * ENQUIRY_CREATED
 * Creates enquiry and adds creator as first member
 */
export interface EnquiryCreatedEvent {
  type: "ENQUIRY_CREATED";
  payload: {
    enquiryId: string;
    createdByPersonaId: string;
    region?: string;
    timestamp: Date;
    // Legacy fields for compatibility
    buyerName?: string;
    createdBy?: string;
    createdByRole?: string;
    buyerPersonaId?: string; // NEW: Add buyerPersonaId parameter
  };
}

/**
 * ENQUIRY_REGION_ASSIGNED
 * Sets region and triggers CM auto-assignment logic
 */
export interface EnquiryRegionAssignedEvent {
  type: "ENQUIRY_REGION_ASSIGNED";
  payload: {
    enquiryId: string;
    region: string;
    timestamp: Date;
  };
}

/**
 * PRIMARY_CM_ASSIGNED
 * Sets primary CM for enquiry (only one allowed)
 */
export interface PrimaryCMAssignedEvent {
  type: "PRIMARY_CM_ASSIGNED";
  payload: {
    enquiryId: string;
    memberId: string; // Member.id of the CM
    timestamp: Date;
  };
}

/**
 * MEMBER_ADDED
 * Adds a member to enquiry
 */
export interface MemberAddedEvent {
  type: "MEMBER_ADDED";
  payload: {
    enquiryId: string;
    member: Member;
    timestamp: Date;
  };
}

/**
 * MEMBER_REMOVED
 * Removes a member from enquiry
 */
export interface MemberRemovedEvent {
  type: "MEMBER_REMOVED";
  payload: {
    enquiryId: string;
    memberId: string;
    timestamp: Date;
  };
}

/**
 * MEMBER_TAGGED
 * Emits audit event only, no state mutation
 */
export interface MemberTaggedEvent {
  type: "MEMBER_TAGGED";
  payload: {
    enquiryId: string;
    memberId: string;
    taggedByPersonaId: string;
    messageId: string;
    timestamp: Date;
  };
}

/**
 * MEMBER_ROLE_UPDATED
 * Updates member role and revalidates primary CM constraints
 */
export interface MemberRoleUpdatedEvent {
  type: "MEMBER_ROLE_UPDATED";
  payload: {
    enquiryId: string;
    memberId: string;
    role: Role;
    timestamp: Date;
  };
}

/**
 * ENQUIRY_STATE_CHANGED
 * Legacy event for state transitions
 */
export interface EnquiryStateChangedEvent {
  type: "ENQUIRY_STATE_CHANGED";
  payload: {
    enquiryId: string;
    fromState: EnquiryState;
    toState: EnquiryState;
    changedBy: string;
    changedByRole: string;
    timestamp: Date;
  };
}

/**
 * ENQUIRY_CONVERTED
 * Legacy event for order conversion
 */
export interface EnquiryConvertedEvent {
  type: "ENQUIRY_CONVERTED";
  payload: {
    enquiryId: string;
    convertedBy: string;
    convertedByRole: string;
    timestamp: Date;
  };
}

/**
 * ENQUIRY_VIEWED
 * Event to track when an enquiry is viewed
 */
export interface EnquiryViewedEvent {
  type: "ENQUIRY_VIEWED";
  payload: {
    enquiryId: string;
    viewedByPersonaId: string;
    timestamp: Date;
  };
}

/**
 * Event creators
 */
export const createEnquiryCreatedEvent = (
  enquiryId: string,
  createdByPersonaId: string,
  region?: string,
  buyerName?: string,
  buyerPersonaId?: string // NEW: Add buyerPersonaId parameter
): EnquiryCreatedEvent => ({
  type: "ENQUIRY_CREATED",
  payload: {
    enquiryId,
    createdByPersonaId,
    region,
    buyerName,
    buyerPersonaId, // NEW: Include in payload
    timestamp: new Date(),
  },
});

export const createEnquiryRegionAssignedEvent = (
  enquiryId: string,
  region: string
): EnquiryRegionAssignedEvent => ({
  type: "ENQUIRY_REGION_ASSIGNED",
  payload: {
    enquiryId,
    region,
    timestamp: new Date(),
  },
});

export const createPrimaryCMAssignedEvent = (
  enquiryId: string,
  memberId: string
): PrimaryCMAssignedEvent => ({
  type: "PRIMARY_CM_ASSIGNED",
  payload: {
    enquiryId,
    memberId,
    timestamp: new Date(),
  },
});

export const createMemberAddedEvent = (
  enquiryId: string,
  member: Member
): MemberAddedEvent => ({
  type: "MEMBER_ADDED",
  payload: {
    enquiryId,
    member,
    timestamp: new Date(),
  },
});

export const createMemberRemovedEvent = (
  enquiryId: string,
  memberId: string
): MemberRemovedEvent => ({
  type: "MEMBER_REMOVED",
  payload: {
    enquiryId,
    memberId,
    timestamp: new Date(),
  },
});

export const createMemberTaggedEvent = (
  enquiryId: string,
  memberId: string,
  taggedByPersonaId: string,
  messageId: string
): MemberTaggedEvent => ({
  type: "MEMBER_TAGGED",
  payload: {
    enquiryId,
    memberId,
    taggedByPersonaId,
    messageId,
    timestamp: new Date(),
  },
});

export const createMemberRoleUpdatedEvent = (
  enquiryId: string,
  memberId: string,
  role: Role
): MemberRoleUpdatedEvent => ({
  type: "MEMBER_ROLE_UPDATED",
  payload: {
    enquiryId,
    memberId,
    role,
    timestamp: new Date(),
  },
});

export const createEnquiryViewedEvent = (
  enquiryId: string,
  viewedByPersonaId: string
): EnquiryViewedEvent => ({
  type: "ENQUIRY_VIEWED",
  payload: {
    enquiryId,
    viewedByPersonaId,
    timestamp: new Date(),
  },
});