/**
 * Domain: Share Policy Types
 *
 * Declarative type system for role-aware, source-aware, target-aware
 * message sharing.  Every share operation resolves a SharePolicy from
 * the registry before any message transformation or UI rendering.
 *
 * Dimensions:
 *   role        – who is performing the share  (BDM | CM | CX | Buyer | Seller)
 *   sourceType  – where the message lives now  (ShareSourceKind)
 *   targetType  – where the message will go    (ShareTargetKind)
 *   groupType   – buyer / seller / custom      (optional qualifier)
 */

import type { UserRole } from "../message/message.types";

// ── Source & Target Kinds ────────────────────────────────────────────

/** Where the message currently lives. */
export type ShareSourceKind =
  | "group-main"          // Group main chat message
  | "thread"              // Thread reply inside a group
  | "buyer-dm"            // Buyer DM channel
  | "seller-dm"           // Seller DM channel
  | "enquiry-internal"    // Enquiry internal channel
  | "enquiry-buyer"       // Enquiry buyer channel
  | "enquiry-seller"      // Enquiry seller channel
  ;

/** Where the message is being sent to. */
export type ShareTargetKind =
  | "group-main"          // Another group's main chat
  | "thread"              // Existing thread in a group
  | "new-thread"          // New thread (creates enquiry + thread)
  | "buyer-dm"            // Buyer DM channel (single or multi)
  | "seller-dm"           // Seller DM channel (single or multi)
  | "enquiry-internal"    // Enquiry internal channel
  | "enquiry-buyer"       // Enquiry buyer channel
  | "enquiry-seller"      // Enquiry seller channel
  ;

/** Group flavour — qualifies source/target when group-related. */
export type GroupKind = "buyer" | "seller" | "custom";

// ── Share Context ────────────────────────────────────────────────────

/**
 * Full context for a single share operation.
 * This is the "key" used to look up the applicable SharePolicy.
 */
export interface ShareContext {
  /** Role of the user performing the share. */
  role: UserRole;

  /** Where the messages are coming from. */
  sourceKind: ShareSourceKind;
  /** Optional: group type of the source (when source is group-main or thread). */
  sourceGroupKind?: GroupKind;
  /** Optional: specific source ID (group ID, DM channel ID, enquiry ID). */
  sourceId?: string;

  /** Where the messages are going. */
  targetKind: ShareTargetKind;
  /** Optional: group type of the target (when target is group-main, thread, or new-thread). */
  targetGroupKind?: GroupKind;
  /** Optional: specific target ID. */
  targetId?: string;
}

// ── Masking Strategy ─────────────────────────────────────────────────

/**
 * How the original message identity is masked when shared.
 *
 *   none              – preserve original sender & metadata
 *   seller-anonymous  – replace sender with "Seller" / "Seller response"
 *   company-rebrand   – replace internal senders with company name ("Birla Pivot")
 *   current-user      – message appears as if the sharer sent it (no share badge)
 */
export type MaskingStrategy =
  | "none"
  | "seller-anonymous"
  | "company-rebrand"
  | "current-user"
  ;

// ── Attribution Strategy ─────────────────────────────────────────────

/**
 * How the shared message is attributed to the viewer.
 *
 *   original-sender   – show the original sender name/persona
 *   sharer            – show the person who shared it
 *   company           – show company name (e.g. "Birla Pivot")
 *   anonymous         – show a generic label ("Shared message")
 */
export type AttributionStrategy =
  | "original-sender"
  | "sharer"
  | "company"
  | "anonymous"
  ;

// ── Message Rendering Hints ──────────────────────────────────────────

/**
 * How the shared message renders in the target context.
 *
 *   shared-badge       – standard "Shared from #channel" pill + shared content block
 *   inline             – appears as a normal message (no sharing indicator)
 *   quote-block        – rendered as a quote/blockquote with attribution
 *   system-notification – system message style ("X shared a message to this thread")
 */
export type ShareRenderMode =
  | "shared-badge"
  | "inline"
  | "quote-block"
  | "system-notification"
  ;

// ── Share Policy ─────────────────────────────────────────────────────

/**
 * The resolved share policy for a given ShareContext.
 * This is the single source of truth that the transformation pipeline
 * and UI components read from — they never decide on their own.
 */
export interface SharePolicy {
  /** Is this share operation allowed? */
  allowed: boolean;

  /** Reason for denial (populated when `allowed === false`). */
  denialReason?: string;

  // ── Pre-share UI ──────────────────────────────────────────────────

  /** Can the user edit message content before sharing? */
  canEditBeforeShare: boolean;

  /** Should the share preview/confirmation be shown? */
  showPreview: boolean;

  /** Which share route modes are available for this context? */
  availableRouteModes: ShareRouteMode[];

  // ── Transformation ────────────────────────────────────────────────

  /** How to mask the message identity. */
  masking: MaskingStrategy;

  /** How to attribute the shared message. */
  attribution: AttributionStrategy;

  /** What message `type` the shared message gets. */
  resultMessageType: "shared" | "user" | "system";

  // ── Rendering ─────────────────────────────────────────────────────

  /** How the shared message renders in the target context. */
  renderMode: ShareRenderMode;

  /** Should the source channel label be shown in the shared message? */
  showSourceLabel: boolean;

  /** Should the original timestamp be shown? */
  showOriginalTimestamp: boolean;

  // ── Post-share ────────────────────────────────────────────────────

  /** Should the source messages be hidden after sharing? */
  hideSourceAfterShare: boolean;

  /** Should we auto-navigate to the target after sharing? */
  navigateToTarget: boolean;
}

/** Re-export for convenience. */
export type ShareRouteMode = "existing-thread" | "new-enquiry";

// ── Share Target Descriptor ──────────────────────────────────────────

/**
 * Describes an available share target returned by `getAvailableTargets()`.
 * UI components render these as selectable options in the share modal.
 */
export interface ShareTargetDescriptor {
  kind: ShareTargetKind;
  id: string;
  label: string;
  groupKind?: GroupKind;
  /** Resolved policy for this specific target (pre-computed for UI use). */
  policy: SharePolicy;
}

// ── Rule definition (for the registry) ───────────────────────────────

/**
 * A single rule in the share policy registry.
 * Uses `"*"` as a wildcard to match any value for a dimension.
 */
export interface SharePolicyRule {
  /** Match criteria — `"*"` means "any". */
  role: UserRole | "*";
  sourceKind: ShareSourceKind | "*";
  targetKind: ShareTargetKind | "*";
  sourceGroupKind?: GroupKind | "*";
  targetGroupKind?: GroupKind | "*";

  /** Priority (higher = checked first). Rules with more specific matches should have higher priority. */
  priority: number;

  /** The policy to apply when this rule matches. Can be a partial — will be merged with defaults. */
  policy: Partial<SharePolicy>;
}
