/**
 * Mapping between Buyer/Seller Personas and Mock Buyer/Seller/Contact data
 * 
 * This maps external buyer/seller personas (companies) to their contact lists
 * 
 * BUYER PERSONAS (from persona.data.ts):
 * - p_buyer_1: Ramesh Industries
 * - p_buyer_2: Global Manufacturing Ltd
 * - p_buyer_3: TechnoSteel Corp
 * 
 * SELLER PERSONAS (from persona.data.ts):
 * - p_seller_1: Suresh Industries
 * - p_seller_2: Om Steel Traders (inactive)
 * - p_seller_3: Rathi Metals
 * - p_seller_4: Apex Alloys
 * - p_seller_5: National Steel Corp (inactive)
 */

/**
 * Map buyer persona ID to buyer data ID
 */
export const BUYER_PERSONA_TO_BUYER_MAP: Record<string, string> = {
  "p_buyer_1": "buyer_1", // Ramesh Industries
  "p_buyer_2": "buyer_2", // Global Manufacturing Ltd
  "p_buyer_3": "buyer_3", // TechnoSteel Corp
};

/**
 * Map seller persona ID to seller data ID
 */
export const SELLER_PERSONA_TO_SELLER_MAP: Record<string, string> = {
  "p_seller_1": "seller_1", // Suresh Industries
  "p_seller_2": "seller_2", // Om Steel Traders (inactive)
  "p_seller_3": "seller_3", // Rathi Metals
  "p_seller_4": "seller_4", // Apex Alloys
  "p_seller_5": "seller_5", // National Steel Corp (inactive)
};

/**
 * Get buyer data ID from buyer persona ID
 */
export const getBuyerIdFromPersona = (personaId: string): string | undefined => {
  return BUYER_PERSONA_TO_BUYER_MAP[personaId];
};

/**
 * Get seller data ID from seller persona ID
 */
export const getSellerIdFromPersona = (personaId: string): string | undefined => {
  return SELLER_PERSONA_TO_SELLER_MAP[personaId];
};

/**
 * Get buyer persona ID from buyer data ID
 */
export const getBuyerPersonaFromBuyerId = (buyerId: string): string | undefined => {
  return Object.entries(BUYER_PERSONA_TO_BUYER_MAP).find(([_, id]) => id === buyerId)?.[0];
};

/**
 * Get seller persona ID from seller data ID
 */
export const getSellerPersonaFromSellerId = (sellerId: string): string | undefined => {
  return Object.entries(SELLER_PERSONA_TO_SELLER_MAP).find(([_, id]) => id === sellerId)?.[0];
};
