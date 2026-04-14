/**
 * Domain: Enquiry Reducer
 * 
 * Pure functions that apply events to enquiry state.
 * No side effects, no external calls.
 * Deterministic and replayable.
 * 
 * State Shape:
 * - enquiries: Map of enquiry ID to Enquiry
 * - membersByEnquiry: Map of enquiry ID to Member[]
 */

import { Enquiry, Member } from "./enquiry.types";
import { EnquiryEvent } from "./enquiry.events";
import { coerceEnquiryRecordOrigin, EnquiryRecord } from "./enquiry.record";

function normalizeEnquiryRecordFromEvent(record: EnquiryRecord): EnquiryRecord {
  const r = record as EnquiryRecord & { creationSource?: string };
  const { creationSource: _legacy, ...rest } = r;
  if (rest.origin) return rest as EnquiryRecord;
  const fromLegacy = _legacy ? coerceEnquiryRecordOrigin(_legacy) : undefined;
  return { ...(rest as EnquiryRecord), origin: fromLegacy ?? "manual" };
}

/**
 * Single source of truth for enquiry and membership state
 */
export interface EnquiryStateStore {
  enquiries: Record<string, Enquiry>;
  membersByEnquiry: Record<string, Member[]>;
  records: Record<string, EnquiryRecord>;
}

export const initialEnquiryState: EnquiryStateStore = {
  enquiries: {},
  membersByEnquiry: {},
  records: {},
};

/**
 * Main reducer - applies events to state
 */
export const enquiryReducer = (
  state: EnquiryStateStore,
  event: EnquiryEvent
): EnquiryStateStore => {
  switch (event.type) {
    case "ENQUIRY_CREATED": {
      return handleEnquiryCreated(state, event);
    }

    case "ENQUIRY_REGION_ASSIGNED": {
      return handleRegionAssigned(state, event);
    }

    case "PRIMARY_CM_ASSIGNED": {
      return handlePrimaryCMAssigned(state, event);
    }

    case "MEMBER_ADDED": {
      return handleMemberAdded(state, event);
    }

    case "MEMBER_REMOVED": {
      return handleMemberRemoved(state, event);
    }

    case "MEMBER_TAGGED": {
      // No state mutation - audit only
      return state;
    }

    case "MEMBER_ROLE_UPDATED": {
      return handleMemberRoleUpdated(state, event);
    }

    case "ENQUIRY_STATE_CHANGED": {
      return handleStateChanged(state, event);
    }

    case "ENQUIRY_CONVERTED": {
      return handleEnquiryConverted(state, event);
    }

    case "ENQUIRY_VIEWED": {
      return handleEnquiryViewed(state, event);
    }

    case "ENQUIRY_RECORD_CREATED":
    case "ENQUIRY_RECORD_UPDATED": {
      const { enquiryId, record: rawRecord } = event.payload;
      const record = normalizeEnquiryRecordFromEvent(rawRecord);
      
      // Sync back key fields to the lean enquiry entity if it exists
      const existingEnquiry = state.enquiries[enquiryId];
      const updatedEnquiries = { ...state.enquiries };
      
      if (existingEnquiry) {
        const members = state.membersByEnquiry[enquiryId] || [];
        const selectedCMPersonaId = record.assignment.primaryCMId;
        let nextPrimaryCMId = existingEnquiry.primaryCMId;
        if (selectedCMPersonaId) {
          const matchingCm = members.find(
            (member) => member.personaId === selectedCMPersonaId && member.role === "CM",
          );
          if (matchingCm) {
            nextPrimaryCMId = matchingCm.id;
          }
        }
        updatedEnquiries[enquiryId] = {
          ...existingEnquiry,
          buyerName: record.buyer.name,
          estimatedValue: record.requirements.estimatedValue || existingEnquiry.estimatedValue,
          categories: record.requirements.categories as any,
          primaryCMId: nextPrimaryCMId,
        };
      }

      return {
        ...state,
        enquiries: updatedEnquiries,
        records: {
          ...state.records,
          [enquiryId]: record,
        },
      };
    }

    default:
      return state;
  }
};

/**
 * ENQUIRY_CREATED handler
 * - Create enquiry
 * - Add creator as member
 * - No CM assigned yet
 */
