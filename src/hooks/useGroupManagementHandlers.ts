/**
 * Group Management Handlers Hook
 * 
 * Consolidates all group-related operations:
 * - Group creation (buyer/seller)
 * - Member management (add/remove)
 * - Invite handling (accept/reject)
 * - Thread creation within groups
 */

import { useCallback } from "react";
import { useMessageDispatch, useCurrentRole } from "@/infrastructure";
import { useGroupChannels } from "./useGroupChannels";
import { 
  createGroupCreatedEvent,
  createGroupMembersAddedEvent,
  createThreadCreatedEvent,
  MessageEvent
} from "@/domain/message/message.events";
import { generateGroupId, generateGroupName } from "@/domain/message/group.utils";
import { generateThreadId } from "@/domain/message/thread.types";
import type { GroupChannel } from "@/domain/message/group.types";
import type { Message } from "@/domain/message/message.types";
import type { SelectedMember } from "@/app/components/GroupCreationModal";
import { PERSONAS } from "@/domain/persona/persona.data";
import { getBuyerIdFromPersona } from "@/domain/buyer/buyer-persona-mapping";

export interface GroupManagementHandlersOptions {
  onSuccess?: (groupId: string) => void;
  onError?: (error: string) => void;
}

export interface GroupManagementHandlers {
  // Group creation
  handleCreateBuyerGroup: (buyerId: string, members: SelectedMember[]) => Promise<string | null>;
  handleCreateSellerGroup: (sellerId: string, members: SelectedMember[]) => Promise<string | null>;
  
  // Member management
  handleAddMembersToGroup: (groupId: string, memberIds: string[]) => Promise<void>;
  handleRemoveMemberFromGroup: (groupId: string, memberId: string) => Promise<void>;
  
  // Invite handling
  handleAcceptGroupInvite: (groupId: string) => Promise<void>;
  handleRejectGroupInvite: (groupId: string) => Promise<void>;
  
  // Thread creation
  handleCreateThread: (groupId: string, rootMessage: Message, title?: string, enquiryId?: string) => Promise<string | null>;
}

