/**
 * Domain: Seller Fan-Out
 * 
 * Pure business logic for sending messages to multiple sellers simultaneously.
 * Creates individual seller channels and distributes messages.
 */

import { Message } from "../message/message.types";
import { Seller, findSellerById } from "./seller.types";
import { SellerChannel } from "../message/message.types";

export interface FanOutResult {
  newChannels: SellerChannel[];
  messagesToAdd: Array<{
    sellerId: string;
    messages: Message[];
  }>;
}

/**
 * Prepares messages for fan-out to multiple sellers
 * Pure function - no side effects
 */
export const prepareFanOut = (
  sellerIds: string[],
  messages: Message[],
  enquiryId: string,
  timestamp: Date,
  existingChannels: SellerChannel[]
): FanOutResult => {
  const newChannels: SellerChannel[] = [];
  const messagesToAdd: Array<{ sellerId: string; messages: Message[] }> = [];
  
  // Generate a unique base timestamp once to avoid duplicates
  const baseTimestamp = Date.now();

  sellerIds.forEach((sellerId, sellerIndex) => {
    const seller = findSellerById(sellerId);
    if (!seller) return;

    // Check if channel already exists
    const channelExists = existingChannels.some((ch) => ch.sellerId === sellerId);

    if (!channelExists) {
      // Create new channel
      newChannels.push({
        id: `seller-${sellerId}`,
        sellerId,
        sellerName: seller.name,
        enquiryId,
        messages: [],
        unread: false,
      });
    }

    // Prepare messages for this seller (with unique IDs)
    // Use sellerIndex to ensure uniqueness across sellers
    const sellerMessages = messages.map((msg, index) => ({
      ...msg,
      id: `shr-${baseTimestamp}-${sellerId}-${msg.id}-s${sellerIndex}-i${index}`,
      timestamp,
    }));

    messagesToAdd.push({
      sellerId,
      messages: sellerMessages,
    });
  });

  return {
    newChannels,
    messagesToAdd,
  };
};

/**
 * Creates a single seller channel with initial message
 */
export const createSellerChannel = (
  sellerId: string,
  enquiryId: string,
  initialMessage?: Message
): SellerChannel | null => {
  const seller = findSellerById(sellerId);
  if (!seller) return null;

  return {
    id: `seller-${sellerId}`,
    sellerId,
    sellerName: seller.name,
    enquiryId,
    messages: initialMessage ? [initialMessage] : [],
    unread: false,
  };
};

/**
 * Checks if a seller channel already exists
 */
export const sellerChannelExists = (
  existingChannels: SellerChannel[],
  sellerId: string
): boolean => {
  return existingChannels.some((ch) => ch.sellerId === sellerId);
};