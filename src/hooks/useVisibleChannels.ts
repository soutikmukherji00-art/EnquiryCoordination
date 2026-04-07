/**
 * Hook: Visible Channels
 * 
 * Optimized hook for computing all visible channels including seller channels.
 * Memoizes results to prevent unnecessary recalculations.
 */

import { useMemo } from "react";
import { Channel } from "@/domain/message/message.types";
import { SellerChannel } from "@/domain/message/message.types";

export const useVisibleChannels = (
  visibleChannels: Channel[],
  sellerChannels: SellerChannel[],
  canCreateSellerChannels: boolean
) => {
  // Combined channels (static + seller channels)
  const allChannels = useMemo(() => {
    const channels = [...visibleChannels];
    
    // Add seller channels for CM role (using policy hook)
    if (canCreateSellerChannels) {
      sellerChannels.forEach((sc) => {
        channels.push({
          id: sc.id,
          label: sc.sellerName,
          icon: null,
          unread: false,
          type: "communication" as const,
        });
      });
    }

    return channels;
  }, [visibleChannels, sellerChannels, canCreateSellerChannels]);

  // Available channels for sharing (convert to simple format for ConversationPanel)
  const availableChannelsSimple = useMemo(() => {
    return allChannels.map(ch => ({ id: ch.id, label: ch.label }));
  }, [allChannels]);

  return { allChannels, availableChannelsSimple };
};