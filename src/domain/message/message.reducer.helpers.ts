/**
 * Domain: Message Reducer Helpers
 * 
 * Modular reducer functions extracted for clarity and testability.
 * Each function handles a specific event type.
 */

import { MessageDomainState } from "./message.reducer";
import { MessageEvent, GroupCreatedEvent, GroupMembersAddedEvent } from "./message.events";
import { GroupChannel } from "./group.types";
import { getBuyerPersonaFromBuyerId } from "@/domain/buyer/buyer-persona-mapping";

/**
 * Helper: Handle MESSAGE_SENT for groups
 */
export function handleGroupMessageSent(
  state: MessageDomainState,
  channelId: string,
  message: any
): MessageDomainState {
  const groupId = channelId;
  
  const updatedGroups = state.groupChannels.map(group => {
    if (group.id === groupId) {
      // Check for duplicate message
      if (group.messages.some(m => m.id === message.id)) {
        console.log('[messageReducer] Duplicate group message detected, skipping:', message.id);
        return group;
      }
      
      console.log('[messageReducer] Adding message to group:', {
        groupId,
        groupName: group.name,
        currentMessageCount: group.messages.length,
        newMessageCount: group.messages.length + 1
      });
      
      return {
        ...group,
        messages: [...group.messages, message],
        lastActivity: new Date(),
      };
    }
    return group;
  });
  
  return {
    ...state,
    groupChannels: updatedGroups,
  };
}

/**
 * Helper: Handle GROUP_CREATED event
 */
export function handleGroupCreated(
  state: MessageDomainState,
  event: GroupCreatedEvent
): MessageDomainState {
  const { groupId, name, type, status, members, createdBy, pendingMessage } = event.payload;
  
  console.log('[messageReducer] GROUP_CREATED:', { 
    groupId, 
    name,
    type,
    status,
    memberCount: members.length,
    createdBy,
    pendingMessage
  });
  
  // Check if group already exists
  const existingGroup = (state.groupChannels || []).find(g => g.id === groupId);
  if (existingGroup) {
    console.log('[messageReducer] Group already exists, skipping:', groupId);
    return state;
  }
  
  // Extract persona IDs from members
  const memberPersonaIds = members.map(m => m.id);
  
  // Auto-add creator to memberPersonaIds if not already included
  if (!memberPersonaIds.includes(createdBy)) {
    memberPersonaIds.push(createdBy);
  }
  
  // Determine buyerId or sellerId based on type and members
  let buyerId: string | undefined;
  let sellerId: string | undefined;
  let buyerPersonaId: string | undefined;
  let sellerPersonaId: string | undefined;
  
  if (type === "buyer") {
    const buyerContact = members.find(m => m.type === "contact" && m.buyerId);
    buyerId = buyerContact?.buyerId;
    // Derive buyer persona ID for profile hover support
    if (buyerId) {
      buyerPersonaId = getBuyerPersonaFromBuyerId(buyerId);
    }
  } else if (type === "seller") {
    const sellerContact = members.find(m => m.type === "contact" && m.sellerId);
    sellerId = sellerContact?.sellerId;  // Use sellerId field from GroupMember
  }
  
  // Create new group channel
  const newGroup: GroupChannel = {
    id: groupId,
    name,
    type,
    status,
    memberIds: members.map(m => m.id),
    memberPersonaIds,
    messages: [],
    createdBy,
    createdAt: event.payload.timestamp,
    pendingMessage: pendingMessage || (status === "pending" ? "Group Creation Pending - Waiting for approval" : undefined),
    buyerId,
    sellerId,
    buyerPersonaId,
    sellerPersonaId,
    lastActivity: event.payload.timestamp,
    threads: [], // Initialize empty threads array
  };
  
  console.log('[messageReducer] Created new group channel:', newGroup);
  
  return {
    ...state,
    groupChannels: [...(state.groupChannels || []), newGroup],
  };
}

/**
 * Helper: Handle GROUP_MEMBERS_ADDED event
 */
export function handleGroupMembersAdded(
  state: MessageDomainState,
  event: GroupMembersAddedEvent
): MessageDomainState {
  const { groupId, members, addedBy } = event.payload;
  
  console.log('[messageReducer] GROUP_MEMBERS_ADDED:', { 
    groupId, 
    memberCount: members.length,
    addedBy
  });
  
  const updatedGroups = (state.groupChannels || []).map(group => {
    if (group.id === groupId) {
      // Add new member IDs
      const newMemberIds = members.map(m => m.id);
      const updatedMemberIds = [...new Set([...group.memberIds, ...newMemberIds])];
      const updatedMemberPersonaIds = [...new Set([...group.memberPersonaIds, ...newMemberIds])];
      
      // Add system message about members being added
      const systemMessage = {
        id: `system-members-added-${Date.now()}`,
        type: "system" as const,
        content: `${members.map(m => m.name).join(", ")} added to group`,
        timestamp: event.payload.timestamp,
      };
      
      return {
        ...group,
        memberIds: updatedMemberIds,
        memberPersonaIds: updatedMemberPersonaIds,
        messages: [...group.messages, systemMessage],
        lastActivity: event.payload.timestamp,
      };
    }
    return group;
  });
  
  return {
    ...state,
    groupChannels: updatedGroups,
  };
}

/**
 * Helper: Handle GROUP_APPROVED event
 */
export function handleGroupApproved(
  state: MessageDomainState,
  groupId: string,
  approvedBy: string,
  timestamp: Date
): MessageDomainState {
  console.log('[messageReducer] GROUP_APPROVED:', { groupId, approvedBy });
  
  const updatedGroups = (state.groupChannels || []).map(group => {
    if (group.id === groupId) {
      // Add system message about approval
      const systemMessage = {
        id: `system-approved-${Date.now()}`,
        type: "system" as const,
        content: "Group approved - Members can now join",
        timestamp,
      };
      
      return {
        ...group,
        status: "active" as const,
        pendingMessage: undefined,
        messages: [...group.messages, systemMessage],
        lastActivity: timestamp,
      };
    }
    return group;
  });
  
  return {
    ...state,
    groupChannels: updatedGroups,
  };
}

/**
 * Helper: Handle GROUP_REJECTED event
 */
export function handleGroupRejected(
  state: MessageDomainState,
  groupId: string,
  rejectedBy: string,
  reason: string | undefined,
  timestamp: Date
): MessageDomainState {
  console.log('[messageReducer] GROUP_REJECTED:', { groupId, rejectedBy, reason });
  
  const updatedGroups = (state.groupChannels || []).map(group => {
    if (group.id === groupId) {
      // Add system message about rejection
      const systemMessage = {
        id: `system-rejected-${Date.now()}`,
        type: "system" as const,
        content: reason || "Group creation was rejected",
        timestamp,
      };
      
      return {
        ...group,
        status: "pending" as const,
        pendingMessage: reason || "Group creation was rejected",
        messages: [...group.messages, systemMessage],
        lastActivity: timestamp,
      };
    }
    return group;
  });
  
  return {
    ...state,
    groupChannels: updatedGroups,
  };
}