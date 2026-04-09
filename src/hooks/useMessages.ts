/**
 * Hook: Messages
 * 
 * Manages messages for a specific enquiry and channel.
 * Uses MessageContext for reactive updates across roles.
 */

import { useState, useCallback, useMemo } from "react";
import { useAppStore } from "./useAppStore";
import { useMessageState, useMessageDispatch } from "@/infrastructure/state/MessageContext";
import { Message, UserRole } from "@/domain/message/message.types";
import { MessageEvent } from "@/domain/message/message.events";
import { transformForShare } from "@/domain/sharing/share.transforms";
import type { ShareContext } from "@/domain/sharing/share.policy.types";
import { mapChannelToSourceKind, mapChannelToTargetKind } from "@/domain/sharing/share.channel-kinds";
import { messageLogger } from "@/domain/utils/logger";
import { safeAsync } from "@/domain/utils/error-handler";
import { validateMessageContent, isValidChannelId } from "@/domain/utils/type-guards";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

export const useMessages = (enquiryId: string, channelId: string) => {
  const { dataStore, realtimeService } = useAppStore();
  const messageState = useMessageState();
  const messageDispatch = useMessageDispatch();
  const [loading, setLoading] = useState(false);

  // Get messages from MessageContext (reactive to realtime updates)
  const messages = useMemo(() => {
    messageLogger.debug('Recomputing messages', { 
      enquiryId, 
      channelId,
      hasEnquiryId: !!enquiryId,
      hasChannelId: !!channelId,
    });
    
    if (!enquiryId || !channelId) {
      messageLogger.debug('Missing enquiryId or channelId, returning empty array');
      return [];
    }
    
    // Check if it's a seller channel
    if (channelId.startsWith("seller-")) {
      const sellerChannels = messageState.sellerChannels[enquiryId] || [];
      const sellerChannel = sellerChannels.find((ch) => ch.id === channelId);
      
      if (sellerChannel) {
        messageLogger.debug('Found seller channel', {
          channelId,
          messageCount: sellerChannel.messages.length
        });
      }
      
      return sellerChannel?.messages || [];
    }
    
    // Regular channel
    const channelMessages = messageState.messages[enquiryId]?.[channelId] || [];
    messageLogger.debug('Regular channel lookup', {
      enquiryId,
      channelId,
      messageCount: channelMessages.length
    });
    return channelMessages;
  }, [messageState, enquiryId, channelId]);

  // Send message
  const sendMessage = useCallback(
    async (
      content: string,
      sender: string,
      senderRole: UserRole,
      attachment?: { name: string; type: string; url?: string },
      audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
      mentions?: string[]
    ) => {
      const result = await safeAsync(async () => {
        // Validate inputs
        validateMessageContent(content);
        
        if (!isValidChannelId(channelId)) {
          throw new Error(`Invalid channel ID: ${channelId}`);
        }

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

        const event: MessageEvent = {
          type: "MESSAGE_SENT",
          payload: {
            enquiryId,
            channelId,
            message,
            timestamp: new Date(),
          },
        };

        messageLogger.info('Sending message', {
          enquiryId,
          channelId,
          messageId: message.id,
        });

        // Dispatch directly to MessageContext (single source of truth)
        messageDispatch(event);
        
        // Broadcast to other clients via realtime (for multi-user scenarios)
        await realtimeService.publish(event);
        
        messageLogger.info('Message sent successfully');
      }, 'useMessages.sendMessage');

      if (result.error) {
        throw result.error;
      }
    },
    [realtimeService, messageDispatch, enquiryId, channelId]
  );

  // Share messages
  const shareMessages = useCallback(
    async (
      messageIds: string[],
      toChannel: string,
      currentUser: string,
      currentRole: UserRole,
      editedContents?: Record<string, string>,
      currentPersonaId?: string
    ) => {
      const result = await safeAsync(async () => {
        if (!isValidChannelId(toChannel)) {
          throw new Error(`Invalid target channel: ${toChannel}`);
        }

        const messagesToShare = messages.filter((m) => messageIds.includes(m.id));

        if (messagesToShare.length === 0) {
          throw new Error('No messages to share');
        }

        // Map legacy channel strings to policy-driven source/target kinds
        const sourceKind = mapChannelToSourceKind(channelId);
        const targetKind = mapChannelToTargetKind(toChannel);

        const ctx: ShareContext = {
          role: currentRole,
          sourceKind,
          targetKind,
          sourceId: enquiryId,
        };

        const concatenated = transformForShare(messagesToShare, {
          context: ctx,
          sharerName: currentUser,
          sharerPersonaId: currentPersonaId ?? '',
          sharerRole: currentRole,
          editedContents,
          timestamp: new Date(),
        });

        const event: MessageEvent = {
          type: "MESSAGE_SHARED",
          payload: {
            enquiryId,
            fromChannel: channelId,
            toChannel,
            messages: [concatenated],
            sharedBy: stripRoleSuffix(currentUser),
            sharedByRole: currentRole,
            edited: concatenated.edited || false,
            masked: concatenated.masked || false,
            timestamp: new Date(),
          },
        };

        messageLogger.info('Sharing messages', {
          enquiryId,
          fromChannel: channelId,
          toChannel,
          messageCount: messagesToShare.length,
          concatenated: true,
        });

        // Dispatch directly to MessageContext (single source of truth)
        messageDispatch(event);
        
        // Broadcast to other clients via realtime (for multi-user scenarios)
        await realtimeService.publish(event);
        
        messageLogger.info('Messages shared successfully');
      }, 'useMessages.shareMessages');

      if (result.error) {
        throw result.error;
      }
    },
    [realtimeService, messageDispatch, enquiryId, channelId, messages]
  );

  return {
    messages,
    loading,
    sendMessage,
    shareMessages,
    reload: () => {}, // No-op since MessageContext updates automatically
  };
};
