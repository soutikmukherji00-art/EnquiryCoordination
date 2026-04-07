/**
 * Hook: Mention Detection
 * 
 * Detects unread mentions for the current user across enquiries.
 * Checks ALL channels (buyer, seller, internal) for comprehensive mention tracking.
 * 
 * Performance optimizations:
 * - Uses MessageContext state directly (synchronous, no async waterfall)
 * - useMemo instead of useState+useEffect pattern (eliminates extra render cycle)
 * - Early exit when no mentions found in a channel
 */

import { useMemo } from "react";
import { useMessageState } from "@/infrastructure/state/MessageContext";
import { Enquiry } from "@/domain/enquiry/enquiry.types";
import { hasUnreadMentions } from "@/domain/utils/mention-utils";

interface MentionMap {
  [enquiryId: string]: boolean; // true if has unread mentions in ANY channel
}

const CHANNELS_TO_CHECK = ["buyer", "seller", "internal"];

export const useMentionDetection = (
  enquiries: Enquiry[],
  currentPersonaId: string
): MentionMap => {
  const messageState = useMessageState();

  return useMemo(() => {
    if (!currentPersonaId || enquiries.length === 0) {
      return {};
    }

    const newMap: MentionMap = {};

    for (const enquiry of enquiries) {
      let hasUnread = false;
      const enquiryMessages = messageState.messages[enquiry.id];

      if (enquiryMessages) {
        for (const channelId of CHANNELS_TO_CHECK) {
          const channelMessages = enquiryMessages[channelId];
          if (channelMessages && channelMessages.length > 0 && hasUnreadMentions(channelMessages, currentPersonaId)) {
            hasUnread = true;
            break;
          }
        }
      }

      newMap[enquiry.id] = hasUnread;
    }

    return newMap;
  }, [enquiries, currentPersonaId, messageState.messages]);
};
