/**
 * Category domain - Public API
 */

export type { Category, CategoryInfo } from "./category.types";
export {
  CATEGORY_REGISTRY,
  getAllCategories,
  getCategoryInfo,
  isValidCategory,
  getCategoryByCMPersonaId,
  getDefaultCMForCategory,
  formatCategories,
  getPrimaryCategory,
} from "./category.types";