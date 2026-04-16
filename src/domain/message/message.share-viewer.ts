import type { Message } from "./message.types";

/**
 * Whether the viewing user should see this message as their own (e.g. purple bubble).
 * Shared messages are attributed to the person who shared them into the destination.
 */
export function isMessageActingAsCurrentUser(
  message: Message,
  currentPersonaId: string | undefined,
  currentRole: string | undefined,
): boolean {
  if (message.sharedByPersonaId) {
    return (
      currentPersonaId !== undefined &&
      message.sharedByPersonaId === currentPersonaId
    );
  }
  if (message.senderPersonaId) {
    return message.senderPersonaId === currentPersonaId;
  }
  if (message.senderRole && currentRole) {
    return message.senderRole === currentRole;
  }
  return false;
}

/**
 * Buyers and Sellers see cross-group/thread shared content that was not shared by them
 * as coming from the company automation surface (Birla Pivot + BOT badge).
 */
export function shouldMaskSharedMessageAsCompanyBotForExternalViewer(
  viewerRole: string | undefined,
  message: Message,
  isActingAsCurrentUser: boolean,
): boolean {
  if (viewerRole !== "Buyer" && viewerRole !== "Seller") return false;
  if (isActingAsCurrentUser) return false;
  if (message.type !== "shared" && !message.sharedFrom) return false;
  return true;
}
