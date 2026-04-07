/**
 * Domain: Enquiry Selectors
 * 
 * Pure functions to query derived state from enquiry domain.
 * UI reads members from selectors, never mutates directly.
 */

import { Enquiry, Member, Role, canConvertToOrder } from "./enquiry.types";
import { EnquiryStateStore } from "./enquiry.reducer";

/**
 * Get single enquiry by ID
 */
export const selectEnquiry = (
  state: EnquiryStateStore,
  enquiryId: string
): Enquiry | undefined => {
  return state.enquiries[enquiryId];
};

/**
 * Get all enquiries
 */
export const selectAllEnquiries = (
  state: EnquiryStateStore
): Enquiry[] => {
  return Object.values(state.enquiries);
};

/**
 * Get all members for an enquiry
 * Returns ordered list by join time
 */
export const selectMembers = (
  state: EnquiryStateStore,
  enquiryId: string
): Member[] => {
  const members = state.membersByEnquiry[enquiryId] || [];
  // Sort by joinedAt (earliest first)
  return [...members].sort((a, b) => 
    a.joinedAt.getTime() - b.joinedAt.getTime()
  );
};

/**
 * Get primary CM for enquiry
 * Used by tagging, UI badges, and role logic
 */
export const selectPrimaryCM = (
  state: EnquiryStateStore,
  enquiryId: string
): Member | undefined => {
  const enquiry = state.enquiries[enquiryId];
  if (!enquiry || !enquiry.primaryCMId) return undefined;

  const members = state.membersByEnquiry[enquiryId] || [];
  return members.find((m) => m.id === enquiry.primaryCMId);
};

/**
 * Get visible members for UI based on viewer role
 * Delegates filtering to role policy system
 */
export const selectVisibleMembers = (
  state: EnquiryStateStore,
  enquiryId: string,
  viewerRole: Role
): Member[] => {
  const members = selectMembers(state, enquiryId);
  
  // Role-based visibility rules
  switch (viewerRole) {
    case "BDM":
    case "CM":
    case "CX":
      // Internal roles see all members
      return members;
    
    case "Buyer":
      // Buyers see only internal team members (no sellers)
      return members.filter((m) => m.role !== "Seller");
    
    case "Seller":
      // Sellers see only internal team members (no other sellers)
      return members.filter((m) => m.role !== "Seller");
    
    default:
      return members;
  }
};

/**
 * Get members by role
 */
export const selectMembersByRole = (
  state: EnquiryStateStore,
  enquiryId: string,
  role: Role
): Member[] => {
  const members = selectMembers(state, enquiryId);
  return members.filter((m) => m.role === role);
};

/**
 * Get seller participants
 */
export const selectSellerParticipants = (
  state: EnquiryStateStore,
  enquiryId: string
): Member[] => {
  return selectMembersByRole(state, enquiryId, "Seller");
};

/**
 * Get CM participants
 */
export const selectCMParticipants = (
  state: EnquiryStateStore,
  enquiryId: string
): Member[] => {
  return selectMembersByRole(state, enquiryId, "CM");
};

/**
 * Check if specific persona is a member
 */
export const selectIsMember = (
  state: EnquiryStateStore,
  enquiryId: string,
  personaId: string
): boolean => {
  const members = state.membersByEnquiry[enquiryId] || [];
  return members.some((m) => m.personaId === personaId);
};

/**
 * Get member by persona ID
 */
export const selectMemberByPersonaId = (
  state: EnquiryStateStore,
  enquiryId: string,
  personaId: string
): Member | undefined => {
  const members = state.membersByEnquiry[enquiryId] || [];
  return members.find((m) => m.personaId === personaId);
};

/**
 * Get member count
 */
export const selectMemberCount = (
  state: EnquiryStateStore,
  enquiryId: string
): number => {
  return (state.membersByEnquiry[enquiryId] || []).length;
};

/**
 * Check if enquiry can be converted to order
 */
export const selectCanConvert = (
  state: EnquiryStateStore,
  enquiryId: string
): boolean => {
  const enquiry = selectEnquiry(state, enquiryId);
  if (!enquiry) return false;
  return canConvertToOrder(enquiry.state);
};

/**
 * Get enquiries by state
 */
export const selectEnquiriesByState = (
  state: EnquiryStateStore,
  filterState: string
): Enquiry[] => {
  return Object.values(state.enquiries).filter(
    (e) => e.state === filterState
  );
};

/**
 * Get enquiries sorted by activity
 */
export const selectEnquiriesSortedByActivity = (
  state: EnquiryStateStore
): Enquiry[] => {
  return Object.values(state.enquiries).sort(
    (a, b) => b.lastActivity.getTime() - a.lastActivity.getTime()
  );
};

/**
 * Get enquiries where persona is a member
 */
export const selectEnquiriesForPersona = (
  state: EnquiryStateStore,
  personaId: string
): Enquiry[] => {
  const enquiryIds = Object.keys(state.membersByEnquiry).filter((enquiryId) => {
    const members = state.membersByEnquiry[enquiryId] || [];
    return members.some((m) => m.personaId === personaId);
  });
  
  return enquiryIds
    .map((id) => state.enquiries[id])
    .filter((e): e is Enquiry => e !== undefined);
};
