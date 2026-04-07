/**
 * Hook: useBuyerDMChannels
 * 
 * Access buyer-BDM direct message channels from the MessageContext.
 * Automatically updates when new messages arrive via realtime.
 * 
 * Performance optimizations:
 * - useMemo on filtered results to prevent recalculation on unrelated state changes
 * - Removed debug logging from hot paths
 */

import { useMemo } from "react";
import { useMessageState } from "@/infrastructure/state/MessageContext";
import { BuyerDMChannel, canAccessBuyerDM } from "@/domain/message/buyer-dm.types";

export function useBuyerDMChannels(personaId?: string): BuyerDMChannel[] {
  const messageState = useMessageState();
  
  return useMemo(() => {
    const allChannels = messageState.buyerDMChannels;
    
    // If no persona ID provided, return all channels
    if (!personaId) {
      return allChannels;
    }
    
    // Filter channels that the persona has access to
    return allChannels.filter((channel) => canAccessBuyerDM(channel, personaId));
  }, [messageState.buyerDMChannels, personaId]);
}

/**
 * Get a specific buyer DM channel by ID
 */
export function useBuyerDMChannel(channelId: string): BuyerDMChannel | undefined {
  const messageState = useMessageState();
  
  return useMemo(() => {
    if (!channelId) return undefined;
    return messageState.buyerDMChannels.find((ch) => ch.id === channelId);
  }, [messageState.buyerDMChannels, channelId]);
}

/**
 * Get buyer DM channel for a specific buyer persona
 */
export function useBuyerDMForBuyer(buyerPersonaId: string): BuyerDMChannel | undefined {
  const messageState = useMessageState();
  
  return useMemo(() => {
    if (!buyerPersonaId) return undefined;
    return messageState.buyerDMChannels.find((ch) => ch.buyerPersonaId === buyerPersonaId);
  }, [messageState.buyerDMChannels, buyerPersonaId]);
}
