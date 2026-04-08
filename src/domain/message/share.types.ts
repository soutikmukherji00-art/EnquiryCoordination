/**
 * Domain: Share Types
 *
 * Types for the unified share modal — single-surface modal that replaces
 * all previous inline share dialogs across ConversationPanel, ThreadPanel,
 * BuyerDM, SellerDM contexts.
 *
 * Route modes:
 *   existing-thread — share a concatenated message to an existing thread
 *   new-enquiry     — create a new Enquiry entity + tagged thread; the shared
 *                     message becomes the thread header, Enquiry ID is the flair
 */

import type { Message } from "./message.types";

// ── Source context ────────────────────────────────────────────────────

export type ShareSourceType =
  | "group"           // Group main chat
  | "thread"          // Thread replies (inside a group)
  | "buyer-dm"        // Buyer DM channel
  | "seller-dm"       // Seller DM channel
  | "enquiry-channel" // Legacy enquiry channel (internal/buyer/seller)
  ;

export interface ShareSourceContext {
  type: ShareSourceType;
  id: string;             // Group ID, DM channel ID, or enquiry ID
  name: string;           // Human-readable label for the header
  channel?: string;       // Sub-channel within source (e.g. "internal", "buyer")
  groupId?: string;       // Parent group ID (for thread sources)
  enquiryId?: string;     // Enquiry ID from source thread — enables cross-group thread clustering
}

// ── Route modes ──────────────────────────────────────────────────────

export type ShareRouteMode = "existing-thread" | "new-enquiry";

// ── Enquiry draft (for new-enquiry route) ────────────────────────────

export interface NewEnquiryDraft {
  title: string;
  buyerPersonaId?: string;
  categories?: string[];
  deliveryLocation?: string;
}

// ── Share draft (UI state) ───────────────────────────────────────────

export interface ShareDraft {
  isOpen: boolean;

  // Source
  sourceContext: ShareSourceContext;
  selectedMessageIds: string[];
  sourceMessages: Message[];

  // Target (multi-group)
  targetGroupIds: string[];
  routeMode: ShareRouteMode;

  // Route-specific (only valid when single group selected)
  targetThreadId: string | null;          // existing-thread
  newEnquiryDraft: NewEnquiryDraft | null; // new-enquiry

  // Concatenated message content — all selected messages joined with \n,
  // editable by the user in a single textarea
  concatenatedContent: string;

  // CM-only marker for external → internal shares that should be tagged as RFQ.
  sellerRfq?: boolean;

  // Smart defaults snapshot (for telemetry comparison at submit time)
  _defaultGroupIds?: string[];
  _defaultRouteMode?: ShareRouteMode;
  _defaultThreadId?: string | null;
}

/**
 * Build the initial concatenated content from an array of messages.
 * Each message's content is joined with a blank-line separator.
 */
export function buildConcatenatedContent(messages: Message[]): string {
  return messages.map((m) => m.content).filter(Boolean).join("\n");
}

export const EMPTY_SHARE_DRAFT: ShareDraft = {
  isOpen: false,
  sourceContext: { type: "group", id: "", name: "" },
  selectedMessageIds: [],
  sourceMessages: [],
  targetGroupIds: [],
  routeMode: "existing-thread",
  targetThreadId: null,
  newEnquiryDraft: null,
  concatenatedContent: "",
  sellerRfq: false,
  _defaultGroupIds: [],
  _defaultRouteMode: "existing-thread",
  _defaultThreadId: null,
};

// ── Submit payload ───────────────────────────────────────────────────

export interface ShareSubmitPayload {
  sourceContext: ShareSourceContext;
  targetGroupIds: string[];
  routeMode: ShareRouteMode;
  targetThreadId?: string;
  newEnquiryDraft?: NewEnquiryDraft;
  concatenatedContent: string;
  edited: boolean;
  metadata: ShareSubmitMetadata;
}

export interface ShareSubmitMetadata {
  shareRouteType: ShareRouteMode;
  defaultGroupAccepted: boolean;
  defaultThreadAccepted: boolean;
  defaultModeAccepted: boolean;
  editedBeforeSend: boolean;
  messageCount: number;
  timestamp: Date;
}

// ── Eligible group (pre-filtered for the current role) ───────────────

export interface EligibleGroup {
  id: string;
  name: string;
  type: "buyer" | "seller" | "custom";
  category: "internal" | "external";
  threadCount: number;
  lastActivity?: Date;
}

// ── Eligible thread (within the selected group) ──────────────────────

export interface EligibleThread {
  id: string;
  title?: string;
  enquiryId?: string;
  replyCount: number;
  lastReplyAt?: Date;
  participants: string[];
  recommended?: boolean;  // Smart-default candidate
}

// ── Telemetry ────────────────────────────────────────────────────────

export type ShareTelemetryEvent =
  | "share_modal_opened"
  | "share_default_changed"
  | "share_mode_changed"
  | "share_preview_edited"
  | "share_submitted"
  | "share_cancelled"
  | "share_validation_failed"
  | "share_enquiry_created"
  ;

export interface ShareTelemetryEntry {
  event: ShareTelemetryEvent;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ── Validation ───────────────────────────────────────────────────────

export interface ShareValidationErrors {
  targetGroupId?: string;
  targetThreadId?: string;
  concatenatedContent?: string;
}

export function validateShareDraft(draft: ShareDraft): ShareValidationErrors {
  const errors: ShareValidationErrors = {};

  if (draft.targetGroupIds.length === 0) {
    errors.targetGroupId = "Select at least one target group";
  }

  // Single-group shares must go to an existing thread or a new-enquiry route.
  if (
    draft.targetGroupIds.length === 1 &&
    draft.routeMode === "existing-thread" &&
    !draft.targetThreadId
  ) {
    errors.targetThreadId = "Select a thread or create a new enquiry";
  }

  // Concatenated content must not be empty
  if (!draft.concatenatedContent.trim()) {
    errors.concatenatedContent = "Message content cannot be empty";
  }

  return errors;
}

export function isShareValid(errors: ShareValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
