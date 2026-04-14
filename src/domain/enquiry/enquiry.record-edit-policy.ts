/**
 * Which sections of EnquiryRecord may be edited, by role and enquiry lifecycle state.
 * Lightweight contract for future CM / CX screens reusing StructuredPanel.
 */

import type { Role } from "./enquiry.types";
import type { EnquiryState } from "./enquiry.state-machine";

export type EnquiryRecordSection = "buyer" | "requirements" | "assignment" | "products" | "media";

/**
 * Returns editable sections, `"all"` when every section is editable, or `[]` when read-only.
 */
export function getEditableEnquiryRecordSections(
  role: Role,
  enquiryState: EnquiryState,
): EnquiryRecordSection[] | "all" {
  if (enquiryState === "Converted to Order") {
    return [];
  }
  if (role === "BDM" || role === "CM" || role === "CX") {
    return "all";
  }
  return [];
}
