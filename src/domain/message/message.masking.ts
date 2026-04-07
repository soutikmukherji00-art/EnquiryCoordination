/**
 * Domain: Message Masking
 * 
 * Business logic for masking seller identities when sharing to internal channels.
 * Pure functions with no side effects.
 */

import { Message, UserRole } from "./message.types";
import { APP_CONFIG } from "@/domain/utils/constants";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

/**
 * Determines if seller masking should be applied
 */
export const shouldMaskSeller = (
  fromChannel: string,
  toChannel: string
): boolean => {
  return fromChannel.startsWith("seller-") && toChannel === "internal";
};

/**
 * Applies seller masking to a message
 */
export const maskSellerMessage = (message: Message): Message => {
  return {
    ...message,
    masked: true,
    displaySender: "Seller response",
    sender: undefined, // Hide actual seller name
  };
};

/**
 * Determines if internal masking should be applied (internal → external)
 */
export const shouldMaskInternal = (
  fromChannel: string,
  toChannel: string
): boolean => {
  return (
    fromChannel === "internal" &&
    (toChannel === "buyer" || toChannel === "seller")
  );
};

/**
 * Makes message appear as if current user sent it (strips sharing metadata)
 */
export const maskInternalMessage = (
  message: Message,
  currentUser: string,
  currentRole: UserRole
): Message => {
  return {
    ...message,
    sender: stripRoleSuffix(currentUser),
    senderRole: currentRole,
    type: "user",
    sharedFrom: undefined,
  };
};

/**
 * NEW: Mask internal user messages as "Birla Pivot" in seller groups
 * Used when displaying messages in seller groups to external sellers
 * 
 * @param message - The message to potentially mask
 * @param viewerRole - The role of the person viewing the message
 * @param isSellerGroup - Whether this is a seller group context
 * @returns Masked or original message
 */
export const maskInternalForSellerGroup = (
  message: Message,
  viewerRole?: string,
  isSellerGroup: boolean = false
): Message => {
  // Only mask if:
  // 1. This is a seller group
  // 2. The viewer is a seller (external)
  // 3. The message is from an internal user (CM, BDM, CX)
  if (!isSellerGroup || viewerRole !== "Seller") {
    return message;
  }
  
  const internalRoles = ["CM", "BDM", "CX"];
  const isInternalMessage = message.senderRole && internalRoles.includes(message.senderRole);
  
  if (isInternalMessage) {
    return {
      ...message,
      sender: APP_CONFIG.COMPANY_NAME, // "Birla Pivot"
      displaySender: APP_CONFIG.COMPANY_NAME,
      masked: true,
    };
  }
  
  return message;
};

/**
 * Applies appropriate masking based on routing context
 */
export const applyMasking = (
  message: Message,
  fromChannel: string,
  toChannel: string,
  currentUser: string,
  currentRole: UserRole
): Message => {
  if (shouldMaskSeller(fromChannel, toChannel)) {
    return maskSellerMessage(message);
  }

  if (shouldMaskInternal(fromChannel, toChannel)) {
    return maskInternalMessage(message, currentUser, currentRole);
  }

  return message;
};