export function useGroupManagementHandlers(
  options: GroupManagementHandlersOptions = {}
): GroupManagementHandlers {
  const { onSuccess, onError } = options;
  const messageDispatch = useMessageDispatch();
  const { currentPersona, currentRole } = useCurrentRole();
  const { createGroup, addMembersToGroup } = useGroupChannels();
  
  // Create buyer group (BDM-initiated)
  const handleCreateBuyerGroup = useCallback(async (
    buyerId: string,
    members: SelectedMember[]
  ): Promise<string | null> => {
    if (!currentPersona) {
      onError?.("No current persona");
      return null;
    }
    
    try {
      // Extract persona IDs from selected members
      const memberPersonaIds = members.map(m => m.personaId);
      
      // Ensure creator is included
      if (!memberPersonaIds.includes(currentPersona.id)) {
        memberPersonaIds.unshift(currentPersona.id);
      }
      
      // Find buyer persona
      const buyerPersona = PERSONAS.find(p => p.id === buyerId);
      if (!buyerPersona) {
        throw new Error("Buyer persona not found");
      }
      
      // Ensure buyer is included
      if (!memberPersonaIds.includes(buyerId)) {
        memberPersonaIds.push(buyerId);
      }

      const buyerDataId = getBuyerIdFromPersona(buyerId) || buyerId;
      
      // Generate group
      const groupId = generateGroupId("buyer");
      const groupName = generateGroupName("buyer", buyerPersona.displayName);
      
      // Create group
      const group: GroupChannel = {
        id: groupId,
        name: groupName,
        type: "buyer",
        status: "active",
        createdBy: currentPersona.id,
        createdAt: new Date(),
        memberPersonaIds,
        buyerId: buyerDataId,
        buyerPersonaId: buyerId,
        messages: [],
      };
      
      // Dispatch creation event
      messageDispatch(createGroupCreatedEvent(group));
      
      onSuccess?.(groupId);
      return groupId;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create buyer group";
      onError?.(errorMsg);
      return null;
    }
  }, [currentPersona, messageDispatch, onSuccess, onError]);
  
  // Create seller group (CM-initiated)
  const handleCreateSellerGroup = useCallback(async (
    sellerId: string,
    members: SelectedMember[]
  ): Promise<string | null> => {
    if (!currentPersona) {
      onError?.("No current persona");
      return null;
    }
    
    try {
      // Extract persona IDs
      const memberPersonaIds = members.map(m => m.personaId);
      
      // Ensure creator is included
      if (!memberPersonaIds.includes(currentPersona.id)) {
        memberPersonaIds.unshift(currentPersona.id);
      }
      
      // Find seller contact
      const sellerContact = members.find(m => m.type === "seller" && m.companyId === sellerId);
      if (!sellerContact) {
        throw new Error("Seller contact not found");
      }
      
      // Generate group
      const groupId = generateGroupId("seller");
      const groupName = generateGroupName("seller", sellerContact.displayName);
      
      // Create group
      const group: GroupChannel = {
        id: groupId,
        name: groupName,
        type: "seller",
        status: "pending", // Seller groups start as pending
        createdBy: currentPersona.id,
        createdAt: new Date(),
        memberPersonaIds,
        sellerId,
        messages: [],
      };
      
      // Dispatch creation event
      messageDispatch(createGroupCreatedEvent(group));
      
      onSuccess?.(groupId);
      return groupId;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create seller group";
      onError?.(errorMsg);
      return null;
    }
  }, [currentPersona, messageDispatch, onSuccess, onError]);
  
  // Add members to existing group
  const handleAddMembersToGroup = useCallback(async (
    groupId: string,
    memberIds: string[]
  ): Promise<void> => {
    try {
      // Dispatch event to add members
      messageDispatch(createGroupMembersAddedEvent(groupId, memberIds));
      
      onSuccess?.(groupId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to add members";
      onError?.(errorMsg);
    }
  }, [messageDispatch, onSuccess, onError]);
  
  // Remove member from group
  const handleRemoveMemberFromGroup = useCallback(async (
    groupId: string,
    memberId: string
  ): Promise<void> => {
    try {
      // Dispatch event to remove member
      messageDispatch({
        type: "GROUP_MEMBER_REMOVED",
        payload: { groupId, memberId },
      } as MessageEvent);
      
      onSuccess?.(groupId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to remove member";
      onError?.(errorMsg);
    }
  }, [messageDispatch, onSuccess, onError]);
  
  // Accept group invite
  const handleAcceptGroupInvite = useCallback(async (groupId: string): Promise<void> => {
    try {
      messageDispatch({
        type: "GROUP_INVITE_ACCEPTED",
        payload: { groupId, acceptedBy: currentPersona?.id || "" },
      } as MessageEvent);
      
      onSuccess?.(groupId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to accept invite";
      onError?.(errorMsg);
    }
  }, [currentPersona, messageDispatch, onSuccess, onError]);
  
  // Reject group invite
  const handleRejectGroupInvite = useCallback(async (groupId: string): Promise<void> => {
    try {
      messageDispatch({
        type: "GROUP_INVITE_REJECTED",
        payload: { groupId, rejectedBy: currentPersona?.id || "" },
      } as MessageEvent);
      
      onSuccess?.(groupId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to reject invite";
      onError?.(errorMsg);
    }
  }, [currentPersona, messageDispatch, onSuccess, onError]);
  
  // Create thread from message
  const handleCreateThread = useCallback(async (
    groupId: string,
    rootMessage: Message,
    title?: string,
    enquiryId?: string
  ): Promise<string | null> => {
    try {
      const threadId = generateThreadId();
      
      // Dispatch thread creation event
      messageDispatch(createThreadCreatedEvent({
        threadId,
        groupId,
        rootMessageId: rootMessage.id,
        title: title || `Thread from ${rootMessage.sender}`,
        enquiryId,
        createdBy: currentPersona?.id || "",
      }));
      
      onSuccess?.(threadId);
      return threadId;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Failed to create thread";
      onError?.(errorMsg);
      return null;
    }
  }, [currentPersona, messageDispatch, onSuccess, onError]);
  
  return {
    handleCreateBuyerGroup,
    handleCreateSellerGroup,
    handleAddMembersToGroup,
    handleRemoveMemberFromGroup,
    handleAcceptGroupInvite,
    handleRejectGroupInvite,
    handleCreateThread,
  };
}
