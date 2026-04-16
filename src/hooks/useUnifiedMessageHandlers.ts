/**
 * Hooks: Unified Message Handlers
 * 
 * Consolidated hook for all message-related actions
 */

import { useCallback } from 'react';
import { useMessages } from './useMessages';
import { useSendSellerDMMessage } from './useSellerDMChannels';
import { useBuyerDMMessages } from './useBuyerDMMessages';
import { useEnquiries } from './useEnquiries';
import { useCurrentRole, useMessageDispatch } from '@/infrastructure';
import { Message } from '@/domain/message/message.types';
import { getPersonaById } from '@/domain/persona/persona.data';
import { generateMemberId } from '@/domain/enquiry/enquiry.types';
import { createMemberAddedEvent } from '@/domain/enquiry/enquiry.events';
import { createGroupCreatedEvent, createGroupMembersAddedEvent, MessageEvent } from '@/domain/message/message.events';
import { generateGroupId } from '@/domain/message/group.utils';
import type { GroupMember } from '@/domain/message/group.types';
import { stripRoleSuffix } from '@/domain/utils/name-utils';

const __DEV_LOG__ = false;
const devError = __DEV_LOG__ ? (label: string, data?: any) => console.error(label, data) : (() => {}) as (label: string, data?: any) => void;

