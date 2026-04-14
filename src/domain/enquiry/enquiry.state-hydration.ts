/**
 * Align lean enquiry + members with record.assignment.primaryCMId (same outcome as ENQUIRY_RECORD_UPDATED).
 */

import type { Enquiry, Member } from "./enquiry.types";
import type { EnquiryRecord } from "./enquiry.record";

export function hydrateEnquiryPrimaryCMFromRecord(
  enquiry: Enquiry,
  members: Member[],
  record: EnquiryRecord | undefined,
): { enquiry: Enquiry; members: Member[] } {
  const personaId = record?.assignment?.primaryCMId;
  if (!personaId) {
    return { enquiry, members };
  }

  const cmMember = members.find((m) => m.personaId === personaId && m.role === "CM");
  if (!cmMember) {
    return { enquiry, members };
  }

  const updatedMembers = members.map((m) => ({
    ...m,
    isPrimaryCM: m.id === cmMember.id,
  }));

  return {
    enquiry: { ...enquiry, primaryCMId: cmMember.id },
    members: updatedMembers,
  };
}
