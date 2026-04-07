/**
 * Domain: Group Utilities
 * 
 * Helper functions for group channel operations
 */

import { GroupMember } from "./group.types";
import { getBuyerById } from "@/domain/buyer/buyer.mock-data";
import { APP_CONFIG } from "@/domain/utils/constants";

/**
 * Generate a group name based on members
 * - If single buyer selected: "{BuyerName} <> Birla Pivot"
 * - If multiple buyers selected: "Group - Multiple Buyers"
 * - If no buyers: "Custom Group"
 */
export function generateGroupName(members: GroupMember[]): string {
  // Get all unique buyer IDs from contacts
  const buyerIds = new Set<string>();
  members.forEach((member) => {
    if (member.type === "contact" && member.buyerId) {
      buyerIds.add(member.buyerId);
    }
  });

  const buyerIdArray = Array.from(buyerIds);

  if (buyerIdArray.length === 0) {
    // No buyers - custom group
    return "Custom Group";
  } else if (buyerIdArray.length === 1) {
    // Single buyer - use buyer name
    const buyer = getBuyerById(buyerIdArray[0]);
    if (buyer) {
      return `${buyer.name} <> ${APP_CONFIG.COMPANY_NAME}`;
    }
    return "Buyer Group";
  } else {
    // Multiple buyers
    return "Group - Multiple Buyers";
  }
}

/**
 * Generate a unique group ID
 */
export function generateGroupId(): string {
  return `group_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}