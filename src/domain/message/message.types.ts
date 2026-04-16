/**
 * Domain: Message Types
 * 
 * Core message entity and channel types.
 */

export type UserRole = "BDM" | "CM" | "CX" | "Buyer" | "Seller";

export type MessageType = "user" | "system" | "shared" | "voice";

export type ChannelType = "communication" | "internal";

export interface MessageAttachment {
  name: string;
  type: string;
  url?: string;
  markAsPO?: boolean;
}

// Alias for convenience
export type Attachment = MessageAttachment;

export interface VoiceMessageData {
  blob: Blob;
  url: string;
  durationMs: number;
  transcription: {
    text: string;
    status: "complete" | "partial" | "failed";
  };
}

export interface SharedMetadata {
  enquiryId?: string; // Source enquiry ID if shared from another enquiry
  channel: string;
  originalSender: string;
  originalSenderPersonaId?: string;
  originalTimestamp: Date;
}

export interface Message {
  id: string;
  type: MessageType;
  sender?: string;
  senderPersonaId?: string;
  senderRole?: UserRole;
  content: string;
  timestamp: Date;
  attachment?: MessageAttachment;
  audioRecording?: VoiceMessageData; // NEW: Voice message support
  mentions?: string[]; // Array of persona IDs mentioned in the message
  mentionReadBy?: string[]; // Array of persona IDs who have read this mention
  sharedFrom?: SharedMetadata;
  edited?: boolean;
  masked?: boolean;
  displaySender?: string;
  hidden?: boolean; // Messages hidden after sharing (desktop only - show shared, hide source)

  // Share policy rendering hint (set by the new share policy pipeline)
  shareRenderMode?: "shared-badge" | "inline" | "quote-block" | "system-notification";

  /** Persona who shared this message into the current channel (cross-group / thread share). */
  sharedByPersonaId?: string;

  // Optional marker used for CM-shared RFQ messages in internal chat.
  sellerRfq?: boolean;

  /** BDM-marked buyer confirmation on a text/voice message (win signal). */
  markAsBuyerConfirmation?: boolean;

  // Thread indicators (for group main chat messages that are thread roots)
  threadId?: string;              // If this message is a thread root, the thread's ID
  replyCount?: number;            // Number of replies in the thread
  lastReplyAt?: Date;             // Timestamp of the last reply
  threadParticipants?: string[];  // Persona IDs who have replied in the thread
}

export interface Channel {
  id: string;
  label: string;
  icon: string | null;
  unread: boolean;
  type: ChannelType;
}

export interface SellerChannel {
  id: string;
  sellerId: string;
  sellerName: string;
  enquiryId: string;
  messages: Message[];
  unread: boolean;
}

// NOTE: SellerDMChannel has been moved to "./seller-dm.types" as the canonical location.
// Import from there: import { SellerDMChannel } from "./seller-dm.types"

// Channel visibility matrix by role
export const CHANNEL_VISIBILITY: Record<UserRole, string[]> = {
  BDM: ["buyer", "internal"],
  CM: ["seller", "internal"],
  CX: ["internal"],
  Buyer: ["buyer"],
  Seller: ["seller"],
};

// Static channels available in all enquiries
export const STATIC_CHANNELS: Channel[] = [
  { id: "buyer", label: "Buyer", icon: null, unread: false, type: "communication" },
  { id: "seller", label: "Seller", icon: null, unread: false, type: "communication" },
  { id: "internal", label: "Internal", icon: null, unread: false, type: "internal" },
];
