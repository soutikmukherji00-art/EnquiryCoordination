/**
 * Enquiry Member Assignment Utilities
 * 
 * Handles automatic assignment of team members (CM, CX) to enquiries
 */

import { generateMemberId, Member } from "./enquiry.types";
import { getPersonaById } from "@/domain/persona/persona.data";
import { getCMForCategory, EnquiryCategory } from "@/domain/cm/cm.assignment";
import {
  createMemberAddedEvent,
  createPrimaryCMAssignedEvent,
} from "./enquiry.events";

export interface AssignmentResult {
  events: any[];
  assignedCMName: string;
  assignedMembers: string[];
}

/**
 * Create member object from persona ID
 */
function createMember(enquiryId: string, personaId: string, isPrimaryCM = false): Member | null {
  const persona = getPersonaById(personaId);
  if (!persona) return null;

  const memberId = generateMemberId(enquiryId, personaId);
  return {
    id: memberId,
    userId: persona.userId,
    personaId: persona.id,
    role: persona.role,
    joinedAt: new Date(),
    ...(isPrimaryCM && { isPrimaryCM: true }),
  };
}

/**
 * Assign CMs based on multiple categories
 */
export function assignCMsByCategories(
  enquiryId: string,
  categories?: EnquiryCategory[]
): { events: any[]; assignedCMNames: string[] } {
  const events: any[] = [];
  const assignedCMNames: string[] = [];

  if (!categories || categories.length === 0) {
    console.log("[assignCMsByCategories] No categories provided, skipping CM assignment");
    return { events, assignedCMNames };
  }

  // Assign a CM for each category
  for (const category of categories) {
    const cmPersonaId = getCMForCategory(category);
    
    if (cmPersonaId) {
      // Check if this CM has already been assigned (avoid duplicates)
      const alreadyAssigned = assignedCMNames.some(name => {
        const persona = getPersonaById(cmPersonaId);
        return persona?.displayName === name;
      });

      if (!alreadyAssigned) {
        const cmMember = createMember(enquiryId, cmPersonaId, true);
        if (cmMember) {
          const cmPersona = getPersonaById(cmPersonaId);
          const cmName = cmPersona?.displayName || "";
          
          events.push(createMemberAddedEvent(enquiryId, cmMember));
          events.push(createPrimaryCMAssignedEvent(enquiryId, cmMember.id));
          
          assignedCMNames.push(cmName);
          console.log("[assignCMsByCategories] Assigned CM for category:", category, "→", cmName);
        }
      }
    } else {
      console.warn("[assignCMsByCategories] No CM found for category:", category);
    }
  }

  return { events, assignedCMNames };
}

/**
 * Auto-assign CX to enquiry
 */
export function assignCXToEnquiry(enquiryId: string): { events: any[]; assignedCXName: string } {
  const events: any[] = [];
  const cxPersonaId = "p_cx_1"; // Sneha Reddy
  
  const cxMember = createMember(enquiryId, cxPersonaId);
  
  if (cxMember) {
    const cxPersona = getPersonaById(cxPersonaId);
    const assignedCXName = cxPersona?.displayName || "";
    
    events.push(createMemberAddedEvent(enquiryId, cxMember));
    console.log("[assignCXToEnquiry] CX added:", assignedCXName);
    
    return { events, assignedCXName };
  }

  console.warn("[assignCXToEnquiry] CX persona not found:", cxPersonaId);
  return { events, assignedCXName: "" };
}

/**
 * Assign creator (BDM) to enquiry
 */
export function assignCreatorToEnquiry(
  enquiryId: string,
  creatorPersonaId: string
): { events: any[]; creatorName: string } {
  const events: any[] = [];
  
  const creatorMember = createMember(enquiryId, creatorPersonaId);
  
  if (creatorMember) {
    const creator = getPersonaById(creatorPersonaId);
    const creatorName = creator?.displayName || "";
    
    events.push(createMemberAddedEvent(enquiryId, creatorMember));
    console.log("[assignCreatorToEnquiry] Creator added:", creatorName);
    
    return { events, creatorName };
  }

  return { events, creatorName: "" };
}

/**
 * Perform all auto-assignments for a new enquiry
 */
export function autoAssignTeamMembers(
  enquiryId: string,
  creatorPersonaId: string,
  categories?: EnquiryCategory[],
  manualCMId?: string
): AssignmentResult {
  const allEvents: any[] = [];
  const assignedMembers: string[] = [];

  // 1. Assign creator (BDM)
  const creatorResult = assignCreatorToEnquiry(enquiryId, creatorPersonaId);
  allEvents.push(...creatorResult.events);
  if (creatorResult.creatorName) {
    assignedMembers.push(creatorResult.creatorName);
  }

  // 2. Assign CM (Manual if provided, otherwise auto-assign by categories)
  let cmResult: { events: any[]; assignedCMNames: string[] } = { events: [], assignedCMNames: [] };
  
  if (manualCMId) {
    const cmMember = createMember(enquiryId, manualCMId, true);
    if (cmMember) {
      const cmPersona = getPersonaById(manualCMId);
      const cmName = cmPersona?.displayName || "";
      cmResult = {
        events: [
          createMemberAddedEvent(enquiryId, cmMember),
          createPrimaryCMAssignedEvent(enquiryId, cmMember.id)
        ],
        assignedCMNames: [cmName]
      };
      console.log("[autoAssignTeamMembers] Manual CM assigned:", cmName);
    }
  } else {
    cmResult = assignCMsByCategories(enquiryId, categories);
  }
  allEvents.push(...cmResult.events);

  // 3. Auto-assign CX
  const cxResult = assignCXToEnquiry(enquiryId);
  allEvents.push(...cxResult.events);
  if (cxResult.assignedCXName) {
    assignedMembers.push(cxResult.assignedCXName);
  }

  return {
    events: allEvents,
    assignedCMName: cmResult.assignedCMNames.join(", "), // Join multiple CM names
    assignedMembers,
  };
}