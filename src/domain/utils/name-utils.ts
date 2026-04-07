/**
 * Name utilities
 *
 * Helpers for normalizing display names that may include legacy role suffixes.
 */

const ROLE_SUFFIX_PATTERN =
  /\s*\((?:BDM|CM|CX|Buyer|Seller)(?:\s*-\s*[^)]*)?\)\s*$/;

/**
 * Remove legacy role/category suffixes from a display name.
 * Examples:
 * - "Amit Kumar (BDM)" -> "Amit Kumar"
 * - "Priya Sharma (CM - Steel)" -> "Priya Sharma"
 */
export function stripRoleSuffix(displayName: string): string {
  return displayName.replace(ROLE_SUFFIX_PATTERN, "").trim();
}

