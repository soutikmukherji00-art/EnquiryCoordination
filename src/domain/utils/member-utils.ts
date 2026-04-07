/**
 * Member Management Utilities
 * 
 * Centralized utilities for managing members across enquiries and groups
 */

import { PERSONAS } from "@/domain/persona/persona.data";
import { MOCK_CONTACTS } from "@/domain/buyer/buyer.mock-data";
import { GroupMember } from "@/domain/message/group.types";

/**
 * Determine if an ID belongs to a persona or contact
 */
export function getEntityType(id: string): "persona" | "contact" | "unknown" {
  // Check if it's a persona
  const persona = PERSONAS.find(p => p.id === id);
  if (persona) return "persona";

  // Check if it's a contact
  const contact = MOCK_CONTACTS.find(c => c.id === id);
  if (contact) return "contact";

  return "unknown";
}

/**
 * Convert an ID to a GroupMember format
 */
export function createGroupMemberFromId(id: string): GroupMember {
  const entityType = getEntityType(id);

  if (entityType === "persona") {
    return {
      personaId: id,
      contactId: null,
    };
  } else if (entityType === "contact") {
    return {
      personaId: null,
      contactId: id,
    };
  } else {
    // Default to persona if unknown
    return {
      personaId: id,
      contactId: null,
    };
  }
}

/**
 * Get display name for a member ID
 */
export function getMemberDisplayName(id: string): string {
  const persona = PERSONAS.find(p => p.id === id);
  if (persona) return persona.displayName;

  const contact = MOCK_CONTACTS.find(c => c.id === id);
  if (contact) return contact.name;

  return id;
}

/**
 * Get member role
 */
export function getMemberRole(id: string): string {
  const persona = PERSONAS.find(p => p.id === id);
  if (persona) return persona.role;

  const contact = MOCK_CONTACTS.find(c => c.id === id);
  if (contact) return contact.role;

  return "Unknown";
}

/**
 * Validate if a member can be added to a group based on constraints
 */
export function canAddMemberToGroup(
  memberId: string,
  groupType: "buyer" | "seller" | "custom",
  buyerId?: string,
  sellerId?: string
): { allowed: boolean; reason?: string } {
  const entityType = getEntityType(memberId);

  // Internal users can be added to any group
  const persona = PERSONAS.find(p => p.id === memberId);
  if (persona && ["BDM", "CM", "CX"].includes(persona.role)) {
    return { allowed: true };
  }

  // For buyer groups, only buyer contacts from the same buyer
  if (groupType === "buyer" && entityType === "contact") {
    const contact = MOCK_CONTACTS.find(c => c.id === memberId);
    if (contact && contact.buyerId === buyerId) {
      return { allowed: true };
    }
    return { allowed: false, reason: "Contact must be from the same buyer company" };
  }

  // For seller groups, only seller contacts from the same seller
  if (groupType === "seller" && entityType === "contact") {
    // This would need seller contact validation
    return { allowed: true }; // Simplified for now
  }

  // For custom groups, only internal users
  if (groupType === "custom" && entityType === "persona") {
    return { allowed: true };
  }

  return { allowed: false, reason: "Member cannot be added to this group type" };
}

/**
 * Format member list for display
 */
export function formatMemberList(memberIds: string[], maxDisplay: number = 3): string {
  const names = memberIds.map(id => getMemberDisplayName(id));
  
  if (names.length <= maxDisplay) {
    return names.join(", ");
  }

  const displayed = names.slice(0, maxDisplay);
  const remaining = names.length - maxDisplay;
  return `${displayed.join(", ")} +${remaining} more`;
}
