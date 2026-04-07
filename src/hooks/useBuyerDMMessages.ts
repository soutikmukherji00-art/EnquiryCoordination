/**
 * Hook: Buyer DM Messages
 * 
 * Handles sending messages in buyer DM channels.
 * Ensures messages are stored in the correct buyer DM channel.
 * Uses MessageContext for reactive updates across roles.
 */

import { useCallback } from "react";
import { useAppStore } from "./useAppStore";
import { useMessageDispatch } from "@/infrastructure/state/MessageContext";
import { Message } from "@/domain/message/message.types";
import { BuyerDMMessageSentEvent } from "@/domain/message/message.events";
import { UserRole } from "@/domain/user/user.types";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

export const useBuyerDMMessages = (buyerDMId: string) => {
  const { realtimeService } = useAppStore();
  const messageDispatch = useMessageDispatch();

  const sendBuyerDMMessage = useCallback(
    async (
      content: string,
      sender: string,
      senderRole: UserRole,
      attachment?: { name: string; type: string; url?: string },
      audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
      mentions?: string[]
    ) => {
      const message: Message = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "user",
        sender: stripRoleSuffix(sender),
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

      const event: BuyerDMMessageSentEvent = {
        type: "BUYER_DM_MESSAGE_SENT",
        payload: {
          buyerDMId,
          message,
          timestamp: new Date(),
        },
      };

      // Dispatch directly to MessageContext (single source of truth)
      messageDispatch(event);
      
      // Broadcast to other clients via realtime (for multi-user scenarios)
      await realtimeService.publish(event);
    },
    [realtimeService, messageDispatch, buyerDMId]
  );

  return {
    sendBuyerDMMessage,
  };
};
