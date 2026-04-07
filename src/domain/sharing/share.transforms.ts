/**
 * Domain: Share Transforms
 *
 * Pure message transformation pipeline driven by SharePolicy.
 * Replaces the old hardcoded masking + attribution logic in
 * `message.sharing.ts` and `message.masking.ts`.
 *
 * Pipeline:  source messages
 *   → applyShareMasking()     (identity masking per policy)
 *   → applyShareAttribution() (sender attribution per policy)
 *   → concatenateForShare()   (join N messages into 1)
 *   → buildSharedMessage()    (final message object)
 */

import type { Message, UserRole } from "../message/message.types";
import type {
  SharePolicy,
  ShareContext,
  MaskingStrategy,
  AttributionStrategy,
} from "./share.policy.types";
import { resolveSharePolicy } from "./share.policy.enforcement";
import { APP_CONFIG } from "../utils/constants";
import { stripRoleSuffix } from "@/domain/utils/name-utils";

// ── Config for the transform ─────────────────────────────────────────

export interface ShareTransformConfig {
  /** The resolved share context (role + source + target). */
  context: ShareContext;

  /** Display name of the person sharing. */
  sharerName: string;
  /** Persona ID of the person sharing. */
  sharerPersonaId: string;
  /** Role of the person sharing. */
  sharerRole: UserRole;

  /** Map of messageId → edited content (if the user edited before sharing). */
  editedContents?: Record<string, string>;

  /** Timestamp for the shared message. */
  timestamp?: Date;
}

// ── Masking ──────────────────────────────────────────────────────────

/**
 * Apply identity masking to a single message according to the policy's
 * masking strategy.  Returns a new message object (never mutates).
 */
export function applyPolicyMasking(
  msg: Message,
  strategy: MaskingStrategy,
  sharerName: string,
  sharerRole: UserRole,
): Message {
  switch (strategy) {
    case "none":
      return msg;

    case "seller-anonymous":
      return {
        ...msg,
        masked: true,
        sender: undefined,
        displaySender: "Seller response",
      };

    case "company-rebrand": {
      // Only rebrand internal senders
      const internalRoles: UserRole[] = ["BDM", "CM", "CX"];
      if (msg.senderRole && internalRoles.includes(msg.senderRole)) {
        return {
          ...msg,
          masked: true,
          sender: APP_CONFIG.COMPANY_NAME,
          displaySender: APP_CONFIG.COMPANY_NAME,
        };
      }
      return msg;
    }

    case "current-user":
      return {
        ...msg,
        sender: sharerName,
        senderRole: sharerRole,
        sharedFrom: undefined,
        masked: false,
      };

    default:
      return msg;
  }
}

// ── Attribution ──────────────────────────────────────────────────────

/**
 * Resolve the sender display name for the shared message according
 * to the policy's attribution strategy.
 */
export function resolveAttribution(
  strategy: AttributionStrategy,
  originalSender: string | undefined,
  sharerName: string,
): string {
  switch (strategy) {
    case "original-sender":
      return originalSender || "Unknown";
    case "sharer":
      return sharerName;
    case "company":
      return APP_CONFIG.COMPANY_NAME;
    case "anonymous":
      return "Shared message";
    default:
      return originalSender || sharerName;
  }
}

// ── Full pipeline ────────────────────────────────────────────────────

/**
 * Transform an array of source messages into a single shared message
 * using the resolved policy.
 *
 * This is the replacement for the old `prepareSharedMessages` +
 * `concatenateSharedMessages` two-step.  Callers can still use those
 * legacy functions during the migration period; this is the new
 * canonical path.
 */
export function transformForShare(
  sourceMessages: Message[],
  config: ShareTransformConfig,
): Message {
  const policy = resolveSharePolicy(config.context);
  const timestamp = config.timestamp ?? new Date();
  const { editedContents, sharerName, sharerPersonaId, sharerRole } = config;

  // 1. Apply content edits
  const withEdits = sourceMessages.map((msg) => {
    const edited = editedContents?.[msg.id];
    if (edited !== undefined && edited !== msg.content) {
      return { ...msg, content: edited };
    }
    return msg;
  });

  // 2. Apply masking per policy
  const masked = withEdits.map((msg) =>
    applyPolicyMasking(msg, policy.masking, sharerName, sharerRole),
  );

  // 3. Concatenate content
  const concatenatedContent = masked
    .map((m) => m.content)
    .filter(Boolean)
    .join("\n");

  // 4. Detect edits
  const wasEdited = !!(
    editedContents &&
    sourceMessages.some(
      (src) =>
        editedContents[src.id] !== undefined &&
        editedContents[src.id] !== src.content,
    )
  );

  // 5. Resolve attribution
  const firstMsg = sourceMessages[0];
  const displaySender = resolveAttribution(
    policy.attribution,
    firstMsg?.sender,
    stripRoleSuffix(sharerName),
  );

  // 6. Build sharedFrom metadata
  const sharedFrom =
    policy.masking === "current-user"
      ? undefined
      : {
          channel: config.context.sourceKind,
          originalSender: firstMsg?.sender ? stripRoleSuffix(firstMsg.sender) : "Unknown",
          originalSenderPersonaId: firstMsg?.senderPersonaId,
          originalTimestamp: firstMsg?.timestamp || timestamp,
          enquiryId: config.context.sourceId,
        };

  // 7. Assemble final message
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: policy.resultMessageType,
    sender: displaySender,
    senderPersonaId:
      policy.attribution === "sharer" ? sharerPersonaId : firstMsg?.senderPersonaId,
    senderRole:
      policy.attribution === "sharer"
        ? sharerRole
        : (firstMsg?.senderRole as UserRole | undefined),
    content: concatenatedContent,
    timestamp,
    sharedFrom,
    edited: wasEdited,
    masked: policy.masking !== "none" && policy.masking !== "current-user",
    shareRenderMode: policy.renderMode,
  } as Message;
}

// ── Batch transform (multi-target fan-out) ───────────────────────────

/**
 * Transform source messages for multiple targets (e.g., multi-seller).
 * Returns one transformed message per target, each with its own policy.
 */
export function transformForMultiTarget(
  sourceMessages: Message[],
  baseConfig: Omit<ShareTransformConfig, "context">,
  targets: Array<{
    context: ShareContext;
    targetId: string;
  }>,
): Array<{ targetId: string; message: Message; policy: SharePolicy }> {
  return targets.map(({ context, targetId }) => {
    const policy = resolveSharePolicy(context);
    const message = transformForShare(sourceMessages, {
      ...baseConfig,
      context,
    });
    return { targetId, message, policy };
  });
}
