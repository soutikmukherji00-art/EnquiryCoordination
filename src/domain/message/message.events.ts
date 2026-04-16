/**
 * Domain: Message Events
 * 
 * All message operations expressed as domain events.
 */

import { Message, MessageAttachment } from "./message.types";
import { UserRole } from "./user.types";
import { GroupChannel, GroupMember } from "./group.types";
import { GroupInviteEvent } from "./group-invite.events";
import { Thread } from "./thread.types";

export type MessageEvent =
  | MessageSentEvent
  | MessageSharedEvent
  | MessageEditedEvent
  | MessageWinMarksUpdatedEvent
  | SellerChannelCreatedEvent
  | MessagesFanOutEvent
  | BuyerDMMessageSentEvent
  | SellerDMMessageSentEvent
  | SellerDMChannelCreatedEvent
  | MentionReadEvent
  | BuyerDMViewedEvent
  | SellerDMViewedEvent
  | GroupCreatedEvent
  | GroupApprovedEvent
  | GroupRejectedEvent
  | GroupMembersAddedEvent
  | GroupTaggedEvent
  | GroupViewedEvent
  | GroupInviteEvent
  | ThreadCreatedEvent
  | ThreadMessageSentEvent
  | ThreadViewedEvent
  | ThreadTaggedEvent
  | DomainEvent;

export interface MessageSentEvent {
  type: "MESSAGE_SENT";
  payload: {
    enquiryId: string;
    channelId: string;
    message: Message;
    timestamp: Date;
  };
}

export interface BuyerDMMessageSentEvent {
  type: "BUYER_DM_MESSAGE_SENT";
  payload: {
    buyerDMId: string;
    message: Message;
    timestamp: Date;
  };
}

export interface MessageSharedEvent {
  type: "MESSAGE_SHARED";
  payload: {
    enquiryId: string;
    fromChannel: string;
    toChannel: string;
    messages: Message[];
    sharedBy: string;
    sharedByRole: string;
    edited: boolean;
    masked: boolean;
    timestamp: Date;
  };
}

export interface MessageEditedEvent {
  type: "MESSAGE_EDITED";
  payload: {
    enquiryId: string;
    channelId: string;
    messageId: string;
    newContent: string;
    editedBy: string;
    timestamp: Date;
  };
}

export interface MessageWinMarksUpdatedEvent {
  type: "MESSAGE_WIN_MARKS_UPDATED";
  payload: {
    messageId: string;
    markAsPO?: boolean;
    buyerConfirmation?: boolean;
    timestamp: Date;
  };
}

export interface SellerChannelCreatedEvent {
  type: "SELLER_CHANNEL_CREATED";
  payload: {
    enquiryId: string;
    sellerId: string;
    sellerName: string;
    createdBy: string;
    createdByRole: string;
    timestamp: Date;
  };
}

export interface MessagesFanOutEvent {
  type: "MESSAGES_FAN_OUT";
  payload: {
    enquiryId: string;
    fromChannel: string;
    sellerIds: string[];
    messages: Message[];
    sentBy: string;
    sentByRole: string;
    timestamp: Date;
  };
}

export interface DomainEvent {
  type: string;
  payload: any;
  timestamp: Date;
}

export function createShareMessagesEvent(
  messageIds: string[],
  toChannel: string,
  fromChannel: string,
  actor: string,
  actorRole: UserRole,
  editedContents?: Record<string, string>
): DomainEvent {
  return {
    type: "MESSAGES_SHARED",
    payload: {
      messageIds,
      toChannel,
      fromChannel,
      actor,
      actorRole,
      editedContents,
      timestamp: new Date(),
    },
  };
}

export function createAudioMessageEvent(
  enquiryId: string,
  channel: string,
  sender: string,
  senderRole: UserRole,
  audioUrl: string,
  audioBlob: Blob,
  content?: string
): DomainEvent {
  return {
    type: "AUDIO_MESSAGE_ADDED",
    payload: {
      enquiryId,
      channel,
      sender,
      senderRole,
      audioUrl,
      audioBlob,
      content: content || "Voice message",
      timestamp: new Date(),
    },
  };
}

export function createTranscriptionUpdatedEvent(
  messageId: string,
  transcription: string
): DomainEvent {
  return {
    type: "TRANSCRIPTION_UPDATED",
    payload: {
      messageId,
      transcription,
      timestamp: new Date(),
    },
  };
}

/**
 * Seller DM Events
 */
export interface SellerDMMessageSentEvent {
  type: "SELLER_DM_MESSAGE_SENT";
  payload: {
    sellerDMId: string;
    message: Message;
    timestamp: Date;
  };
}

export interface SellerDMChannelCreatedEvent {
  type: "SELLER_DM_CHANNEL_CREATED";
  payload: {
    sellerDMId: string;
    sellerId: string;
    sellerName: string;
    cmPersonaId: string;
    cmName: string;
    createdBy: string;
    timestamp: Date;
    sourceEnquiryId?: string; // The enquiry from which this channel was created
  };
}

export interface MentionReadEvent {
  type: "MENTION_READ";
  payload: {
    messageId: string;
    personaId: string;
    timestamp: Date;
  };
}

