import type { Message } from "./message.types";
import { APP_CONFIG } from "@/domain/utils/constants";

/**
 * Role label for the badge next to the sender name.
 * Company-rebrand masked messages appear as "Birla Pivot" but represent the automation/masking layer — show BOT.
 */
export function getMessageRoleBadgeLabel(
  message: Message,
  personaRoleFallback?: string,
): string | undefined {
  const company = APP_CONFIG.COMPANY_NAME;
  if (
    message.masked &&
    (message.sender === company || message.displaySender === company)
  ) {
    return "BOT";
  }
  return message.senderRole ?? personaRoleFallback ?? undefined;
}
