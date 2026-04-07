/**
 * Domain: Message Sharing
 * 
 * Business logic for sharing messages between channels with editing support.
 * Pure functions with no side effects.
 *
 * MIGRATION NOTE:
 * The legacy functions (`prepareSharedMessages`, `concatenateSharedMessages`)
 * are retained for backward compatibility.  New code should prefer the
 * policy-driven pipeline from `@/domain/sharing`:
 *
 *   import { transformForShare } from "@/domain/sharing";
 *
 * The legacy functions will be removed once all call-sites are migrated.
 *
 * Migrated call-sites:
 *   - useShareMessages.ts    (Phase 8 — all 6 paths now use transformForShare)
 *   - useAppHandlers.ts      (Phase 8 — buyer DM → enquiry path)
 *   - useMessageHandlers.ts  (Phase 8 — buyer DM → enquiry path)
 *   - useMessages.ts         (Phase 8 — shareMessages function)
 *
 * Remaining legacy call-sites:
 *   - __architecture_check__.ts / __test__.ts (non-runtime, can be updated later)
 */

import { Message, UserRole } from "./message.types";
import { applyMasking } from "./message.masking";
import type { ShareContext } from "../sharing/share.policy.types";
import { transformForShare, type ShareTransformConfig } from "../sharing/share.transforms";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

export interface ShareConfig {
  fromChannel: string;
  toChannel: string;
  currentUser: string;
  currentRole: string;
  timestamp: Date;
  editedContents?: Record<string, string>;
  sourceEnquiryId?: string; // Source enquiry ID when sharing between enquiries
  baseTimestamp?: number; // Optional base timestamp to ensure uniqueness across multiple shares
}

/**
 * @deprecated Use `transformViaPolicy` or `transformForShare` from `@/domain/sharing`.
 *
 * Prepares messages for sharing with appropriate transformations.
 */
export const prepareSharedMessages = (
  messages: Message[],
  config: ShareConfig
): Message[] => {
  // Use provided baseTimestamp or generate once for the entire batch to ensure unique IDs
  const shareTimestamp = config.baseTimestamp ?? Date.now();
  
  return messages.map((msg, index) => {
    const wasEdited =
      config.editedContents &&
      config.editedContents[msg.id] &&
      config.editedContents[msg.id] !== msg.content;

    const contentToUse = wasEdited ? config.editedContents![msg.id] : msg.content;

    // Apply masking first
    let sharedMessage = applyMasking(
      msg,
      config.fromChannel,
      config.toChannel,
      config.currentUser,
      config.currentRole as any
    );

    // Build sharedFrom metadata - always include for shared messages
    // When sharing to seller DMs, exclude enquiry context
    const includeEnquiryContext = !config.toChannel.includes('seller-dm');
    
    const sharedFrom = sharedMessage.masked
      ? {
          enquiryId: includeEnquiryContext ? config.sourceEnquiryId : undefined,
          channel: "seller",
          originalSender: "Seller",
          originalTimestamp: msg.timestamp,
        }
      : {
          enquiryId: includeEnquiryContext ? config.sourceEnquiryId : undefined,
          channel: config.fromChannel,
          originalSender: msg.sender ? stripRoleSuffix(msg.sender) : "Unknown",
          originalTimestamp: msg.timestamp,
        };

    // Check if masking made it a user message (internal → external)
    if (sharedMessage.type === "user") {
      return {
        ...sharedMessage,
        id: `shr-${shareTimestamp}-${msg.id}-i${index}`,
        timestamp: config.timestamp,
        content: contentToUse,
        edited: wasEdited,
        sharedFrom, // Include shared metadata even for user-type messages
      };
    }

    // Regular share with metadata
    return {
      ...sharedMessage,
      id: `shr-${shareTimestamp}-${msg.id}-i${index}`,
      type: "shared",
      timestamp: config.timestamp,
      content: contentToUse,
      edited: wasEdited,
      sharedFrom,
    };
  });
};

/**
 * Checks if sharing target requires special handling
 */
export const isMultiSellerShare = (toChannel: string): boolean => {
  return toChannel.startsWith("seller-multi:");
};

/**
 * Extracts seller IDs from multi-seller share target
 */
export const extractSellerIds = (toChannel: string): string[] => {
  if (!isMultiSellerShare(toChannel)) {
    return [];
  }
  return toChannel.substring("seller-multi:".length).split(",");
};

