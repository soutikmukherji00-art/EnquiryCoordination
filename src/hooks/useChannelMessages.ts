/**
 * Hook: Channel Messages
 * 
 * Optimized hook for getting messages for the current channel.
 * Handles both regular channels and seller channels.
 */

import { useMemo } from "react";
import { Message } from "@/domain/message/message.types";
import { SellerChannel } from "@/domain/message/message.types";

export const useChannelMessages = (
  currentChannel: string,
  messages: Message[],
  sellerChannels: SellerChannel[]
) => {
  return useMemo(() => {
    if (currentChannel.startsWith("seller-")) {
      // Seller channel
      const channel = sellerChannels.find((sc) => sc.id === currentChannel);
      return channel?.messages || [];
    }
    return messages;
  }, [currentChannel, messages, sellerChannels]);
};