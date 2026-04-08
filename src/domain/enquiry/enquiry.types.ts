/**
 * Domain: Enquiry Types
 * 
 * Core business entities for procurement enquiry system.
 * Enquiry owns members. Messages reference members.
 */

import type { Category } from "@/domain/category/category.types";

// Import state machine types
export type { EnquiryState, EnquiryStateEvent } from "./enquiry.state-machine";
export * from "./enquiry.state-machine";

/**
 * User roles in the system
 */
export type Role = "BDM" | "CM" | "CX" | "Buyer" | "Seller";

/**
 * Enquiry - Core business entity
 * Source of truth for membership
 */
export interface Enquiry {
  id: string;
  state: EnquiryState;
  region?: string;
  primaryCMId?: string; // References a Member.id
  memberIds: string[]; // References Member.id[]
  createdAt: Date;
  lastActivity: Date;
  estimatedValue?: number; // Estimated value for the enquiry
  
  /**
   * Product categories for this enquiry
   * Most enquiries have a single category, but multi-category is supported
   */
  categories: Category[];
  
  // Legacy fields for compatibility
  buyerName?: string;
  buyerPersonaId?: string; // Persona ID of the buyer
  bdmPersonaId?: string; // Persona ID of the assigned BDM
  createdViaBot?: boolean; // Whether the enquiry was created from bot-driven intake
  unread?: boolean;
  hasMentions?: boolean; // Whether the enquiry has unread mentions
  convertedAt?: Date;
  productCategory?: string; // Deprecated: use categories instead
}

/**
 * Member - Represents a persona's participation in an enquiry
 * A member is a specific persona's participation in a specific enquiry
 */
export interface Member {
  id: string; // Unique member ID (e.g., "m_enquiry1_persona1")
  userId: string; // User ID (e.g., "u_101")
  personaId: string; // Persona ID (e.g., "p_bdm_1")
  role: Role;
  isPrimaryCM?: boolean; // Only one member per enquiry can be primary CM
  joinedAt: Date;
}

/**
 * Persona - Represents a user's role-based identity
 * A user can have multiple personas (e.g., user u_101 can be both BDM and CM)
 */
export interface Persona {
  id: string; // e.g., "p_bdm_1"
  userId: string; // e.g., "u_101"
  displayName: string; // e.g., "John Smith"
  role: Role;
  isExternal: boolean; // true for Buyer/Seller, false for BDM/CM/CX
  isActive?: boolean; // Online status - true for active (green), false for inactive (gray)
  avgResponseTimeMinutes?: number; // Average response time in minutes (for CMs)
}

/**
 * Member ID generation
 */
export const generateMemberId = (enquiryId: string, personaId: string): string => {
  return `m_${enquiryId}_${personaId}`;
};

/**
 * Enquiry ID generation
 * Generates a unique ENQ-XXXX ID based on existing enquiries
 */
export const generateEnquiryId = (existingEnquiries: Enquiry[]): string => {
  // Find the highest existing enquiry number
  const existingNumbers = existingEnquiries
    .map((enq) => {
      const match = enq.id.match(/^ENQ-(\d+)$/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((num) => !isNaN(num));

  const maxNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 2400;
  const nextNumber = maxNumber + 1;

  return `ENQ-${nextNumber}`;
};