/**
 * Buyer DM Viewed Event - clears unread count
 */
export interface BuyerDMViewedEvent {
  type: "BUYER_DM_VIEWED";
  payload: {
    buyerDMId: string;
    personaId: string;
    timestamp: Date;
  };
}

/**
 * Seller DM Viewed Event - clears unread count
 */
export interface SellerDMViewedEvent {
  type: "SELLER_DM_VIEWED";
  payload: {
    sellerDMId: string;
    personaId: string;
    timestamp: Date;
  };
}

/**
 * Group Events
 */
export interface GroupCreatedEvent {
  type: "GROUP_CREATED";
  payload: {
    groupId: string;
    name: string;
    type: "buyer" | "seller" | "custom";
    channelKind?: "whatsapp" | "mail";
    status: "pending" | "active";
    members: GroupMember[];
    createdBy: string;
    pendingMessage?: string; // Optional message for pending groups
    buyerId?: string;
    buyerPersonaId?: string;
    sellerId?: string;
    timestamp: Date;
  };
}

export interface GroupApprovedEvent {
  type: "GROUP_APPROVED";
  payload: {
    groupId: string;
    approvedBy: string;
    timestamp: Date;
  };
}

export interface GroupRejectedEvent {
  type: "GROUP_REJECTED";
  payload: {
    groupId: string;
    rejectedBy: string;
    reason?: string;
    timestamp: Date;
  };
}

export interface GroupMembersAddedEvent {
  type: "GROUP_MEMBERS_ADDED";
  payload: {
    groupId: string;
    members: GroupMember[];
    addedBy: string;
    timestamp: Date;
  };
}

export interface GroupTaggedEvent {
  type: "GROUP_TAGGED";
  payload: {
    groupId: string;
    enquiryId: string;
    taggedByPersonaId: string;
    timestamp: Date;
  };
}

export interface GroupViewedEvent {
  type: "GROUP_VIEWED";
  payload: {
    groupId: string;
    personaId: string;
    timestamp: Date;
  };
}

/**
 * Thread Events
 */
export interface ThreadCreatedEvent {
  type: "THREAD_CREATED";
  payload: {
    threadId: string;
    channelId: string;
    creatorId: string;
    timestamp: Date;
    // Optional fields for Share Modal thread creation
    title?: string;
    enquiryId?: string;      // Tag thread with an enquiry
    rootMessageId?: string;   // Anchor message in group main chat
    rootMessage?: Message;    // Optional snapshot of the root message
    unread?: boolean;
    unreadCount?: number;
  };
}

export interface ThreadMessageSentEvent {
  type: "THREAD_MESSAGE_SENT";
  payload: {
    threadId: string;
    channelId: string;
    message: Message;
    timestamp: Date;
  };
}

export interface ThreadViewedEvent {
  type: "THREAD_VIEWED";
  payload: {
    threadId: string;
    personaId: string;
    timestamp: Date;
  };
}

export interface ThreadTaggedEvent {
  type: "THREAD_TAGGED";
  payload: {
    threadId: string;
    enquiryId: string;
    timestamp: Date;
  };
}

/**
 * Create a mention read event
 */
