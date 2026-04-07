/**
 * Category Manager assignments by product category
 */

import type { Category } from "@/domain/category/category.types";
import { CATEGORY_REGISTRY, getDefaultCMForCategory, getAllCategories, isValidCategory, getCategoryInfo } from "@/domain/category/category.types";

// Re-export for backward compatibility
export type EnquiryCategory = Category;
export type { Category };
export { getAllCategories, isValidCategory, getCategoryInfo };

const CM_CATEGORY_MAP: Record<Category, string> = {
  "Steel": "p_cm_north",      // Priya Sharma - Steel Specialist
  "Polymer": "p_cm_south",    // Meera Iyer - Polymer Specialist
  "Cement": "p_cm_east",      // Rajesh Kumar - Cement Specialist
  "Bitumen": "p_cm_west",     // Aditya Verma - Bitumen Specialist
};

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
  const entry = Object.entries(CM_CATEGORY_MAP).find(([_, id]) => id === cmPersonaId);
  return entry ? (entry[0] as Category) : null;
}