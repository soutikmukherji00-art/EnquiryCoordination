/**
 * Group Channel - Unified model for all group communications
 */

import { Message } from "./message.types";
import { Thread } from "./thread.types";

export type GroupStatus = "active" | "pending" | "rejected";

/**
 * Group Member - represents a participant in a group
 */
export interface GroupMember {
  id: string;
  type: "persona" | "contact";  // persona = internal user, contact = external (buyer/seller)
  name: string;
  phone?: string;
  role?: string;
  buyerId?: string;    // For buyer contacts
  sellerId?: string;   // For seller contacts - NEW
}

export interface GroupChannel {
  id: string; // e.g., "group_1"
  name: string; // e.g., "Buyer <> Birla Pivot" or "Suresh Industries - Pricing"
  type: "buyer" | "seller" | "custom"; // Type of group
  channelKind?: "whatsapp" | "mail"; // Buyer/seller channel flavor within the same company
  status: GroupStatus; // active, pending, rejected
  memberIds: string[]; // References GroupMember.id[]
  memberPersonaIds: string[]; // Persona IDs of all members (both internal personas and external contacts mapped to personas)
  messages: Message[]; // Group messages
  createdBy: string; // Persona ID who created this group
  createdAt: Date;
  enquiryId?: string; // Optional: linked to enquiry if relevant
  buyerId?: string; // For buyer groups - which buyer company this group is for
  sellerId?: string; // For seller groups - which seller company this group is for - NEW
  
  // For pending groups
  pendingMessage?: string; // e.g., "Group Creation Pending - Waiting for approval"
  
  // Unread state
  unread?: boolean;
  unreadCount?: number;
  hasMentions?: boolean;
  lastActivity?: Date; // Last message timestamp
  
  // Threads within this group (Slack-like model)
  threads?: Thread[];
  
  // Legacy compatibility
  buyerPersonaId?: string; // For buyer groups
  sellerPersonaId?: string; // For seller groups
}
