/**
 * Hook: Channel Mentions
 * 
 * Detects unread mentions for specific channels (not just internal)
 * Supports enquiry channels, buyer DMs, and seller DMs
 */

import { useMemo } from "react";
import { Message } from "@/domain/message/message.types";
import { hasUnreadMentions } from "@/domain/utils/mention-utils";

/**
 * Check if a specific channel has unread mentions for a persona
 */
export function useChannelMentions(
  messages: Message[],
  personaId: string
): boolean {
  return useMemo(() => {
    if (!personaId || !messages) return false;
    return hasUnreadMentions(messages, personaId);
  }, [messages, personaId]);
}

/**
 * Get mention state for all channels in an enquiry
 */
export function useEnquiryChannelsMentions(
  enquiryId: string,
  channels: { id: string; messages: Message[] }[],
  personaId: string
): Record<string, boolean> {
  return useMemo(() => {
    const mentionMap: Record<string, boolean> = {};
    
    channels.forEach(channel => {
      mentionMap[channel.id] = hasUnreadMentions(channel.messages, personaId);
    });
    
    return mentionMap;
  }, [channels, personaId, enquiryId]);
}

/**
 * Check if buyer DM has unread mentions
 */
export function useBuyerDMMentions(
  buyerDMMessages: Message[],
  personaId: string
): boolean {
  return useMemo(() => {
    if (!personaId || !buyerDMMessages) return false;
    return hasUnreadMentions(buyerDMMessages, personaId);
  }, [buyerDMMessages, personaId]);
}

/**
 * Check if seller DM has unread mentions
 */
export function useSellerDMMentions(
  sellerDMMessages: Message[],
  personaId: string
): boolean {
  return useMemo(() => {
    if (!personaId || !sellerDMMessages) return false;
    return hasUnreadMentions(sellerDMMessages, personaId);
  }, [sellerDMMessages, personaId]);
}
