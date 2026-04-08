/**
 * Domain: Message Reducer
 * 
 * Pure functions that apply message events to state.
 * 
 * Performance optimizations:
 * - All debug logging gated behind __DEV_LOG__ flag (avoids string alloc + .map() in hot path)
 * - Duplicate message checks use Set for O(1) lookup
 * - Early returns when no state change is needed
 */

import { Message } from "./message.types";
import { MessageEvent } from "./message.events";
import { SellerChannel } from "./seller.types";
import { BuyerDMChannel, SellerDMChannel } from "./dm.types";
import { GroupChannel } from "./group.types";
import { GroupInvite } from "./group-invite.types";
import { Thread } from "./thread.types";
import {
  handleGroupCreated,
  handleGroupMembersAdded,
  handleGroupTagged,
  handleGroupApproved,
  handleGroupRejected,
} from "./message.reducer.helpers";
import {
  handleInviteSent,
  handleInviteAccepted,
  handleInviteRejected,
  handleInviteExpired,
} from "./message.reducer.invite-handlers";

// Debug logging flag - set to true to enable verbose logging
const __DEV_LOG__ = false;

function devLog(label: string, data?: any) {
  if (__DEV_LOG__) {
    console.log(label, data);
  }
}

export interface MessageDomainState {
  // Regular channel messages: enquiryId -> channelId -> messages
  messages: Record<string, Record<string, Message[]>>;
  
  // Dynamic seller channels: enquiryId -> seller channels (OLD MODEL - deprecated)
  sellerChannels: Record<string, SellerChannel[]>;
  
  // Seller DM channels: Array of CM-seller direct message channels (NEW MODEL)
  sellerDMChannels: SellerDMChannel[];
  
  // Buyer DM channels: Array of buyer-BDM direct message channels
  buyerDMChannels: BuyerDMChannel[];
  
  // Group channels: Array of custom group channels
  groupChannels: GroupChannel[];
  
  // Group invites: Array of pending/active invites
  groupInvites: GroupInvite[];
  
  // Threads: Array of threads
  threads: Thread[];
}

export const initialMessageState: MessageDomainState = {
  messages: {},
  sellerChannels: {},
  sellerDMChannels: [],
  buyerDMChannels: [],
  groupChannels: [],
  groupInvites: [],
  threads: [],
};