export function createMentionReadEvent(
  messageId: string,
  personaId: string
): MentionReadEvent {
  return {
    type: "MENTION_READ",
    payload: {
      messageId,
      personaId,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a buyer DM viewed event
 */
export function createBuyerDMViewedEvent(
  buyerDMId: string,
  personaId: string
): BuyerDMViewedEvent {
  return {
    type: "BUYER_DM_VIEWED",
    payload: {
      buyerDMId,
      personaId,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a seller DM viewed event
 */
export function createSellerDMViewedEvent(
  sellerDMId: string,
  personaId: string
): SellerDMViewedEvent {
  return {
    type: "SELLER_DM_VIEWED",
    payload: {
      sellerDMId,
      personaId,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a group created event
 */
export function createGroupCreatedEvent(group: GroupChannel): GroupCreatedEvent;
export function createGroupCreatedEvent(
  groupId: string | GroupChannel,
  name?: string,
  type?: "buyer" | "seller" | "custom",
  status?: "pending" | "active",
  members?: GroupMember[],
  createdBy?: string,
  pendingMessage?: string,
  metadata?: {
    channelKind?: "whatsapp" | "mail";
    buyerId?: string;
    buyerPersonaId?: string;
    sellerId?: string;
  }
): GroupCreatedEvent {
  if (typeof groupId !== "string") {
    const group = groupId as unknown as GroupChannel;
    const memberPersonaIds = group.memberPersonaIds?.length
      ? group.memberPersonaIds
      : group.memberIds || [];

    return {
      type: "GROUP_CREATED",
      payload: {
        groupId: group.id,
        name: group.name,
        type: group.type,
        channelKind: group.channelKind,
        status: group.status,
        members: memberPersonaIds.map((id) => ({
          id,
          type: "persona",
          name: id,
        })),
        createdBy: group.createdBy,
        pendingMessage: group.pendingMessage,
        buyerId: group.buyerId,
        buyerPersonaId: group.buyerPersonaId,
        sellerId: group.sellerId,
        timestamp: new Date(),
      },
    };
  }

  // Legacy positional form used by older group-creation callers:
  // createGroupCreatedEvent(groupId, enquiryId, name, memberPersonaIds, createdBy, status?)
  if (Array.isArray(status) && typeof members === "string") {
    const legacyGroupName = type || name || groupId;
    const legacyMembers = status
      .filter((id): id is string => typeof id === "string")
      .map((id) => ({
        id,
        type: "persona" as const,
        name: id,
      }));
    const legacyStatus =
      createdBy === "pending" || createdBy === "active"
        ? createdBy
        : "active";

    return {
      type: "GROUP_CREATED",
      payload: {
        groupId,
        name: legacyGroupName,
        type: "custom",
        status: legacyStatus,
        members: legacyMembers,
        createdBy: members,
        pendingMessage,
        timestamp: new Date(),
      },
    };
  }

  return {
    type: "GROUP_CREATED",
    payload: {
      groupId,
      name: name!,
      type: type!,
      channelKind: metadata?.channelKind,
      status: status!,
      members: members!,
      createdBy: createdBy!,
      pendingMessage,
      buyerId: metadata?.buyerId,
      buyerPersonaId: metadata?.buyerPersonaId,
      sellerId: metadata?.sellerId,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a group members added event
 */
export function createGroupMembersAddedEvent(
  groupId: string,
  members: GroupMember[],
  addedBy: string
): GroupMembersAddedEvent {
  return {
    type: "GROUP_MEMBERS_ADDED",
    payload: {
      groupId,
      members,
      addedBy,
      timestamp: new Date(),
    },
  };
}

export function createGroupTaggedEvent(
  groupId: string,
  enquiryId: string,
  taggedByPersonaId: string
): GroupTaggedEvent {
  return {
    type: "GROUP_TAGGED",
    payload: {
      groupId,
      enquiryId,
      taggedByPersonaId,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a group viewed event - clears unread state
 */
export function createGroupViewedEvent(
  groupId: string,
  personaId: string
): GroupViewedEvent {
  return {
    type: "GROUP_VIEWED",
    payload: {
      groupId,
      personaId,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a message sent event
 */
export function createMessageSentEvent(
  enquiryId: string,
  channelId: string,
  message: Message
): MessageSentEvent {
  return {
    type: "MESSAGE_SENT",
    payload: {
      enquiryId,
      channelId,
      message,
      timestamp: new Date(),
    },
  };
}

export function createMessageWinMarksUpdatedEvent(
  messageId: string,
  marks: { markAsPO?: boolean; buyerConfirmation?: boolean },
): MessageWinMarksUpdatedEvent {
  return {
    type: "MESSAGE_WIN_MARKS_UPDATED",
    payload: {
      messageId,
      markAsPO: marks.markAsPO,
      buyerConfirmation: marks.buyerConfirmation,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a message shared event
 */
export function createMessageSharedEvent(
  enquiryId: string,
  fromChannel: string,
  toChannel: string,
  messages: Message[],
  sharedBy: string,
  sharedByRole: string,
  edited: boolean = false,
  masked: boolean = false
): MessageSharedEvent {
  return {
    type: "MESSAGE_SHARED",
    payload: {
      enquiryId,
      fromChannel,
      toChannel,
      messages,
      sharedBy,
      sharedByRole,
      edited,
      masked,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a seller channel created event
 */
export function createSellerChannelCreatedEvent(
  enquiryId: string,
  sellerId: string,
  sellerName: string,
  createdBy: string,
  createdByRole: string
): SellerChannelCreatedEvent {
  return {
    type: "SELLER_CHANNEL_CREATED",
    payload: {
      enquiryId,
      sellerId,
      sellerName,
      createdBy,
      createdByRole,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a thread created event — a reply started a new thread on a group message
 */
export function createThreadCreatedEvent(
  threadId: string,
  channelId: string,
  creatorId: string,
  title?: string,
  enquiryId?: string,
  rootMessageId?: string,
  rootMessage?: Message,
  unread?: boolean,
  unreadCount?: number
): ThreadCreatedEvent {
  return {
    type: "THREAD_CREATED",
    payload: {
      threadId,
      channelId,
      creatorId,
      timestamp: new Date(),
      title,
      enquiryId,
      rootMessageId,
      rootMessage,
      unread,
      unreadCount,
    },
  };
}

/**
 * Create a thread message sent event — a message added inside a thread
 */
export function createThreadMessageSentEvent(
  threadId: string,
  channelId: string,
  message: Message
): ThreadMessageSentEvent {
  return {
    type: "THREAD_MESSAGE_SENT",
    payload: {
      threadId,
      channelId,
      message,
      timestamp: new Date(),
    },
  };
}

/**
 * Create a thread viewed event — clears unread state for a thread
 */
export function createThreadViewedEvent(
  threadId: string,
  personaId: string
): ThreadViewedEvent {
  return {
    type: "THREAD_VIEWED",
    payload: {
      threadId,
      personaId,
      timestamp: new Date(),
    },
  };
}
