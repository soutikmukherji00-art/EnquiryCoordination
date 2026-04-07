/**
 * Hook: Filtered Enquiries
 * 
 * Optimized hook for filtering enquiries by persona access and search query.
 * Memoizes results to prevent unnecessary recalculations.
 */

import { useMemo } from "react";
import { Enquiry } from "@/domain/enquiry/enquiry.types";
import { Persona } from "@/domain/enquiry/enquiry.types";
import { filterEnquiriesByPersona } from "@/domain/enquiry/enquiry.filters";

export const useFilteredEnquiries = (
  enquiries: Enquiry[],
  currentPersona: Persona,
  searchQuery: string
) => {
  return useMemo(() => {
    // First filter by persona access
    const personaFilteredEnquiries = filterEnquiriesByPersona(enquiries, currentPersona);
    
    // Then filter by search query
    if (!searchQuery) return personaFilteredEnquiries;
    const query = searchQuery.toLowerCase();
    return personaFilteredEnquiries.filter(
      (e) =>
        e.id.toLowerCase().includes(query) ||
        e.buyerName?.toLowerCase().includes(query) ||
        e.state.toLowerCase().includes(query)
    );
  }, [enquiries, searchQuery, currentPersona]);
};