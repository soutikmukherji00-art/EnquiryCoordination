/**
 * Domain Utilities: Validation
 * 
 * Pure functions for validating business rules and data integrity.
 * 
 * NOTE: isValidChannelId, isValidEnquiryId, isValidSellerId moved to type-guards.ts
 * NOTE: isInternalRole, isExternalRole moved to policy/policy.registry.ts
 */

/**
 * Validates if a string is a valid persona ID format
 */
export const isValidPersonaId = (id: string): boolean => {
  return /^p_[a-z]+_\d+$/.test(id);
};

/**
 * Validates if a string is a valid user ID format
 */
export const isValidUserId = (id: string): boolean => {
  return /^u_\d+$/.test(id);
};

/**
 * Validates if a string is a valid member ID format
 */
export const isValidMemberId = (id: string): boolean => {
  return /^m_.+$/.test(id);
};

/**
 * Validates if content is not empty (has non-whitespace characters)
 */
export const hasContent = (content: string): boolean => {
  return content.trim().length > 0;
};

/**
 * Validates if an email address is valid
 */
export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validates if a phone number is valid (basic validation)
 */
export const isValidPhone = (phone: string): boolean => {
  return /^\+?[\d\s\-()]{10,}$/.test(phone);
};