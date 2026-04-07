/**
 * Hooks: Seller Groups
 * 
 * React hooks for accessing and managing seller groups
 */

import { useMessageStore } from "@/app/AppProviders";
import { GroupChannel } from "@/domain/message/group.types";
import { useMemo } from "react";

/**
 * Get all seller groups visible to a specific CM
 * Only returns groups where the CM is a member
 */
export function useSellerGroups(cmPersonaId?: string): GroupChannel[] {
  const { state } = useMessageStore();
  
  return useMemo(() => {
    // Get all seller-type groups
    const sellerGroups = state.groupChannels.filter(g => g.type === "seller");
    
    // If no persona ID provided, return all seller groups
    if (!cmPersonaId) {
      return sellerGroups;
    }
    
    // Filter by CM membership - only show groups where this CM is a member
    return sellerGroups.filter(group =>
      group.memberPersonaIds.includes(cmPersonaId)
    );
  }, [state.groupChannels, cmPersonaId]);
}

/**
 * Get a specific seller group by ID
 */
export function useSellerGroup(groupId: string): GroupChannel | undefined {
  const { state } = useMessageStore();
  
  return useMemo(() => {
    return state.groupChannels.find(g => g.id === groupId && g.type === "seller");
  }, [state.groupChannels, groupId]);
}

/**
 * Get all seller groups for a specific seller
 * Returns all groups where the seller is a member
 */
export function useSellerGroupsForSeller(sellerId: string): GroupChannel[] {
  const { state } = useMessageStore();
  
  return useMemo(() => {
    return state.groupChannels.filter(
      g => g.type === "seller" && g.sellerId === sellerId
    );
  }, [state.groupChannels, sellerId]);
}

/**
 * Check if a CM can create seller groups
 * CMs can always create seller groups (auto-approved)
 */
export function useCanCreateSellerGroups(personaRole?: string): boolean {
  return personaRole === "CM";
}