export const messageReducer = (
  state: MessageDomainState,
  event: MessageEvent
): MessageDomainState => {
  devLog('[messageReducer] Processing event:', event.type);
  
  switch (event.type) {
    case "MESSAGE_SENT": {
      const { enquiryId, channelId, message } = event.payload;

      // Check if this is a group message (group_xxx or grp_xxx format)
      // Dynamic groups use "group_" prefix, pre-existing mock seller groups use "grp_seller_" prefix
      if (channelId.startsWith("group_") || channelId.startsWith("grp_")) {
        const groupId = channelId;
        
        // Find the target group - bail early if not found
        const groupIndex = state.groupChannels.findIndex(g => g.id === groupId);
        if (groupIndex === -1) return state;
        
        const group = state.groupChannels[groupIndex];
        
        // Check for duplicate message
        if (group.messages.some(m => m.id === message.id)) {
          return state;
        }
        
        const updatedGroups = state.groupChannels.slice();
        updatedGroups[groupIndex] = {
          ...group,
          messages: [...group.messages, message],
          lastActivity: new Date(),
          unread: true,
          unreadCount: (group.unreadCount || 0) + 1,
        };
        
        return {
          ...state,
          groupChannels: updatedGroups,
        };
      }

      // Check if this is a seller channel (seller-s_1 format)
      if (channelId.startsWith("seller-")) {
        const existingChannels = state.sellerChannels[enquiryId] || [];
        const channelIndex = existingChannels.findIndex((ch) => ch.id === channelId);

        if (channelIndex === -1) {
          // Seller channel doesn't exist yet - create it automatically
          const sellerId = channelId.replace("seller-", "");
          const newChannel: SellerChannel = {
            id: channelId,
            sellerId,
            sellerName: `Seller ${sellerId}`, // Placeholder name
            enquiryId,
            messages: [message],
            unread: false,
          };

          return {
            ...state,
            sellerChannels: {
              ...state.sellerChannels,
              [enquiryId]: [...existingChannels, newChannel],
            },
          };
        }

        // Check for duplicate message
        const existingChannel = existingChannels[channelIndex];
        if (existingChannel.messages.some(m => m.id === message.id)) {
          return state;
        }

        const updatedChannels = existingChannels.slice();
        updatedChannels[channelIndex] = {
          ...updatedChannels[channelIndex],
          messages: [...updatedChannels[channelIndex].messages, message],
        };

        return {
          ...state,
          sellerChannels: {
            ...state.sellerChannels,
            [enquiryId]: updatedChannels,
          },
        };
      }

      // Regular channel
      const enquiryMessages = state.messages[enquiryId] || {};
      const channelMessages = enquiryMessages[channelId] || [];
      
      // Check for duplicate message
      if (channelMessages.some(m => m.id === message.id)) {
        return state;
      }

      return {
        ...state,
        messages: {
          ...state.messages,
          [enquiryId]: {
            ...enquiryMessages,
            [channelId]: [...channelMessages, message],
          },
        },
      };
    }

    case "MESSAGE_SHARED": {
      const { enquiryId, fromChannel, toChannel, messages } = event.payload;

      // If sharing to a seller channel
      if (toChannel.startsWith("seller-")) {
        const existingChannels = state.sellerChannels[enquiryId] || [];
        const channelIndex = existingChannels.findIndex((ch) => ch.id === toChannel);

        if (channelIndex === -1) {
          // Seller channel doesn't exist yet - create it automatically
          const sellerId = toChannel.replace("seller-", "");
          const newChannel: SellerChannel = {
            id: toChannel,
            sellerId,
            sellerName: `Seller ${sellerId}`,
            enquiryId,
            messages: [...messages],
            unread: false,
          };

          return {
            ...state,
            sellerChannels: {
              ...state.sellerChannels,
              [enquiryId]: [...existingChannels, newChannel],
            },
          };
        }

        // Filter out duplicate messages before adding
        const existingChannel = existingChannels[channelIndex];
        const existingMessageIds = new Set(existingChannel.messages.map(m => m.id));
        const newMessages = messages.filter(msg => !existingMessageIds.has(msg.id));

        // If all messages are duplicates, return current state unchanged
        if (newMessages.length === 0) {
          return state;
        }

        const updatedChannels = existingChannels.slice();
        updatedChannels[channelIndex] = {
          ...updatedChannels[channelIndex],
          messages: [...updatedChannels[channelIndex].messages, ...newMessages],
        };

        return {
          ...state,
          sellerChannels: {
            ...state.sellerChannels,
            [enquiryId]: updatedChannels,
          },
        };
      }

      // Regular channel sharing - add messages to destination and hide source messages
      const enquiryMessages = state.messages[enquiryId] || {};
      const channelMessages = enquiryMessages[toChannel] || [];
      
      // Filter out duplicate messages
      const existingMessageIds = new Set(channelMessages.map(m => m.id));
      const newMessages = messages.filter(msg => !existingMessageIds.has(msg.id));

      // If all messages are duplicates, return current state unchanged
      if (newMessages.length === 0) {
        return state;
      }

      // Hide source messages in fromChannel (if sharing within the same enquiry)
      const sourceMessages = enquiryMessages[fromChannel] || [];
      const sharedMessageIds = new Set(messages.map(m => {
        // Extract original message ID from shared message ID (format: shr-timestamp-originalId-iX)
        const match = m.id.match(/^shr-\d+-(.+)-i\d+$/);
        return match ? match[1] : m.id;
      }));
      
      const updatedSourceMessages = sourceMessages.map(msg => {
        if (sharedMessageIds.has(msg.id)) {
          return { ...msg, hidden: true };
        }
        return msg;
      });

      return {
        ...state,
        messages: {
          ...state.messages,
          [enquiryId]: {
            ...enquiryMessages,
            [toChannel]: [...channelMessages, ...newMessages],
            [fromChannel]: updatedSourceMessages,
          },
        },
      };
    }

    case "SELLER_CHANNEL_CREATED": {
      const { enquiryId, sellerId, sellerName } = event.payload;
      const existingChannels = state.sellerChannels[enquiryId] || [];

      // Check if channel already exists
      const existingChannelIndex = existingChannels.findIndex((ch) => ch.sellerId === sellerId);
      
      if (existingChannelIndex !== -1) {
        // Channel exists - update the seller name if it was a placeholder
        const existingChannel = existingChannels[existingChannelIndex];
        if (existingChannel.sellerName.startsWith("Seller ")) {
          const updatedChannels = existingChannels.slice();
          updatedChannels[existingChannelIndex] = {
            ...existingChannel,
            sellerName,
          };
          
          return {
            ...state,
            sellerChannels: {
              ...state.sellerChannels,
              [enquiryId]: updatedChannels,
            },
          };
        }
        return state;
      }

      const newChannel: SellerChannel = {
        id: `seller-${sellerId}`,
        sellerId,
        sellerName,
        enquiryId,
        messages: [],
        unread: false,
      };

      return {
        ...state,
        sellerChannels: {
          ...state.sellerChannels,
          [enquiryId]: [...existingChannels, newChannel],
        },
      };
    }

    case "MESSAGES_FAN_OUT": {
      const { enquiryId, sellerIds, messages } = event.payload;
      const existingChannels = state.sellerChannels[enquiryId] || [];

      const updatedChannels = existingChannels.slice();
      let hasChanges = false;

      sellerIds.forEach((sellerId) => {
        const channelIndex = updatedChannels.findIndex(
          (ch) => ch.sellerId === sellerId
        );

        if (channelIndex !== -1) {
          // Filter out duplicate messages before adding
          const existingMessageIds = new Set(updatedChannels[channelIndex].messages.map(m => m.id));
          const newMessages = messages.filter(msg => !existingMessageIds.has(msg.id));

          // Only update if there are new messages
          if (newMessages.length > 0) {
            updatedChannels[channelIndex] = {
              ...updatedChannels[channelIndex],
              messages: [...updatedChannels[channelIndex].messages, ...newMessages],
            };
            hasChanges = true;
          }
        }
      });

      if (!hasChanges) return state;

      return {
        ...state,
        sellerChannels: {
          ...state.sellerChannels,
          [enquiryId]: updatedChannels,
        },
      };
    }

    case "BUYER_DM_MESSAGE_SENT": {
      const { buyerDMId, message } = event.payload;

      // Find the target DM - bail early if not found
      const dmIndex = state.buyerDMChannels.findIndex(dm => dm.id === buyerDMId);
      if (dmIndex === -1) return state;
      
      const dm = state.buyerDMChannels[dmIndex];
      
      // Check for duplicate message
      if (dm.messages.some(m => m.id === message.id)) {
        return state;
      }
      
      // Determine which participant sent the message and increment unread for the OTHER participant
      const isBuyerMessage = message.senderPersonaId === dm.buyerPersonaId;
      const isBDMMessage = message.senderPersonaId === dm.bdmPersonaId;

      const updatedDMChannels = state.buyerDMChannels.slice();
      updatedDMChannels[dmIndex] = {
        ...dm,
        messages: [...dm.messages, message],
        unread: true,
        unreadCount: dm.unreadCount + 1,
        // Increment unread for the OTHER participant
        unreadForBuyer: isBDMMessage ? dm.unreadForBuyer + 1 : dm.unreadForBuyer,
        unreadForBDM: isBuyerMessage ? dm.unreadForBDM + 1 : dm.unreadForBDM,
        lastActivity: new Date(),
      };

      return {
        ...state,
        buyerDMChannels: updatedDMChannels,
      };
    }

    case "BUYER_DM_VIEWED": {
      const { buyerDMId, personaId } = event.payload;
      
      // Find the target DM - bail early if not found
      const dmIndex = state.buyerDMChannels.findIndex(dm => dm.id === buyerDMId);
      if (dmIndex === -1) return state;
      
      const dm = state.buyerDMChannels[dmIndex];
      const isBuyer = personaId === dm.buyerPersonaId;
      const isBDM = personaId === dm.bdmPersonaId;

      const updatedDMChannels = state.buyerDMChannels.slice();
      updatedDMChannels[dmIndex] = {
        ...dm,
        unread: false,
        unreadCount: 0,
        unreadForBuyer: isBuyer ? 0 : dm.unreadForBuyer,
        unreadForBDM: isBDM ? 0 : dm.unreadForBDM,
      };

      return {
        ...state,
        buyerDMChannels: updatedDMChannels,
      };
    }

    case "SELLER_DM_MESSAGE_SENT": {
      const { sellerDMId, message } = event.payload;

      // Find the target DM - bail early if not found
      const dmIndex = state.sellerDMChannels.findIndex(dm => dm.id === sellerDMId);
      if (dmIndex === -1) return state;
      
      const dm = state.sellerDMChannels[dmIndex];
      
      // Check for duplicate message
      if (dm.messages.some(m => m.id === message.id)) {
        return state;
      }
      
      // Determine which participant sent the message and increment unread for the OTHER participant
      const isSellerMessage = message.senderRole === "Seller";
      const isCMMessage = message.senderRole === "CM";

      const updatedSellerDMChannels = state.sellerDMChannels.slice();
      updatedSellerDMChannels[dmIndex] = {
        ...dm,
        messages: [...dm.messages, message],
        unread: true,
        unreadCount: dm.unreadCount + 1,
        unreadForSeller: isCMMessage ? dm.unreadForSeller + 1 : dm.unreadForSeller,
        unreadForCM: isSellerMessage ? dm.unreadForCM + 1 : dm.unreadForCM,
        lastActivity: new Date(),
      };

      return {
        ...state,
        sellerDMChannels: updatedSellerDMChannels,
      };
    }

    case "SELLER_DM_VIEWED": {
      const { sellerDMId, personaId } = event.payload;
      
      // Find the target DM - bail early if not found
      const dmIndex = state.sellerDMChannels.findIndex(dm => dm.id === sellerDMId);
      if (dmIndex === -1) return state;
      
      const dm = state.sellerDMChannels[dmIndex];
      const isCM = personaId === dm.cmPersonaId;

      const updatedSellerDMChannels = state.sellerDMChannels.slice();
      updatedSellerDMChannels[dmIndex] = {
        ...dm,
        unread: false,
        unreadCount: 0,
        unreadForSeller: !isCM ? 0 : dm.unreadForSeller,
        unreadForCM: isCM ? 0 : dm.unreadForCM,
      };

      return {
        ...state,
        sellerDMChannels: updatedSellerDMChannels,
      };
    }

    case "SELLER_DM_CHANNEL_CREATED": {
      const { sellerDMId, sellerId, sellerName, cmPersonaId, cmName, sourceEnquiryId } = event.payload;
      
      // Check if channel already exists (with defensive check)
      if ((state.sellerDMChannels || []).some(dm => dm.id === sellerDMId)) {
        return state;
      }
      
      // Create new channel
      const newChannel: SellerDMChannel = {
        id: sellerDMId,
        sellerId,
        sellerName,
        cmPersonaId,
        cmName,
        messages: [],
        unread: false,
        unreadCount: 0,
        unreadForSeller: 0,
        unreadForCM: 0,
        lastActivity: new Date(),
        sourceEnquiryId, // Store the source enquiry for UI grouping
      };
      
      return {
        ...state,
        sellerDMChannels: [...(state.sellerDMChannels || []), newChannel],
      };
    }

    case "MENTION_READ": {
      const { messageId, personaId } = event.payload;
      
      // Helper function to update a message
      const updateMessage = (msg: Message): Message => {
        if (msg.id !== messageId) return msg;
        
        // Check if persona was mentioned
        if (!msg.mentions?.includes(personaId)) return msg;
        
        // Check if already read
        if (msg.mentionReadBy?.includes(personaId)) return msg;
        
        // Add to mentionReadBy
        return {
          ...msg,
          mentionReadBy: [...(msg.mentionReadBy || []), personaId],
        };
      };
      
      // Update in regular messages
      let updatedMessages = state.messages;
      let messageUpdated = false;
      
      for (const enquiryId in updatedMessages) {
        if (messageUpdated) break;
        for (const channelId in updatedMessages[enquiryId]) {
          const messages = updatedMessages[enquiryId][channelId];
          const updatedChannelMessages = messages.map(updateMessage);
          
          // Check if any message actually changed
          const hasChanges = updatedChannelMessages.some((msg, idx) => msg !== messages[idx]);
          
          if (hasChanges) {
            updatedMessages = {
              ...updatedMessages,
              [enquiryId]: {
                ...updatedMessages[enquiryId],
                [channelId]: updatedChannelMessages,
              },
            };
            messageUpdated = true;
            break;
          }
        }
      }
      
      // Update in buyer DM channels
      if (!messageUpdated) {
        const updatedBuyerDMs = state.buyerDMChannels.map(dm => {
          const updatedDMMessages = dm.messages.map(updateMessage);
          if (updatedDMMessages !== dm.messages) {
            messageUpdated = true;
            return { ...dm, messages: updatedDMMessages };
          }
          return dm;
        });
        
        if (messageUpdated) {
          return {
            ...state,
            messages: updatedMessages,
            buyerDMChannels: updatedBuyerDMs,
          };
        }
      }
      
      // Update in seller DM channels
      if (!messageUpdated) {
        const updatedSellerDMs = state.sellerDMChannels.map(dm => {
          const updatedDMMessages = dm.messages.map(updateMessage);
          if (updatedDMMessages !== dm.messages) {
            messageUpdated = true;
            return { ...dm, messages: updatedDMMessages };
          }
          return dm;
        });
        
        if (messageUpdated) {
          return {
            ...state,
            messages: updatedMessages,
            sellerDMChannels: updatedSellerDMs,
          };
        }
      }
      
      // Return updated state or original if no changes
      return messageUpdated ? { ...state, messages: updatedMessages } : state;
    }

    case "GROUP_CREATED":
      return handleGroupCreated(state, event);

    case "GROUP_MEMBERS_ADDED":
      return handleGroupMembersAdded(state, event);

    case "GROUP_TAGGED":
      return handleGroupTagged(state, event);

    case "GROUP_APPROVED": {
      const { groupId, approvedBy } = event.payload;
      return handleGroupApproved(state, groupId, approvedBy, event.payload.timestamp);
    }

    case "GROUP_REJECTED": {
      const { groupId, rejectedBy, reason } = event.payload;
      return handleGroupRejected(state, groupId, rejectedBy, reason, event.payload.timestamp);
    }

    case "GROUP_VIEWED": {
      const { groupId } = event.payload;
      
      // Find the target group - bail early if not found
      const groupIndex = state.groupChannels.findIndex(g => g.id === groupId);
      if (groupIndex === -1) return state;
      
      const group = state.groupChannels[groupIndex];
      
      // Already read - no change needed
      if (!group.unread && !group.unreadCount) return state;
      
      const updatedGroups = state.groupChannels.slice();
      updatedGroups[groupIndex] = {
        ...group,
        unread: false,
        unreadCount: 0,
      };
      
      return {
        ...state,
        groupChannels: updatedGroups,
      };
    }

    case "INVITE_SENT":
      return handleInviteSent(state, event);

    case "INVITE_ACCEPTED":
      return handleInviteAccepted(state, event);

    case "INVITE_REJECTED":
      return handleInviteRejected(state, event);

    case "INVITE_EXPIRED":
      return handleInviteExpired(state, event);

    case "THREAD_CREATED": {
      const {
        threadId,
        channelId,
        creatorId,
        timestamp,
        title,
        enquiryId,
        rootMessageId,
        rootMessage,
        unread,
        unreadCount,
      } = event.payload;
      
      // Find the parent group
      const groupIdx = state.groupChannels.findIndex(g => g.id === channelId);
      if (groupIdx === -1) return state;
      
      const parentGroup = state.groupChannels[groupIdx];
      const existingThreads = parentGroup.threads || [];
      
      // Don't create duplicate
      if (existingThreads.some(t => t.id === threadId)) return state;
      
      const newThread: Thread = {
        id: threadId,
        groupId: channelId,
        rootMessageId: rootMessageId || "", // Set by caller or linked later
        rootMessage: rootMessage || (rootMessageId ? parentGroup.messages.find(m => m.id === rootMessageId) : undefined),
        title,                  // Optional: thread title from Share Modal
        enquiryId,              // Optional: enquiry tag from Share Modal
        messages: [],
        replyCount: 0,
        participants: [creatorId],
        createdBy: creatorId,
        createdAt: timestamp,
        unread: unread ?? false,
        unreadCount: unreadCount ?? 0,
      };
      
      // Also link the root message to this thread (set threadId + replyCount on the message)
      let updatedMessages = parentGroup.messages;
      if (rootMessageId) {
        const rootMsgIdx = parentGroup.messages.findIndex(m => m.id === rootMessageId);
        if (rootMsgIdx !== -1) {
          updatedMessages = parentGroup.messages.slice();
          updatedMessages[rootMsgIdx] = {
            ...updatedMessages[rootMsgIdx],
            threadId,
            replyCount: updatedMessages[rootMsgIdx].replyCount ?? 0,
          };
        }
      }

      const updatedGroups = state.groupChannels.slice();
      updatedGroups[groupIdx] = {
        ...parentGroup,
        messages: updatedMessages,
        threads: [...existingThreads, newThread],
      };
      
      return { ...state, groupChannels: updatedGroups };
    }

    case "THREAD_MESSAGE_SENT": {
      const { threadId, channelId, message, timestamp } = event.payload;
      
      // Find the parent group
      const groupIdx = state.groupChannels.findIndex(g => g.id === channelId);
      if (groupIdx === -1) return state;
      
      const parentGroup = state.groupChannels[groupIdx];
      const threads = parentGroup.threads || [];
      const threadIdx = threads.findIndex(t => t.id === threadId);
      if (threadIdx === -1) return state;
      
      const thread = threads[threadIdx];
      
      // Duplicate check
      if (thread.messages.some(m => m.id === message.id)) return state;
      
      // Update thread
      const updatedParticipants = thread.participants.includes(message.senderPersonaId || "")
        ? thread.participants
        : [...thread.participants, message.senderPersonaId || ""];
      
      const updatedThreads = threads.slice();
      updatedThreads[threadIdx] = {
        ...thread,
        messages: [...thread.messages, message],
        replyCount: thread.replyCount + 1,
        lastReplyAt: timestamp,
        participants: updatedParticipants,
        unread: true,
        unreadCount: (thread.unreadCount || 0) + 1,
      };
      
      // Also update the root message in the group's main chat to reflect thread indicators
      const rootMsgId = thread.rootMessageId;
      const updatedGroupMessages = parentGroup.messages.map(msg => {
        if (msg.id === rootMsgId) {
          return {
            ...msg,
            threadId,
            replyCount: thread.replyCount + 1,
            lastReplyAt: timestamp,
            threadParticipants: updatedParticipants,
          };
        }
        return msg;
      });
      
      const updatedGroups = state.groupChannels.slice();
      updatedGroups[groupIdx] = {
        ...parentGroup,
        threads: updatedThreads,
        messages: updatedGroupMessages,
        lastActivity: timestamp,
      };
      
      return { ...state, groupChannels: updatedGroups };
    }

    case "THREAD_VIEWED": {
      const { threadId, personaId } = event.payload;
      
      // Find the thread across all groups
      for (let gi = 0; gi < state.groupChannels.length; gi++) {
        const group = state.groupChannels[gi];
        const threads = group.threads || [];
        const threadIdx = threads.findIndex(t => t.id === threadId);
        
        if (threadIdx !== -1) {
          const thread = threads[threadIdx];
          if (!thread.unread && !thread.unreadCount) return state;
          
          const updatedThreads = threads.slice();
          updatedThreads[threadIdx] = {
            ...thread,
            unread: false,
            unreadCount: 0,
          };
          
          const updatedGroups = state.groupChannels.slice();
          updatedGroups[gi] = {
            ...group,
            threads: updatedThreads,
          };
          
          return { ...state, groupChannels: updatedGroups };
        }
      }
      
      return state;
    }

    case "THREAD_TAGGED": {
      const { threadId, enquiryId, timestamp } = event.payload;
      
      // Find the thread across all groups and tag it with enquiry ID
      for (let gi = 0; gi < state.groupChannels.length; gi++) {
        const group = state.groupChannels[gi];
        const threads = group.threads || [];
        const threadIdx = threads.findIndex(t => t.id === threadId);
        
        if (threadIdx !== -1) {
          const thread = threads[threadIdx];
          
          const updatedThreads = threads.slice();
          updatedThreads[threadIdx] = {
            ...thread,
            enquiryId,
          };
          
          const updatedGroups = state.groupChannels.slice();
          updatedGroups[gi] = {
            ...group,
            threads: updatedThreads,
            lastActivity: timestamp,
          };
          
          return { ...state, groupChannels: updatedGroups };
        }
      }
      
      return state;
    }

    default:
      return state;
  }
};
