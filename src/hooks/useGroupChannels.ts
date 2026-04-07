/**
 * Hook: useGroupChannels
 * 
 * Provides access to group channels from message state.
 * Handles both internal personas (whose IDs are in memberPersonaIds)
 * and external contacts (whose IDs may be in memberIds).
 */

import { useMemo } from "react";
import { useMessageState } from "@/infrastructure/state/MessageContext";
import { GroupChannel } from "@/domain/message/group.types";
import { useCurrentPersona, useCurrentRole } from "@/infrastructure/role/RoleContext";
import { getBuyerIdFromPersona } from "@/domain/buyer/buyer-persona-mapping";
import { getSellerIdByPersonaName } from "@/domain/seller/seller.types";

/**
 * Get all group channels (filtered by current user membership)
 * 
 * Checks multiple membership indicators:
 * - memberPersonaIds: For internal users (BDM, CM, CX) and some external mappings
 * - memberIds: For contact-based membership (buyer/seller contacts)
 * - createdBy: For group creators
 * - buyerId/sellerId: For groups linked to specific companies
 */
export function useGroupChannels(): GroupChannel[] {
  const messageState = useMessageState();
  const currentPersona = useCurrentPersona();
  const currentRole = useCurrentRole();
  
  return useMemo(() => {
    const allGroups = messageState.groupChannels || [];
    // Debug logging (can be removed in production)
    // console.log('[useGroupChannels] Raw state:', {
    //   allGroupsCount: allGroups.length,
    //   allGroups: allGroups.map(g => ({ 
    //     id: g.id, 
    //     name: g.name, 
    //     messageCount: g.messages?.length || 0,
    //     messages: g.messages 
    //   })),
    //   currentPersonaId: currentPersona.id,
    //   currentRole
    // });
    
    // For internal roles, check memberPersonaIds directly
    // For external roles, also check memberIds and company-level links
    return allGroups.filter(group => {
      // Check 1: persona ID in memberPersonaIds (works for all roles)
      if (group.memberPersonaIds?.includes(currentPersona.id)) return true;
      
      // Check 2: persona ID in memberIds (fallback)
      if (group.memberIds?.includes(currentPersona.id)) return true;
      
      // Check 3: Group created by this persona
      if (group.createdBy === currentPersona.id) return true;
      
      // For Buyer role: also check buyer-specific mappings
      if (currentRole === "Buyer") {
        // Check if buyer's mapped ID is in memberIds
        const buyerId = getBuyerIdFromPersona(currentPersona.id);
        if (buyerId && group.memberIds?.includes(buyerId)) return true;
        if (buyerId && group.buyerId === buyerId) return true;
        // Also check if buyerId is in memberPersonaIds (added on invite acceptance)
        if (buyerId && group.memberPersonaIds?.includes(buyerId)) return true;
      }
      
      // For Seller role: also check seller-specific mappings
      if (currentRole === "Seller") {
        // getSellerIdByPersonaName returns the canonical s_1 format used in groups
        const sellerId = getSellerIdByPersonaName(currentPersona.displayName);
        if (sellerId && group.memberIds?.includes(sellerId)) return true;
        if (sellerId && group.sellerId === sellerId) return true;
        // Check if sellerId (s_1 format) was added to memberPersonaIds on invite acceptance
        if (sellerId && group.memberPersonaIds?.includes(sellerId)) return true;
      }
      
      return false;
    });
  }, [messageState.groupChannels, currentPersona.id, currentPersona.displayName, currentRole]);
}

/**
 * Get group channels filtered by status (and current user membership)
 */
export function useGroupChannelsByStatus(status: "pending" | "active" | "rejected"): GroupChannel[] {
  const allGroups = useGroupChannels();
  
  return useMemo(() => {
    return allGroups.filter(group => group.status === status);
  }, [allGroups, status]);
}

/**
 * Get pending group channels
 */
export function usePendingGroupChannels(): GroupChannel[] {
  return useGroupChannelsByStatus("pending");
}

/**
 * Get active group channels
 */
export function useActiveGroupChannels(): GroupChannel[] {
  return useGroupChannelsByStatus("active");
}