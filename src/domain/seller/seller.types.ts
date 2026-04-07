/**
 * Domain: Seller
 * 
 * Core seller entity and directory.
 */

export interface Seller {
  id: string;
  name: string;
  isActive?: boolean;
  avgResponseTimeMinutes?: number;
}

// Mock seller directory
export const SELLERS: Seller[] = [
  { id: "s_1", name: "Suresh Industries", isActive: true, avgResponseTimeMinutes: 8 },
  { id: "s_2", name: "Om Steel Traders", isActive: false, avgResponseTimeMinutes: 25 },
  { id: "s_3", name: "Rathi Metals", isActive: true, avgResponseTimeMinutes: 5 },
  { id: "s_4", name: "Apex Alloys", isActive: true, avgResponseTimeMinutes: 12 },
  { id: "s_5", name: "National Steel Corp", isActive: false, avgResponseTimeMinutes: 45 },
];

// CM directory for tagging
export interface CMUser {
  id: string;
  name: string;
}

export const CM_USERS: CMUser[] = [
  { id: "cm_1", name: "Priya Sharma" },
  { id: "cm_2", name: "Rajesh Kumar" },
  { id: "cm_3", name: "Neha Gupta" },
];

/**
 * Map seller names to seller IDs
 */
export const getSellerIdByName = (name: string): string | undefined => {
  const seller = SELLERS.find((s) => s.name === name);
  return seller?.id;
};

/**
 * Find seller by ID
 */
export const findSellerById = (sellerId: string): Seller | undefined => {
  return SELLERS.find((s) => s.id === sellerId);
};

/**
 * Map persona display names to seller IDs
 * This is used when a seller persona logs in and needs to see their channels
 */
export const getSellerIdByPersonaName = (personaDisplayName: string): string | undefined => {
  // Remove any role suffix like " (Seller)"
  const cleanName = personaDisplayName.replace(/\s*\(.*?\)\s*$/g, '').trim();
  return getSellerIdByName(cleanName);
};

/**
 * Map seller IDs to persona IDs for reference
 * This mapping is derived from persona names matching seller names
 */
export const SELLER_TO_PERSONA_MAP: Record<string, string> = {
  "s_1": "p_seller_1", // Suresh Industries
  "s_2": "p_seller_2", // Om Steel Traders
  "s_3": "p_seller_3", // Rathi Metals
  "s_4": "p_seller_4", // Apex Alloys
  "s_5": "p_seller_5", // National Steel Corp
};

/**
 * Cross-mapping between SELLERS (s_N) and MOCK_SELLERS (seller_N) ID formats.
 * 
 * Both data sources represent the same companies but use different ID schemes:
 * - SELLERS in seller.types.ts uses "s_N" (used for group sellerId, DM channels)
 * - MOCK_SELLERS in seller.mock-data.ts uses "seller_N" (used for contacts, invite companyId)
 * 
 * This mapping eliminates the fragile name-based cross-referencing that was previously needed.
 */
export const SELLER_ID_TO_DATA_ID_MAP: Record<string, string> = {
  "s_1": "seller_1", // Suresh Industries
  "s_2": "seller_2", // Om Steel Traders
  "s_3": "seller_3", // Rathi Metals
  "s_4": "seller_4", // Apex Alloys
  "s_5": "seller_5", // National Steel Corp
};

/**
 * Convert seller ID (s_N) to seller data ID (seller_N) for MOCK_SELLERS lookup
 */
export const getSellerDataId = (sellerId: string): string | undefined => {
  return SELLER_ID_TO_DATA_ID_MAP[sellerId];
};

/**
 * Convert seller data ID (seller_N) to seller ID (s_N) for SELLERS lookup
 */
export const getSellerIdFromDataId = (sellerDataId: string): string | undefined => {
  return Object.entries(SELLER_ID_TO_DATA_ID_MAP).find(([_, dataId]) => dataId === sellerDataId)?.[0];
};