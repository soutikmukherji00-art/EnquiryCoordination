/**
 * Domain: Message Display
 * 
 * Business logic for determining how messages should be displayed to different roles.
 * Centralizes message sender resolution and display logic.
 */

import { Message } from './message.types';
import { Role, Persona } from '../enquiry/enquiry.types';
import { resolveMessageDisplaySender } from '../policy/policy.enforcement';
import { stripRoleSuffix } from "@/domain/utils/name-utils";

export interface MessageDisplayInfo {
  senderDisplay: string;
  avatarText: string;
  isCurrentUser: boolean;
  isMasked: boolean;
}

/**
 * Resolves how a message should be displayed to a viewer
 * 
 * @param message - The message to display
 * @param viewerRole - Role of the person viewing the message
 * @param currentUserRole - Role of the current authenticated user
 * @param personas - Map of persona IDs to persona objects
 */
export const resolveMessageDisplay = (
  message: Message,
  viewerRole: Role,
  currentUserRole: Role,
  personas?: Map<string, Persona>
): MessageDisplayInfo => {
  // Handle legacy masked messages
  if (message.masked && message.displaySender) {
    return {
      senderDisplay: message.displaySender,
      avatarText: message.displaySender.substring(0, 2).toUpperCase(),
      isCurrentUser: false,
      isMasked: true,
    };
  }

  // Check if this is the current user's message
  const isCurrentUser = message.senderRole === currentUserRole;

  // Try to find the persona
  let senderPersona: Persona | undefined;
  if (message.senderId && personas) {
    senderPersona = personas.get(message.senderId);
  }

  // If no persona found, create a minimal one from message data
  if (!senderPersona && message.sender && message.senderRole) {
    senderPersona = {
      id: `temp_${message.sender}`,
      userId: `temp_${message.sender}`,
      displayName: stripRoleSuffix(message.sender),
      role: message.senderRole as Role,
      avatarUrl: undefined,
    };
  }

  // Use policy to resolve the display name
  const senderDisplay = resolveMessageDisplaySender(
    viewerRole,
    senderPersona,
    message.senderRole as Role | undefined,
    isCurrentUser
  );

  // Generate avatar text (first 2 chars of display name)
  const avatarText = senderDisplay.substring(0, 2).toUpperCase();

  return {
    senderDisplay,
    avatarText,
    isCurrentUser,
    isMasked: false,
  };
};

/**
 * Determines if a message should show sender information
 * (typically hide for consecutive messages from same sender)
 */
export const shouldShowSender = (
  message: Message,
  previousMessage: Message | undefined
): boolean => {
  if (!previousMessage) return true;

  // Show sender if different from previous
  if (message.sender !== previousMessage.sender) return true;
  if (message.senderRole !== previousMessage.senderRole) return true;

  // Show sender if more than 5 minutes apart
  const timeDiff = message.timestamp.getTime() - previousMessage.timestamp.getTime();
  if (timeDiff > 5 * 60 * 1000) return true;

  return false;
};

/**
 * Determines if a message should show timestamp
 */
export const shouldShowTimestamp = (
  message: Message,
  previousMessage: Message | undefined
): boolean => {
  if (!previousMessage) return true;

  // Show timestamp if more than 1 minute apart
  const timeDiff = message.timestamp.getTime() - previousMessage.timestamp.getTime();
  return timeDiff > 60 * 1000;
};

/**
 * Groups messages by sender for display optimization
 */
export const groupMessagesBySender = (messages: Message[]): Message[][] => {
  const groups: Message[][] = [];
  let currentGroup: Message[] = [];

  messages.forEach((message, index) => {
    const previousMessage = index > 0 ? messages[index - 1] : undefined;

    if (shouldShowSender(message, previousMessage)) {
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = [message];
    } else {
      currentGroup.push(message);
    }
  });

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
};
