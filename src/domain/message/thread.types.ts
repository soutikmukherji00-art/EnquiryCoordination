/**
 * Domain: Thread Types
 * 
 * Threads live inside Groups (like Slack threads).
 * A thread is started by replying to a message in the group main chat.
 * Threads can optionally be tagged with an Enquiry ID, making them "Enquiry Threads."
 * The Enquiry ID doubles as a Conversation ID that links threads across multiple groups.
 */

import { Message } from "./message.types";

/**
 * Thread — a reply chain rooted on a single group message.
 */
export interface Thread {
  id: string;                    // e.g., "thread_1"
  groupId: string;               // Parent group this thread belongs to
  rootMessageId: string;         // The message in the group main chat that started this thread
  rootMessage?: Message;         // Snapshot of the root message for resilient UI rendering
  enquiryId?: string;            // Tag: linked enquiry/conversation ID (e.g., "ENQ-2404")
  title?: string;                // Optional display title for the thread
  messages: Message[];           // Reply messages within the thread
  replyCount: number;            // Number of replies (kept in sync for quick access)
  lastReplyAt?: Date;            // Timestamp of the last reply
  participants: string[];        // Persona IDs who have replied
  createdBy: string;             // Persona ID of the thread creator
  createdAt: Date;

  // Unread tracking
  unread?: boolean;
  unreadCount?: number;
  hasMentions?: boolean;
}

/**
 * EnquiryThreadCluster — aggregation of threads across groups that share an enquiry ID.
 * Used for the "Enquiry Threads" tab in the left nav.
 */
export interface EnquiryThreadCluster {
  enquiryId: string;             // The shared enquiry / conversation ID
  buyerName?: string;
  buyerPersonaId?: string;       // Buyer persona ID for hover card resolution
  estimatedValue?: number;
  state?: string;
  categories?: string[];         // Product categories (e.g., ["Steel"], ["Steel", "Cement"])
  threads: EnquiryThreadRef[];
}

/**
 * Reference to a thread within a cluster (lightweight, for display in left nav).
 */
export interface EnquiryThreadRef {
  threadId: string;
  groupId: string;
  groupName: string;
  groupType: "internal" | "external";
  lastActivity?: Date;
  unread?: boolean;
  unreadCount?: number;
  replyCount: number;
  title?: string;
}

/**
 * Generate a unique thread ID.
 */
export function generateThreadId(): string {
  return `thread_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}
