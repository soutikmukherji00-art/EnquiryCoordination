/**
 * Domain: Enquiry Filters
 * 
 * Business logic for filtering enquiries based on persona access.
 */

import { Enquiry, Persona } from "./enquiry.types";

/**
 * Filter enquiries that a persona has access to
 * 
 * Rules:
 * - All roles (BDM, CM, CX) see only enquiries where they are members
 * - Buyer sees only enquiries where they are the buyer (buyerPersonaId matches)
 * - Seller sees no enquiries (uses seller channels instead)
 */
export function filterEnquiriesByPersona(
  enquiries: Enquiry[],
  currentPersona: Persona
): Enquiry[] {
  if (!currentPersona) return enquiries;

  const { id: personaId, role } = currentPersona;

  switch (role) {
    case "BDM":
    case "CM":
    case "CX":
      // All internal team members see enquiries where they are members
      return enquiries.filter((e) => {
        // Check if persona is in the enquiry's member list
        const memberIdPattern = `m_${e.id}_${personaId}`;
        return e.memberIds.includes(memberIdPattern);
      });

    case "Buyer":
      // Buyer sees only their own enquiries
      return enquiries.filter((e) => e.buyerPersonaId === personaId);

    case "Seller":
      // Sellers don't see enquiry list (they use seller channels instead)
      return [];

    default:
      return enquiries;
  }
}

/**
 * Check if a persona has a mention in an enquiry's internal channel
 * Returns true if there are unread mentions
 */
export function hasUnreadMentions(
  enquiry: Enquiry,
  personaId: string,
  internalMessages: any[] // Would normally use Message[] but avoiding circular deps
): boolean {
  // Check if any messages in the internal channel mention this persona
  return internalMessages.some((msg) => 
    msg.mentions && msg.mentions.includes(personaId)
  );
}