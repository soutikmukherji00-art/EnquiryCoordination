/**
 * Hook: Seller Channels
 * 
 * Manages dynamic seller channels and fan-out messaging.
 * Uses MessageContext for reactive updates across roles.
 */

import { useCallback, useMemo } from "react";
import { useAppStore } from "./useAppStore";
import { useMessageState, useMessageDispatch } from "@/infrastructure/state/MessageContext";
import { SellerChannel, Message, UserRole } from "@/domain/message/message.types";
import { MessageEvent } from "@/domain/message/message.events";
import { prepareFanOut } from "@/domain/seller/seller.fanout";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

const __DEV_LOG__ = false;
const devLog = __DEV_LOG__ ? (label: string, data?: any) => console.log(label, data) : (() => {}) as (label: string, data?: any) => void;

export const useSellerChannels = (enquiryId: string) => {
  const { dataStore, realtimeService } = useAppStore();
  const messageState = useMessageState();
  const messageDispatch = useMessageDispatch();

  // Get seller channels from MessageContext (reactive to realtime updates)
  const sellerChannels = useMemo(() => {
    return messageState.sellerChannels[enquiryId] || [];
  }, [messageState, enquiryId]);
  
  devLog('[useSellerChannels] Channels from context:', {
    enquiryId,
    channelCount: sellerChannels.length,
    channels: sellerChannels.map(ch => ({ id: ch.id, name: ch.sellerName }))
  });

  // Create seller channel
  const createSellerChannel = useCallback(
    async (sellerId: string, sellerName: string, createdBy: string, createdByRole: string) => {
      const normalizedCreatedBy = stripRoleSuffix(createdBy);
      devLog('[createSellerChannel] Creating channel:', { sellerId, sellerName, createdBy: normalizedCreatedBy, createdByRole });
      
      const event: MessageEvent = {
        type: "SELLER_CHANNEL_CREATED",
        payload: {
          enquiryId,
          sellerId,
          sellerName,
          createdBy: normalizedCreatedBy,
          createdByRole,
          timestamp: new Date(),
        },
      };

      // Dispatch directly to MessageContext (single source of truth)
      messageDispatch(event);
      
      // Broadcast to other clients via realtime (for multi-user scenarios)
      await realtimeService.publish(event);
    },
    [realtimeService, messageDispatch, enquiryId]
  );

  // Fan-out messages to multiple sellers
  const fanOutMessages = useCallback(
    async (sellerIds: string[], content: string, sender: string, senderRole: UserRole) => {
      const normalizedSender = stripRoleSuffix(sender);
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "user",
        sender: normalizedSender,
        senderRole,
        content,
        timestamp: new Date(),
      };

      // Prepare fan-out
      const result = prepareFanOut(sellerIds, [message], enquiryId, new Date(), sellerChannels);

      // Create new channels if needed
      for (const channel of result.newChannels) {
        const createEvent: MessageEvent = {
          type: "SELLER_CHANNEL_CREATED",
          payload: {
            enquiryId,
            sellerId: channel.sellerId,
            sellerName: channel.sellerName,
            createdBy: normalizedSender,
            createdByRole: senderRole,
            timestamp: new Date(),
          },
        };
        
        // Dispatch directly to MessageContext (single source of truth)
        messageDispatch(createEvent);
        await realtimeService.publish(createEvent);
      }

      // Send fan-out event
      const fanOutEvent: MessageEvent = {
        type: "MESSAGES_FAN_OUT",
        payload: {
          enquiryId,
          fromChannel: "seller",
          sellerIds,
          messages: [message],
          sentBy: normalizedSender,
          sentByRole: senderRole,
          timestamp: new Date(),
        },
      };

      // Dispatch directly to MessageContext (single source of truth)
      messageDispatch(fanOutEvent);
      await realtimeService.publish(fanOutEvent);
    },
    [realtimeService, messageDispatch, enquiryId, sellerChannels]
  );

  // Send message to specific seller channel
  const sendToSellerChannel = useCallback(
    async (
      sellerId: string,
      content: string,
      sender: string,
      senderRole: UserRole,
      attachment?: { name: string; type: string; url?: string },
      audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number }
    ) => {
      const channelId = `seller-${sellerId}`;
      
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "user",
        sender: stripRoleSuffix(sender),
        senderRole,
        content,
        timestamp: new Date(),
        attachment,
        audioRecording: audioRecording ? {
          audioUrl: audioRecording.audioUrl,
          transcription: audioRecording.transcription,
          duration: audioRecording.duration,
        } : undefined,
      };

      const event: MessageEvent = {
        type: "MESSAGE_SENT",
        payload: {
          enquiryId,
          channelId,
          message,
          timestamp: new Date(),
        },
      };

      // Dispatch directly to MessageContext (single source of truth)
      messageDispatch(event);
      
      // Broadcast to other clients via realtime (for multi-user scenarios)
      await realtimeService.publish(event);
    },
    [realtimeService, messageDispatch, enquiryId]
  );

  return {
    sellerChannels,
    loading: false,
    createSellerChannel,
    fanOutMessages,
    sendToSellerChannel,
    reload: () => {}, // No-op since MessageContext updates automatically
  };
};
