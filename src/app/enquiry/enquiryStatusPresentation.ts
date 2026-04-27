import {
  normalizeEnquiryState,
  type EnquiryState,
} from "@/domain/enquiry/enquiry.state-machine";

/**
 * Surface tokens for enquiry lifecycle chips (Pluto, Prism, RFQ).
 * Each canonical state has a distinct hue; legacy raw strings are normalized first.
 */
const BADGE_SURFACE_BY_STATE: Record<EnquiryState, string> = {
  Unassigned: "bg-amber-50 text-amber-900 border-amber-400",
  Draft: "bg-[#eef4fd] text-[#08479e] border-[#0a58c6]",
  "Awaiting Response":
    "bg-[rgba(242,241,252,0.6)] text-[#4039ad] border-[#8e88e7]",
  "CM Responded": "bg-[#fff1df] text-[#995a00] border-[#f0b35e]",
  "RM Approved": "bg-sky-50 text-sky-900 border-sky-400",
  "Converted to Order": "bg-[#e5f7df] text-[#2c541e] border-[#57a53a]",
};

const STATUS_DOT_BY_STATE: Record<EnquiryState, string> = {
  Unassigned: "bg-amber-500",
  Draft: "bg-slate-500",
  "Awaiting Response": "bg-violet-600",
  "CM Responded": "bg-amber-500",
  "RM Approved": "bg-sky-500",
  "Converted to Order": "bg-green-500",
};

const FALLBACK_BADGE_SURFACE = "bg-gray-100 text-gray-600 border-gray-300";
const FALLBACK_DOT = "bg-gray-400";

export function getEnquiryStatusBadgeSurfaceClasses(state: string): string {
  const normalized = normalizeEnquiryState(state);
  return BADGE_SURFACE_BY_STATE[normalized] ?? FALLBACK_BADGE_SURFACE;
}

export function getEnquiryStatusDotClass(state: string): string {
  const normalized = normalizeEnquiryState(state);
  return STATUS_DOT_BY_STATE[normalized] ?? FALLBACK_DOT;
}