export interface UnifiedMessageHandlersOptions {
  selectedEnquiryId: string | null;
  selectedBuyerDMId: string | null;
  selectedSellerDMId: string | null;
  selectedGroupId: string | null;
  currentChannel: string;
  enquiryMembers: any[];
  selectedBuyerDM?: any;
  selectedSellerDM?: any;
  selectedGroup?: any;
  realtimeService: any;
  dataStore: any;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

export function useUnifiedMessageHandlers(options: UnifiedMessageHandlersOptions) {
  const { currentRole, currentPersona, currentUser } = useCurrentRole();
  const { sendMessage } = useMessages(options.selectedEnquiryId || '', options.currentChannel);
  const { sendSellerDMMessage } = useSendSellerDMMessage();
  const { changeEnquiryState } = useEnquiries();
  const messageDispatch = useMessageDispatch();
  
  // Get buyerDMMessages for the selected DM - will be null if no DM selected
  const buyerDMMessages = useBuyerDMMessages(options.selectedBuyerDMId || '');

  /**
   * Universal message send handler that routes to the correct channel
   */
  const handleSendMessage = useCallback(async (
    content: string,
    attachment?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number },
    mentions?: string[]
  ) => {
    try {
      // Route to Buyer DM
      if (options.selectedBuyerDMId && buyerDMMessages) {
        await buyerDMMessages.sendBuyerDMMessage(content, currentUser, currentRole, attachment, audioRecording, mentions);
        options.onSuccess?.("Message sent");
        return;
      }

      // Route to Group
      if (options.selectedGroupId && options.selectedGroup) {
        const message: Message = {
          id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "user",
          sender: stripRoleSuffix(currentUser),
          senderPersonaId: currentPersona.id,
          senderRole: currentRole,
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
            enquiryId: options.selectedGroupId,
            channelId: options.selectedGroupId,
            message,
            timestamp: new Date(),
          },
        };

        messageDispatch(event);
        await options.realtimeService.publish(event);
        options.onSuccess?.("Message sent");
        return;
      }

      // Handle command-based state changes for enquiries
      if (options.selectedEnquiryId && content.includes('@')) {
        const commandStateMap: Record<string, string> = {
          '@buyer-responding': 'Awaiting Response',
          '@seller-quoting': 'Awaiting Response',
          '@quote-shared': 'CM Responded',
          '@awaiting-po': 'CM Responded',
          '@po-received': 'RM Approved',
          '@cx-validated': 'RM Approved',
          '@convert-to-order': 'RM Approved',
        };

        for (const [command, newState] of Object.entries(commandStateMap)) {
          if (content.includes(command)) {
            await changeEnquiryState(
              options.selectedEnquiryId,
              newState as any,
              currentUser,
              currentRole,
              options.realtimeService
            );
            options.onSuccess?.(`Enquiry state updated to ${newState}`);
            break;
          }
        }
      }

      // Auto-add mentioned members if not already in enquiry
      if (mentions && mentions.length > 0 && options.selectedEnquiryId && options.enquiryMembers) {
        const currentMemberPersonaIds = options.enquiryMembers.map(m => m.personaId);
        const newMemberPersonaIds = mentions.filter(personaId => !currentMemberPersonaIds.includes(personaId));

        if (newMemberPersonaIds.length > 0) {
          for (const personaId of newMemberPersonaIds) {
            const persona = getPersonaById(personaId);
            if (persona) {
              const member = {
                id: generateMemberId(options.selectedEnquiryId, personaId),
                userId: persona.userId,
                personaId: persona.id,
                role: persona.role,
                joinedAt: new Date(),
              };

              const event = createMemberAddedEvent(options.selectedEnquiryId, member);
              messageDispatch(event);
              await options.dataStore.appendEvent(event);
              await options.realtimeService.publish(event);
            }
          }
          options.onSuccess?.(mentions.length > 1 ? `Added ${newMemberPersonaIds.length} mentioned member(s)` : `Added mentioned member`);
        }
      }

      // Default: send to enquiry channel
      await sendMessage(content, currentUser, currentRole, attachment, audioRecording, mentions);
      options.onSuccess?.("Message sent");
    } catch (error) {
      devError('[handleSendMessage] Error:', error);
      options.onError?.("Failed to send message");
    }
  }, [
    options.selectedBuyerDMId,
    options.selectedGroupId,
    options.selectedGroup,
    options.selectedEnquiryId,
    options.enquiryMembers,
    options.realtimeService,
    options.dataStore,
    options.onSuccess,
    options.onError,
    currentUser,
    currentRole,
    currentPersona.id,
    sendMessage,
    messageDispatch,
    changeEnquiryState,
    buyerDMMessages,
  ]);

  /**
   * Create a new group
   */
  const handleCreateGroup = useCallback((members: any[], groupName: string, groupType: 'buyer' | 'seller' | 'custom') => {
    const groupId = generateGroupId();
    const groupMembers: GroupMember[] = members.map(member => ({
      id: member.id,
      type: member.type,
      name: member.name,
      phone: member.phone,
      role: member.role,
      buyerId: member.buyerId,
      sellerId: member.sellerId,
    }));

    const event = createGroupCreatedEvent(
      groupId,
      groupName,
      groupType,
      groupType === 'seller' ? 'active' : 'pending',
      groupMembers,
      currentPersona.id,
      groupType === 'pending' ? "Waiting for members to join" : undefined
    );

    messageDispatch(event);
    options.onSuccess?.(`Group "${groupName}" ${groupType === 'seller' ? 'created' : 'creation requested'}!`);
    
    return groupId;
  }, [currentPersona.id, messageDispatch, options]);

  /**
   * Add members to an existing group
   */
  const handleAddMembersToGroup = useCallback((groupId: string, memberIds: string[]) => {
    const groupMembers = memberIds.map(id => {
      const persona = getPersonaById(id);
      if (persona) {
        return {
          id: id,
          type: "persona" as const,
          name: persona.displayName,
          role: persona.role,
        };
      }
      
      return {
        id: id,
        type: "persona" as const,
        name: id,
      };
    });

    const event = createGroupMembersAddedEvent(groupId, groupMembers as GroupMember[], currentPersona.id);
    messageDispatch(event);
    options.onSuccess?.(`${memberIds.length} member(s) added to group`);
  }, [currentPersona.id, messageDispatch, options]);

  /**
   * Send message to seller DM
   */
  const handleSellerChannelMessage = useCallback(async (
    sellerId: string,
    sellerName: string,
    cmPersonaId: string,
    cmName: string,
    content: string,
    attachment?: any,
    audioRecording?: { audioUrl: string; audioBlob: Blob; transcription: string; duration: number }
  ) => {
    try {
      await sendSellerDMMessage(
        sellerId,
        sellerName,
        cmPersonaId,
        cmName,
        content,
        currentUser,
        currentRole,
        attachment,
        audioRecording
      );
      options.onSuccess?.("Message sent");
    } catch (error) {
      devError('[handleSellerChannelMessage] Error:', error);
      options.onError?.("Failed to send message");
    }
  }, [sendSellerDMMessage, currentUser, currentRole, options]);

  return {
    handleSendMessage,
    handleCreateGroup,
    handleAddMembersToGroup,
    handleSellerChannelMessage,
  };
}