function handleEnquiryCreated(
  state: EnquiryStateStore,
  event: EnquiryEvent & { type: "ENQUIRY_CREATED" }
): EnquiryStateStore {
  const { 
    enquiryId, 
    createdByPersonaId, 
    region, 
    buyerName, 
    buyerPersonaId, 
    timestamp,
    estimatedValue,
    categories
  } = event.payload;

  // Create new enquiry
  const newEnquiry: Enquiry = {
    id: enquiryId,
    state: "Draft",
    region,
    memberIds: [], // Will be populated by MEMBER_ADDED events
    createdAt: timestamp,
    lastActivity: timestamp,
    buyerName, // Legacy field
    buyerPersonaId, // NEW: Set buyerPersonaId from event
    bdmPersonaId: createdByPersonaId, // Set BDM persona ID
    createdViaBot: event.payload.createdViaBot ?? false,
    unread: event.payload.createdViaBot ?? false,
    estimatedValue, // NEW: Apply estimated value
    categories: (categories || []) as any[], // NEW: Apply categories
  };

  return {
    ...state,
    enquiries: {
      ...state.enquiries,
      [enquiryId]: newEnquiry,
    },
    membersByEnquiry: {
      ...state.membersByEnquiry,
      [enquiryId]: [],
    },
  };
}

/**
 * ENQUIRY_REGION_ASSIGNED handler
 * - Set region
 * - Note: CM auto-assignment happens via side effects, not in reducer
 */
function handleRegionAssigned(
  state: EnquiryStateStore,
  event: EnquiryEvent & { type: "ENQUIRY_REGION_ASSIGNED" }
): EnquiryStateStore {
  const { enquiryId, region, timestamp } = event.payload;
  const enquiry = state.enquiries[enquiryId];
  if (!enquiry) return state;

  return {
    ...state,
    enquiries: {
      ...state.enquiries,
      [enquiryId]: {
        ...enquiry,
        region,
        lastActivity: timestamp,
      },
    },
  };
}

/**
 * PRIMARY_CM_ASSIGNED handler
 * - Set primaryCMId
 * - Mark member as primary
 * - Unmark any previous primary CM
 * - Only one primary CM allowed
 */
function handlePrimaryCMAssigned(
  state: EnquiryStateStore,
  event: EnquiryEvent & { type: "PRIMARY_CM_ASSIGNED" }
): EnquiryStateStore {
  const { enquiryId, memberId, timestamp } = event.payload;
  const enquiry = state.enquiries[enquiryId];
  const members = state.membersByEnquiry[enquiryId] || [];

  if (!enquiry) return state;

  // Find the member being assigned as primary
  const targetMember = members.find((m) => m.id === memberId);
  if (!targetMember || targetMember.role !== "CM") {
    // Can only assign CM role as primary
    return state;
  }

  // Update all members: unmark previous primary, mark new primary
  const updatedMembers = members.map((member) => ({
    ...member,
    isPrimaryCM: member.id === memberId,
  }));

  return {
    ...state,
    enquiries: {
      ...state.enquiries,
      [enquiryId]: {
        ...enquiry,
        primaryCMId: memberId,
        lastActivity: timestamp,
      },
    },
    membersByEnquiry: {
      ...state.membersByEnquiry,
      [enquiryId]: updatedMembers,
    },
  };
}

/**
 * MEMBER_ADDED handler
 * - Append member if not present
 * - Preserve existing members
 * - No role mutation allowed here
 */
function handleMemberAdded(
  state: EnquiryStateStore,
  event: EnquiryEvent & { type: "MEMBER_ADDED" }
): EnquiryStateStore {
  const { enquiryId, member, timestamp } = event.payload;
  const enquiry = state.enquiries[enquiryId];
  const existingMembers = state.membersByEnquiry[enquiryId] || [];

  if (!enquiry) return state;

  // Check if member already exists (by member.id)
  if (existingMembers.some((m) => m.id === member.id)) {
    return state;
  }

  // Add new member
  const updatedMembers = [...existingMembers, member];

  return {
    ...state,
    enquiries: {
      ...state.enquiries,
      [enquiryId]: {
        ...enquiry,
        memberIds: [...(enquiry.memberIds || []), member.id],
        lastActivity: timestamp,
      },
    },
    membersByEnquiry: {
      ...state.membersByEnquiry,
      [enquiryId]: updatedMembers,
    },
  };
}

/**
 * MEMBER_REMOVED handler
 * - Remove member if present
 * - Preserve existing members
 * - Revalidate primary CM constraints
 */
