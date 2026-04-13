/**
 * Category Manager assignments by product category
 */

import type { Category } from "@/domain/category/category.types";
import { CATEGORY_REGISTRY, getDefaultCMForCategory, getAllCategories, isValidCategory, getCategoryInfo } from "@/domain/category/category.types";

// Re-export for backward compatibility
export type EnquiryCategory = Category;
export type { Category };
export { getAllCategories, isValidCategory, getCategoryInfo };

/**
 * Get CM persona ID for a given category
 * 
 * @param category - Product category (Steel, Polymer, Bitumen, or Cement)
 * @returns CM persona ID or null if category not found
 */
export function getCMForCategory(category: Category): string | null {
  return getDefaultCMForCategory(category);
}

/**
 * Get all supported categories
 */
export function getSupportedCategories(): Category[] {
  return ["Steel", "Polymer", "Bitumen", "Cement"];
}

/**
 * Get category for a CM persona ID
 * 
 * @param cmPersonaId - CM persona ID
 * @returns Category or null if CM not found
 */
export function getCategoryForCM(cmPersonaId: string): Category | null {
  const match = (Object.keys(CATEGORY_REGISTRY) as Category[]).find(
    (category) => getDefaultCMForCategory(category) === cmPersonaId,
  );
  return match ?? null;
}