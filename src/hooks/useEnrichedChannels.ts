/**
 * useEnrichedChannels Hook
 * 
 * Enriches channel data with mention indicators and other metadata
 */

import { useMemo } from "react";
import { hasUnreadMentions } from "@/domain/utils/mention-utils";
import { Channel } from "@/domain/message/message.types";

export interface EnrichedChannel extends Channel {
  hasMentions: boolean;
}

interface UseEnrichedChannelsParams {
  channels: Channel[];
  selectedEnquiryId: string | null;
  currentPersonaId: string;
  messagesByEnquiry: Record<string, Record<string, any[]>>;
}

/**
 * Enriches channels with mention indicators
 */
export function useEnrichedChannels({
  channels,
  selectedEnquiryId,
  currentPersonaId,
  messagesByEnquiry,
}: UseEnrichedChannelsParams): EnrichedChannel[] {
  return useMemo(() => {
    if (!selectedEnquiryId) {
      // No enquiry selected, return channels without mention flags
      return channels.map(channel => ({
        ...channel,
        hasMentions: false,
      }));
    }

    return channels.map(channel => {
      // Get messages for this channel from the full message state
      const channelMessages = messagesByEnquiry[selectedEnquiryId]?.[channel.id] || [];
      
      // Check if current persona has unread mentions in this channel
      const channelHasMentions = hasUnreadMentions(channelMessages, currentPersonaId);
      
      return {
        ...channel,
        hasMentions: channelHasMentions,
      };
    });
  }, [channels, messagesByEnquiry, currentPersonaId, selectedEnquiryId]);
}
