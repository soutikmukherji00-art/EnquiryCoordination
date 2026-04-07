/**
 * Domain Layer Exports
 * 
 * Central export point for all domain logic.
 */

// Enquiry
export * from "./enquiry/enquiry.types";
export * from "./enquiry/enquiry.events";
export * from "./enquiry/enquiry.reducer";
export * from "./enquiry/enquiry.selectors";
export * from "./enquiry/enquiry.utils";

// Message
export * from "./message/message.types";
export * from "./message/message.events";
export * from "./message/message.reducer";
export * from "./message/message.masking";
export * from "./message/message.sharing";
export * from "./message/buyer-dm.types"; // Buyer DM support
export * from "./message/seller-dm.types"; // Seller DM support

// Seller
export * from "./seller/seller.types";
export * from "./seller/seller.fanout";

// Persona
export * from "./persona/persona.data";

// Policy
export * from "./policy/policy.types";
export * from "./policy/policy.registry";
export * from "./policy/policy.enforcement";

// Audit
export * from "./audit/audit.types";
export * from "./audit/audit.reducer";
export * from "./audit/audit.formatters";

// Message Display
export * from "./message/message.display";

// Utilities (Core utilities for consistent code quality)
export * from "./utils/formatting";
// Note: validation.ts has duplicate exports with policy.registry.ts (isInternalRole, isExternalRole)
// and type-guards.ts (isValidEnquiryId, isValidSellerId, isValidChannelId).
// Only re-export the unique symbols to avoid barrel export collisions.
export {
  isValidPersonaId,
  isValidUserId,
  isValidMemberId,
  hasContent,
  isValidEmail,
  isValidPhone,
} from "./utils/validation";

// 🆕 New Utilities (Refactoring improvements)
export * from "./utils/logger";
export * from "./utils/error-handler";
export * from "./utils/type-guards";
export * from "./utils/constants";
export * from "./utils/async-utils";