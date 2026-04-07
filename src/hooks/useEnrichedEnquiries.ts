/**
 * Hook: Enriched Enquiries
 * 
 * Optimized hook for enriching enquiries with mention detection.
 * Memoizes results to prevent unnecessary recalculations.
 */

import { useMemo } from "react";
import { Enquiry } from "@/domain/enquiry/enquiry.types";
import { useMentionDetection } from "./useMentionDetection";

export const useEnrichedEnquiries = (
  filteredEnquiries: Enquiry[],
  currentPersonaId: string
) => {
  // Detect mentions across all filtered enquiries
  const mentionMap = useMentionDetection(filteredEnquiries, currentPersonaId);

  // Enrich enquiries with mention detection for UI display
  return useMemo(() => {
    return filteredEnquiries.map((enquiry) => ({
      ...enquiry,
      hasMentions: mentionMap[enquiry.id] || false,
    }));
  }, [filteredEnquiries, mentionMap]);
};