function handleMemberRemoved(
  state: EnquiryStateStore,
  event: EnquiryEvent & { type: "MEMBER_REMOVED" }
): EnquiryStateStore {
  const { enquiryId, memberId, timestamp } = event.payload;
  const enquiry = state.enquiries[enquiryId];
  const members = state.membersByEnquiry[enquiryId] || [];

  if (!enquiry) return state;

  // Find the member being removed
  const memberIndex = members.findIndex((m) => m.id === memberId);
  if (memberIndex === -1) return state;

  const updatedMembers = [
    ...members.slice(0, memberIndex),
    ...members.slice(memberIndex + 1),
  ];

  // If this member was primary CM, clear primary
  let updatedEnquiry = { 
    ...enquiry, 
    memberIds: enquiry.memberIds.filter(id => id !== memberId), // Remove from memberIds array
    lastActivity: timestamp 
  };
  if (enquiry.primaryCMId === memberId) {
    updatedEnquiry.primaryCMId = undefined;
  }

  return {
    ...state,
    enquiries: {
      ...state.enquiries,
      [enquiryId]: updatedEnquiry,
    },
    membersByEnquiry: {
      ...state.membersByEnquiry,
      [enquiryId]: updatedMembers,
    },
  };
}

/**
 * MEMBER_ROLE_UPDATED handler
 * - Update role
 * - Revalidate primary CM constraints
 */
function handleMemberRoleUpdated(
  state: EnquiryStateStore,
  event: EnquiryEvent & { type: "MEMBER_ROLE_UPDATED" }
): EnquiryStateStore {
  const { enquiryId, memberId, role, timestamp } = event.payload;
  const enquiry = state.enquiries[enquiryId];
  const members = state.membersByEnquiry[enquiryId] || [];

  if (!enquiry) return state;

  const memberIndex = members.findIndex((m) => m.id === memberId);
  if (memberIndex === -1) return state;

  const updatedMember = { ...members[memberIndex], role };
  const updatedMembers = [
    ...members.slice(0, memberIndex),
    updatedMember,
    ...members.slice(memberIndex + 1),
  ];

  // If this member was primary CM and role changed away from CM, clear primary
  let updatedEnquiry = { ...enquiry, lastActivity: timestamp };
  if (enquiry.primaryCMId === memberId && role !== "CM") {
    updatedEnquiry.primaryCMId = undefined;
    updatedMember.isPrimaryCM = false;
  }

  return {
    ...state,
    enquiries: {
      ...state.enquiries,
      [enquiryId]: updatedEnquiry,
    },
    membersByEnquiry: {
      ...state.membersByEnquiry,
      [enquiryId]: updatedMembers,
    },
  };
}

/**
 * ENQUIRY_STATE_CHANGED handler (legacy)
 */
function handleStateChanged(
  state: EnquiryStateStore,
  event: EnquiryEvent & { type: "ENQUIRY_STATE_CHANGED" }
): EnquiryStateStore {
  const { enquiryId, toState, timestamp } = event.payload;
  const enquiry = state.enquiries[enquiryId];
  if (!enquiry) return state;

  return {
    ...state,
    enquiries: {
      ...state.enquiries,
      [enquiryId]: {
        ...enquiry,
        state: toState,
        lastActivity: timestamp,
      },
    },
  };
}

/**
 * ENQUIRY_CONVERTED handler (legacy)
 */
function handleEnquiryConverted(
  state: EnquiryStateStore,
  event: EnquiryEvent & { type: "ENQUIRY_CONVERTED" }
): EnquiryStateStore {
  const { enquiryId, timestamp } = event.payload;
  const enquiry = state.enquiries[enquiryId];
  if (!enquiry) return state;

  return {
    ...state,
    enquiries: {
      ...state.enquiries,
      [enquiryId]: {
        ...enquiry,
        state: "Converted to Order",
        convertedAt: timestamp,
        lastActivity: timestamp,
      },
    },
  };
}

/**
 * ENQUIRY_VIEWED handler
 * - Mark enquiry as read
 * - Does NOT update lastActivity (viewing shouldn't change sort order)
 */
function handleEnquiryViewed(
  state: EnquiryStateStore,
  event: EnquiryEvent & { type: "ENQUIRY_VIEWED" }
): EnquiryStateStore {
  const { enquiryId } = event.payload;
  const enquiry = state.enquiries[enquiryId];
  if (!enquiry) return state;

  return {
    ...state,
    enquiries: {
      ...state.enquiries,
      [enquiryId]: {
        ...enquiry,
        unread: false,
        // lastActivity intentionally NOT updated - viewing shouldn't affect sort order
      },
    },
  };
}