/**
 * @deprecated Use `transformViaPolicy` or `transformForShare` from `@/domain/sharing`.
 *
 * Concatenates multiple prepared shared messages into a single shared message.
 * This matches the ShareModal behavior where multiple source messages are
 * joined into one editable block before dispatch.
 */
export const concatenateSharedMessages = (
  preparedMessages: Message[],
  senderName: string,
  senderPersonaId: string,
  senderRole: string,
  editedContents?: Record<string, string>,
  sourceMessages?: Message[],
): Message => {
  // Join all prepared-message contents with newline
  const concatenatedContent = preparedMessages
    .map((m) => m.content)
    .filter(Boolean)
    .join("\n");

  // Detect whether the user edited any content
  const wasEdited = !!(editedContents && sourceMessages &&
    sourceMessages.some(
      (src) =>
        editedContents[src.id] !== undefined &&
        editedContents[src.id] !== src.content,
    ));

  // Use sharedFrom metadata from the first prepared message
  const firstMsg = preparedMessages[0];

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: "shared",
    sender: stripRoleSuffix(senderName),
    senderPersonaId,
    senderRole,
    content: concatenatedContent,
    timestamp: firstMsg?.timestamp ?? new Date(),
    sharedFrom: firstMsg?.sharedFrom ?? {
      channel: "unknown",
      originalSender: "Unknown",
      originalTimestamp: new Date(),
    },
    edited: wasEdited,
  } as Message;
};

// ── New Policy-Driven Bridge ─────────────────────────────────────────

/**
 * Bridge: convert a legacy ShareConfig + source messages into the new
 * policy-driven `transformForShare` pipeline.
 *
 * Call this instead of `prepareSharedMessages` + `concatenateSharedMessages`
 * to get a single concatenated message that respects the share policy registry.
 */
export const transformViaPolicy = (
  sourceMessages: Message[],
  config: ShareConfig,
  sharerPersonaId: string = "",
): Message => {
  // Map legacy channel strings → ShareSourceKind / ShareTargetKind
  const sourceKind = mapChannelToSourceKind(config.fromChannel);
  const targetKind = mapChannelToTargetKind(config.toChannel);

  const context: ShareContext = {
    role: config.currentRole as UserRole,
    sourceKind,
    targetKind,
    sourceId: config.sourceEnquiryId,
  };

  const transformConfig: ShareTransformConfig = {
    context,
    sharerName: config.currentUser,
    sharerPersonaId,
    sharerRole: config.currentRole as UserRole,
    editedContents: config.editedContents,
    timestamp: config.timestamp,
  };

  return transformForShare(sourceMessages, transformConfig);
};

/**
 * Map legacy channel string → ShareSourceKind
 *
 * Channel ID formats:
 *   "internal"                    → enquiry internal channel
 *   "buyer"                       → enquiry buyer channel
 *   "seller"                      → enquiry seller channel (generic)
 *   "seller-{sellerId}"           → enquiry seller channel (specific)
 *   "seller-dm-{cmId}-{sellerId}" → seller direct message
 *   "buyer-dm" / "buyer-dm-*"    → buyer direct message
 *   "grp_*" / "group_*"          → group main chat
 */
function mapChannelToSourceKind(channel: string): import("../sharing/share.policy.types").ShareSourceKind {
  if (channel === "internal") return "enquiry-internal";
  if (channel.startsWith("buyer-dm")) return "buyer-dm";
  if (channel === "buyer") return "enquiry-buyer";
  if (channel.startsWith("seller-dm")) return "seller-dm";
  if (channel === "seller" || channel.startsWith("seller-")) return "enquiry-seller";
  if (channel.startsWith("grp_") || channel.startsWith("group_")) return "group-main";
  return "group-main";
}

/**
 * Map legacy channel string → ShareTargetKind
 * Same format conventions as mapChannelToSourceKind.
 */
function mapChannelToTargetKind(channel: string): import("../sharing/share.policy.types").ShareTargetKind {
  if (channel === "internal") return "enquiry-internal";
  if (channel.startsWith("buyer-dm") || channel.startsWith("buyer-multi:")) return "buyer-dm";
  if (channel === "buyer") return "enquiry-buyer";
  if (channel.startsWith("seller-dm") || channel.startsWith("seller-multi:")) return "seller-dm";
  if (channel === "seller" || channel.startsWith("seller-")) return "enquiry-seller";
  if (channel.startsWith("grp_") || channel.startsWith("group_")) return "group-main";
  return "group-main";
}
