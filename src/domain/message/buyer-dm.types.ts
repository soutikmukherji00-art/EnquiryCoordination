/**
 * Domain: Buyer Direct Messages
 * 
 * Handles 1:1 direct message channels between buyers and their BDMs.
 * These are separate from enquiry channels.
 */

import { Message } from "./message.types";

/**
 * Buyer Direct Message Channel
 * Represents a 1:1 chat between a buyer and their BDM
 */
export interface BuyerDMChannel {
  id: string;                    // Unique DM channel ID (format: buyer-dm-{buyerPersonaId})
  buyerPersonaId: string;        // Buyer's persona ID
  buyerName: string;             // Buyer's company name
  bdmPersonaId: string;          // BDM's persona ID
  bdmName: string;               // BDM's name
  messages: Message[];           // Direct messages
  unread: boolean;               // Has unread messages (deprecated - use unreadForBuyer/unreadForBDM)
  unreadCount: number;           // Number of unread messages (deprecated - use unreadForBuyer/unreadForBDM)
  unreadForBuyer: number;        // Number of unread messages for the buyer
  unreadForBDM: number;          // Number of unread messages for the BDM
  hasMentions?: boolean;         // Has unread mentions for current persona
  lastActivity: Date;            // Last message timestamp
}

/**
 * Generate buyer DM channel ID
 */
export function generateBuyerDMId(buyerPersonaId: string): string {
  return `dm-${buyerPersonaId}`;
}

/**
 * Create a new buyer DM channel
 */
export function createBuyerDMChannel(
  buyerPersonaId: string,
  buyerName: string,
  bdmPersonaId: string,
  bdmName: string
): BuyerDMChannel {
  return {
    id: generateBuyerDMId(buyerPersonaId),
    buyerPersonaId,
    buyerName,
    bdmPersonaId,
    bdmName,
    messages: [],
    unread: false,
    unreadCount: 0,
    unreadForBuyer: 0,
    unreadForBDM: 0,
    lastActivity: new Date(),
  };
}

/**
 * Check if user has access to a buyer DM channel
 */
export function canAccessBuyerDM(
  channel: BuyerDMChannel,
  personaId: string
): boolean {
  return (
    channel.buyerPersonaId === personaId ||
    channel.bdmPersonaId === personaId
  );
}