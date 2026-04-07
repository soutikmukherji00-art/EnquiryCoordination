/**
 * Hook: Seller DM Channels
 * 
 * Retrieves all seller DM channels for a specific seller.
 * This is used when viewing as a Seller persona to see all their conversations with CMs.
 * 
 * Performance optimizations:
 * - Debug logging removed from hot paths
 * - All hooks use useMemo for stable references
 */

import { useMemo, useCallback } from "react";
import { useMessageState, useMessageDispatch } from "@/infrastructure/state/MessageContext";
import { SellerDMChannel, generateSellerDMId } from "@/domain/message/seller-dm.types";
import { useAppStore } from "./useAppStore";
import { Message } from "@/domain/message/message.types";
import { SellerDMMessageSentEvent } from "@/domain/message/message.events";
import { UserRole } from "@/domain/user/user.types";
import { sellerLogger } from "@/domain/utils/logger";
import { safeAsync } from "@/domain/utils/error-handler";
import { validateMessageContent, isValidSellerId } from "@/domain/utils/type-guards";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

/**
 * Get all seller DM channels for a specific seller
 */
export function useSellerDMChannels(sellerId: string): SellerDMChannel[] {
  const messageState = useMessageState();

  return useMemo(() => {
    if (!sellerId) return [];
    return messageState.sellerDMChannels.filter(ch => ch.sellerId === sellerId);
  }, [messageState.sellerDMChannels, sellerId]);
}

/**
 * Get all seller DM channels for a specific CM
 * NEW MODEL: All CMs see ALL seller DM channels (shared conversations)
 */
export function useSellerDMChannelsForCM(cmPersonaId: string): SellerDMChannel[] {
  const messageState = useMessageState();

  return useMemo(() => {
    if (!cmPersonaId) return [];
    // Return ALL seller DM channels - all CMs see the same conversations
    return messageState.sellerDMChannels;
  }, [messageState.sellerDMChannels, cmPersonaId]);
}

/**
 * Get seller DM channels for a specific enquiry and CM
 */
export function useSellerDMChannelsForEnquiry(enquiryId: string, cmPersonaId: string): SellerDMChannel[] {
  const messageState = useMessageState();

  return useMemo(() => {
    if (!enquiryId || !cmPersonaId) return [];
    return messageState.sellerDMChannels.filter(
      ch => ch.cmPersonaId === cmPersonaId && ch.sourceEnquiryId === enquiryId
    );
  }, [messageState.sellerDMChannels, enquiryId, cmPersonaId]);
}

/**
 * Get messages for a specific seller DM channel
 */
export function useSellerDMMessages(channelId: string) {
  const messageState = useMessageState();

  return useMemo(() => {
    if (!channelId) return [];
    const channel = messageState.sellerDMChannels.find(ch => ch.id === channelId);
    return channel?.messages || [];
  }, [messageState.sellerDMChannels, channelId]);
}

/**
 * Send a message in a seller DM channel
 * Creates the channel if it doesn't exist yet
 */
export function useSendSellerDMMessage() {
  const { realtimeService } = useAppStore();
  const messageDispatch = useMessageDispatch();
  const messageState = useMessageState();

  const sendSellerDMMessage = useCallback(
    async (
      sellerId: string,
      sellerName: string,
      cmPersonaId: string,
      cmName: string,
      content: string,
      sender: string,
      senderRole: UserRole,
      attachment?: { name: string; type: string; url?: string },
      audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
      mentions?: string[],
      sourceEnquiryId?: string, // Track which enquiry this channel originated from
      senderPersonaId?: string // Track persona ID for mention tracking
      ) => {
      const normalizedSender = stripRoleSuffix(sender);

      // Validate seller ID
      if (!isValidSellerId(sellerId)) {
        sellerLogger.error('Invalid seller ID provided:', sellerId);
        throw new Error(`Invalid seller ID: ${sellerId}`);
      }

      // Validate message content
      validateMessageContent(content);

      // Generate seller DM ID using the canonical function
      const sellerDMId = generateSellerDMId(cmPersonaId, sellerId);
      
      // Check if channel exists, if not create it
      const channelExists = messageState.sellerDMChannels.some(ch => ch.id === sellerDMId);
      
      if (!channelExists) {
        // Create channel event
        const createChannelEvent = {
          type: "SELLER_DM_CHANNEL_CREATED" as const,
          payload: {
            sellerDMId,
            sellerId,
            sellerName,
            cmPersonaId,
            cmName,
            createdBy: normalizedSender,
            timestamp: new Date(),
            sourceEnquiryId,
          },
        };
        
        // Dispatch channel creation
        messageDispatch(createChannelEvent);
        await realtimeService.publish(createChannelEvent);
      }
      
      // Create message
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "user",
        sender: normalizedSender,
        senderPersonaId,
        senderRole,
        content,
        timestamp: new Date(),
        attachment,
        mentions,
        audioRecording: audioRecording ? {
          audioUrl: audioRecording.audioUrl,
          transcription: audioRecording.transcription,
          duration: audioRecording.duration,
        } : undefined,
      };

      const event: SellerDMMessageSentEvent = {
        type: "SELLER_DM_MESSAGE_SENT",
        payload: {
          sellerDMId,
          message,
          timestamp: new Date(),
        },
      };

      // Dispatch directly to MessageContext (single source of truth)
      messageDispatch(event);
      
      // Broadcast to other clients via realtime (for multi-user scenarios)
      await realtimeService.publish(event);
    },
    [realtimeService, messageDispatch, messageState.sellerDMChannels]
  );

  return {
    sendSellerDMMessage,
  };
}
