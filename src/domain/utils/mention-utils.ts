/**
 * Mention Utilities
 * 
 * Utilities for parsing, validating, and working with @mentions
 */

import { Message } from '@/domain/message/message.types';

/**
 * Mention token structure
 */
export interface MentionToken {
  type: 'mention';
  personaId: string;
  display: string;
}

/**
 * Parse content to extract mention tokens
 * Matches @[DisplayName](personaId) format
 */
export function parseMentions(content: string): MentionToken[] {
  const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
  const mentions: MentionToken[] = [];
  
  let match;
  while ((match = mentionRegex.exec(content)) !== null) {
    mentions.push({
      type: 'mention',
      personaId: match[2],
      display: match[1],
    });
  }
  
  return mentions;
}

/**
 * Extract persona IDs from mention tokens
 */
export function extractMentionedPersonas(content: string): string[] {
  const tokens = parseMentions(content);
  return tokens.map(t => t.personaId);
}

/**
 * Format mention token for display
 */
export function formatMention(displayName: string, personaId: string): string {
  return `@[${displayName}](${personaId})`;
}

/**
 * Replace mention tokens with display text
 */
export function renderMentions(content: string): string {
  return content.replace(/@\[([^\]]+)\]\(([^)]+)\)/g, '@$1');
}

/**
 * Check if a message has unread mentions for a persona
 */
export function hasUnreadMention(message: Message, personaId: string): boolean {
  if (!message.mentions || message.mentions.length === 0) {
    return false;
  }
  
  // Check if persona is mentioned
  if (!message.mentions.includes(personaId)) {
    return false;
  }
  
  // Check if already read
  if (message.mentionReadBy?.includes(personaId)) {
    return false;
  }
  
  return true;
}

/**
 * Check if messages have any unread mentions for a persona
 */
export function hasUnreadMentions(messages: Message[], personaId: string): boolean {
  return messages.some(msg => hasUnreadMention(msg, personaId));
}

/**
 * Get count of unread mentions for a persona
 */
export function getUnreadMentionCount(messages: Message[], personaId: string): number {
  return messages.filter(msg => hasUnreadMention(msg, personaId)).length;
}

/**
 * Find first message with unread mention
 */
export function findFirstUnreadMention(messages: Message[], personaId: string): Message | null {
  return messages.find(msg => hasUnreadMention(msg, personaId)) || null;
}

/**
 * Validate mention token format
 */
export function isValidMentionToken(token: string): boolean {
  const mentionRegex = /^@\[([^\]]+)\]\(([^)]+)\)$/;
  return mentionRegex.test(token);
}
