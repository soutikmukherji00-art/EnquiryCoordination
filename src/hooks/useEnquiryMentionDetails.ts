/**
 * Hook: Enquiry Mention Details
 * 
 * Provides detailed mention state for an enquiry's channels
 * Returns which specific channels have unread mentions
 */

import { useState, useEffect } from "react";
import { useAppStore } from "./useAppStore";
import { hasUnreadMentions } from "@/domain/utils/mention-utils";

export interface EnquiryMentionDetails {
  hasAnyMentions: boolean;
  buyerChannelMentions: boolean;
  sellerChannelMentions: boolean;
  internalChannelMentions: boolean;
  sellerDMChannelMentions: Record<string, boolean>; // sellerDMId -> hasMentions
}

/**
 * Get detailed mention state for a specific enquiry
 */
export function useEnquiryMentionDetails(
  enquiryId: string | null,
  personaId: string,
  sellerDMIds: string[] = []
): EnquiryMentionDetails {
  const { dataStore } = useAppStore();
  const [details, setDetails] = useState<EnquiryMentionDetails>({
    hasAnyMentions: false,
    buyerChannelMentions: false,
    sellerChannelMentions: false,
    internalChannelMentions: false,
    sellerDMChannelMentions: {},
  });

  useEffect(() => {
    if (!enquiryId || !personaId) {
      setDetails({
        hasAnyMentions: false,
        buyerChannelMentions: false,
        sellerChannelMentions: false,
        internalChannelMentions: false,
        sellerDMChannelMentions: {},
      });
      return;
    }

    const checkMentions = async () => {
      let buyerMentions = false;
      let sellerMentions = false;
      let internalMentions = false;
      const sellerDMMentions: Record<string, boolean> = {};

      // Check buyer channel
      try {
        const buyerMessages = await dataStore.getMessages(enquiryId, "buyer");
        buyerMentions = hasUnreadMentions(buyerMessages, personaId);
      } catch (err) {
        // Channel not accessible
      }

      // Check seller channel  
      try {
        const sellerMessages = await dataStore.getMessages(enquiryId, "seller");
        sellerMentions = hasUnreadMentions(sellerMessages, personaId);
      } catch (err) {
        // Channel not accessible
      }

      // Check internal channel
      try {
        const internalMessages = await dataStore.getMessages(enquiryId, "internal");
        internalMentions = hasUnreadMentions(internalMessages, personaId);
      } catch (err) {
        // Channel not accessible
      }

      // Check seller DM channels
      for (const sellerDMId of sellerDMIds) {
        try {
          const sellerDM = await dataStore.getSellerDMChannel(sellerDMId);
          if (sellerDM) {
            sellerDMMentions[sellerDMId] = hasUnreadMentions(sellerDM.messages, personaId);
          }
        } catch (err) {
          sellerDMMentions[sellerDMId] = false;
        }
      }

      setDetails({
        hasAnyMentions: buyerMentions || sellerMentions || internalMentions || Object.values(sellerDMMentions).some(v => v),
        buyerChannelMentions: buyerMentions,
        sellerChannelMentions: sellerMentions,
        internalChannelMentions: internalMentions,
        sellerDMChannelMentions: sellerDMMentions,
      });
    };

    checkMentions();
  }, [enquiryId, personaId, dataStore, sellerDMIds.join(',')]);

  return details;
}
