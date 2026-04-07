/**
 * Domain: Seller Direct Messages
 * 
 * Handles 1:1 direct message channels between CMs and sellers.
 * Each CM-Seller pair has a separate DM conversation.
 */

import { Message } from "./message.types";

/**
 * Seller Direct Message Channel
 * Represents a 1:1 chat between a CM and a seller
 */
export interface SellerDMChannel {
  id: string;                    // Unique seller DM ID (format: seller-dm-{cmPersonaId}-{sellerId})
  sellerId: string;              // Seller ID (e.g., "s_1")
  sellerName: string;            // Seller company name
  cmPersonaId: string;           // CM's persona ID
  cmName: string;                // CM's name
  messages: Message[];           // Direct messages between CM and seller
  unread: boolean;               // Has unread messages (deprecated - use unreadForSeller/unreadForCM)
  unreadCount: number;           // Number of unread messages (deprecated - use unreadForSeller/unreadForCM)
  unreadForSeller: number;       // Number of unread messages for the seller
  unreadForCM: number;           // Number of unread messages for the CM
  hasMentions?: boolean;         // Has unread mentions for current persona
  lastActivity: Date;            // Last message timestamp
  sourceEnquiryId?: string;      // Optional: Track which enquiry this channel originated from (for UI grouping)
}

/**
 * Generate seller DM channel ID
 */
export function generateSellerDMId(cmPersonaId: string, sellerId: string): string {
  return `seller-dm-${cmPersonaId}-${sellerId}`;
}

/**
 * Parse seller DM channel ID to extract CM and seller IDs
 */
export function parseSellerDMId(dmId: string): { cmPersonaId: string; sellerId: string } | null {
  // Seller IDs always have format "s_N", so we can anchor on that pattern
  // This avoids the greedy regex issue with IDs containing hyphens (e.g., "seller-dm-p_cm_north-s_1")
  const match = dmId.match(/^seller-dm-(.+)-(s_\d+)$/);
  if (!match) return null;
  
  return {
    cmPersonaId: match[1],
    sellerId: match[2],
  };
}