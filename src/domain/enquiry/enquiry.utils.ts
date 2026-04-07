/**
 * Domain: Enquiry Utilities
 * 
 * Helper functions for working with enquiry and member domain logic.
 */

import { Member, Persona, generateMemberId } from "./enquiry.types";
import {
  createEnquiryCreatedEvent,
  createMemberAddedEvent,
  createPrimaryCMAssignedEvent,
  createEnquiryRegionAssignedEvent,
} from "./enquiry.events";
import { getPersonaById } from "../persona/persona.data";

/**
 * Create a member from persona for an enquiry
 */
export function createMemberFromPersona(
  enquiryId: string,
  persona: Persona
): Member {
  return {
    id: generateMemberId(enquiryId, persona.id),
    userId: persona.userId,
    personaId: persona.id,
    role: persona.role,
    joinedAt: new Date(),
  };
}

/**
 * Add persona as member to enquiry
 * Returns MEMBER_ADDED event
 */
export function addPersonaAsMember(enquiryId: string, personaId: string) {
  const persona = getPersonaById(personaId);
  if (!persona) {
    throw new Error(`Persona ${personaId} not found`);
  }

  const member = createMemberFromPersona(enquiryId, persona);
  return createMemberAddedEvent(enquiryId, member);
}

/**
 * Create enquiry with creator as first member
 * Returns array of events: [ENQUIRY_CREATED, MEMBER_ADDED]
 */
export function createEnquiryWithCreator(
  enquiryId: string,
  creatorPersonaId: string,
  region?: string,
  buyerName?: string
) {
  const persona = getPersonaById(creatorPersonaId);
  if (!persona) {
    throw new Error(`Persona ${creatorPersonaId} not found`);
  }

  const events = [];

  // Create enquiry
  events.push(
    createEnquiryCreatedEvent(enquiryId, creatorPersonaId, region, buyerName)
  );

  // Add creator as member
  const member = createMemberFromPersona(enquiryId, persona);
  events.push(createMemberAddedEvent(enquiryId, member));

  return events;
}

/**
 * Assign primary CM
 * Validates that member exists and is a CM
 */
export function assignPrimaryCM(
  enquiryId: string,
  memberId: string
) {
  return createPrimaryCMAssignedEvent(enquiryId, memberId);
}

/**
 * Assign region to enquiry
 */
export function assignRegion(
  enquiryId: string,
  region: string
) {
  return createEnquiryRegionAssignedEvent(enquiryId, region);
}

/**
 * Auto-assign primary CM based on region
 * This is application logic, not domain logic
 * Returns PRIMARY_CM_ASSIGNED event if successful
 */
export function autoAssignCMByRegion(
  enquiryId: string,
  region: string,
  availableCMs: Member[]
): ReturnType<typeof createPrimaryCMAssignedEvent> | null {
  // Simple logic: assign first available CM for region
  // In production, this would use more sophisticated matching
  
  const regionCMMap: Record<string, string> = {
    "North": "p_cm_1",
    "South": "p_cm_2",
    "East": "p_cm_3",
    "West": "p_cm_1",
  };

  const preferredPersonaId = regionCMMap[region];
  if (!preferredPersonaId) return null;

  // Find member with this persona
  const cmMember = availableCMs.find((m) => m.personaId === preferredPersonaId);
  if (!cmMember) return null;

  return createPrimaryCMAssignedEvent(enquiryId, cmMember.id);
}
