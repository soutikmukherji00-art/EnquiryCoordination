/**
 * Domain: Category
 * 
 * Product category definitions for the procurement system.
 * Categories drive CM assignment and product specialization.
 */

/**
 * Supported product categories
 */
export type Category = "Steel" | "Polymer" | "Bitumen" | "Cement";

/**
 * Category metadata
 */
export interface CategoryInfo {
  id: Category;
  name: string;
  description: string;
  /**
   * Default CM persona ID assigned to this category
   */
  defaultCMPersonaId: string;
}

/**
 * Category registry with full metadata
 */
export const CATEGORY_REGISTRY: Record<Category, CategoryInfo> = {
  Steel: {
    id: "Steel",
    name: "Steel",
    description: "Steel and iron products, including bars, sheets, and structural steel",
    defaultCMPersonaId: "p_cm_north", // Priya Sharma - Steel Specialist
  },
  Polymer: {
    id: "Polymer",
    name: "Polymer",
    description: "Polymer products, plastics, and synthetic materials",
    defaultCMPersonaId: "p_cm_south", // Meera Iyer - Polymer Specialist
  },
  Cement: {
    id: "Cement",
    name: "Cement",
    description: "Cement, concrete, and related building materials",
    defaultCMPersonaId: "p_cm_east", // Rajesh Kumar - Cement Specialist
  },
  Bitumen: {
    id: "Bitumen",
    name: "Bitumen",
    description: "Bitumen, asphalt, and road construction materials",
    defaultCMPersonaId: "p_cm_west", // Aditya Verma - Bitumen Specialist
  },
};

/**
 * Get all supported categories
 */
export function getAllCategories(): Category[] {
  return Object.keys(CATEGORY_REGISTRY) as Category[];
}

/**
 * Get category info
 */
export function getCategoryInfo(category: Category): CategoryInfo | null {
  return CATEGORY_REGISTRY[category] || null;
}

/**
 * Validate if a string is a valid category
 */
export function isValidCategory(value: string): value is Category {
  return getAllCategories().includes(value as Category);
}

/**
 * Get category by CM persona ID
 */
export function getCategoryByCMPersonaId(cmPersonaId: string): Category | null {
  const entry = Object.entries(CATEGORY_REGISTRY).find(
    ([_, info]) => info.defaultCMPersonaId === cmPersonaId
  );
  return entry ? (entry[0] as Category) : null;
}

/**
 * Get default CM for a category
 */
export function getDefaultCMForCategory(category: Category): string | null {
  const info = getCategoryInfo(category);
  return info?.defaultCMPersonaId || null;
}

/**
 * Format categories for display
 * Examples:
 *   ["Steel"] => "Steel"
 *   ["Steel", "Cement"] => "Steel, Cement"
 *   ["Steel", "Cement", "Polymer"] => "Steel, Cement, Polymer"
 */
export function formatCategories(categories: Category[]): string {
  if (categories.length === 0) return "No category";
  if (categories.length === 1) return categories[0];
  return categories.join(", ");
}

/**
 * Get primary category (first category in the array)
 * Most enquiries have a single category; for multi-category enquiries,
 * the first category is considered the primary one.
 */
export function getPrimaryCategory(categories: Category[]): Category | null {
  return categories.length > 0 ? categories[0] : null;
}
