/**
 * Pick a default persona when switching workspace role so Prism/Pluto lists are not empty
 * when the naive "first persona in PERSONAS" is not on any enquiry team.
 */

import type { Enquiry, Persona, Role } from "./enquiry.types";
import { filterEnquiriesByPersona } from "./enquiry.filters";

/**
 * First persona of `role` (in `allPersonas` order) with at least one accessible enquiry;
 * otherwise the first persona of that role; for Seller the first seller candidate.
 */
export function pickDefaultPersonaForRole(
  role: Role,
  enquiries: Enquiry[],
  allPersonas: Persona[],
): Persona {
  const candidates = allPersonas.filter((p) => p.role === role);
  if (candidates.length === 0) {
    return allPersonas[0];
  }

  if (role === "Seller" || enquiries.length === 0) {
    return candidates[0];
  }

  for (const p of candidates) {
    if (filterEnquiriesByPersona(enquiries, p).length > 0) {
      return p;
    }
  }

  return candidates[0];
}
