/**
 * Automatic State Transitions
 * 
 * Handles automatic enquiry state transitions based on events.
 */

import { Enquiry } from "./enquiry.types";
import { getPersonaById } from "../persona/persona.data";
import { canPerformTransition, normalizeEnquiryState } from "./enquiry.state-machine";

/**
 * Check if a message mentions a CM and trigger Draft -> Awaiting Response transition
 */
export const checkCMTaggedTransition = (
  enquiry: Enquiry,
  mentions?: string[],
  currentRole?: string
): { shouldTransition: boolean; reason?: string } => {
  // Only process if enquiry is in Draft state
  if (normalizeEnquiryState(enquiry.state) !== "Draft") {
    return { shouldTransition: false };
  }

  // Must have mentions
  if (!mentions || mentions.length === 0) {
    return { shouldTransition: false };
  }

  // Check if any mentioned persona is a CM
  const mentionedCMs = mentions.filter((personaId) => {
    const persona = getPersonaById(personaId);
    return persona?.role === "CM";
  });

  if (mentionedCMs.length === 0) {
    return { shouldTransition: false };
  }

  // Check if transition is allowed
  const transitionAllowed = canPerformTransition({
    enquiryState: enquiry.state,
    userRole: currentRole as any || "BDM",
    event: "SUBMIT_REQUIREMENT",
  });

  if (!transitionAllowed) {
    return { shouldTransition: false };
  }

  return {
    shouldTransition: true,
    reason: `CM tagged: ${mentionedCMs.length} CM(s) mentioned`,
  };
};

/**
 * When a CM @mentions a BDM, move Awaiting Response → CM Responded (same permission as Submit Response).
 */
export const checkBDMTaggedTransition = (
  enquiry: Enquiry,
  mentions?: string[],
  currentRole?: string
): { shouldTransition: boolean; reason?: string } => {
  if (normalizeEnquiryState(enquiry.state) !== "Awaiting Response") {
    return { shouldTransition: false };
  }

  if (!mentions || mentions.length === 0) {
    return { shouldTransition: false };
  }

  const mentionedBDMs = mentions.filter((personaId) => {
    const persona = getPersonaById(personaId);
    return persona?.role === "BDM";
  });

  if (mentionedBDMs.length === 0) {
    return { shouldTransition: false };
  }

  const transitionAllowed = canPerformTransition({
    enquiryState: enquiry.state,
    userRole: (currentRole as any) || "CM",
    event: "SUBMIT_RESPONSE",
  });

  if (!transitionAllowed) {
    return { shouldTransition: false };
  }

  return {
    shouldTransition: true,
    reason: `BDM tagged: ${mentionedBDMs.length} BDM(s) mentioned`,
  };
};

/**
 * Check if convert to order should trigger state transition
 */
export const checkConvertOrderTransition = (
  enquiry: Enquiry,
  currentRole?: string
): { shouldTransition: boolean; reason?: string } => {
  // Only process if enquiry is in a state where CM can finalize order
  if (enquiry.state !== "Pending Response") {
    return { shouldTransition: false };
  }

  // Check if transition is allowed
  const transitionAllowed = canPerformTransition({
    enquiryState: enquiry.state,
    userRole: currentRole as any || "CM",
    event: "CM_CONFIRM_ORDER",
  });

  if (!transitionAllowed) {
    return { shouldTransition: false };
  }

  return {
    shouldTransition: true,
    reason: "Order conversion initiated",
  };
};
