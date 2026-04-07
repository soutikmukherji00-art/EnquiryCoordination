/**
 * Type Guards and Validators
 * 
 * Runtime type checking and validation utilities.
 */

import { Message, UserRole } from '../message/message.types';
import { Enquiry } from '../enquiry/enquiry.types';
import { VALIDATION_RULES } from './constants';
import { ValidationError } from './error-handler';

/**
 * Type guard for Message
 */
export function isMessage(value: unknown): value is Message {
  if (typeof value !== 'object' || value === null) return false;
  
  const msg = value as any;
  return (
    typeof msg.id === 'string' &&
    typeof msg.type === 'string' &&
    typeof msg.sender === 'string' &&
    typeof msg.senderRole === 'string' &&
    typeof msg.content === 'string' &&
    msg.timestamp instanceof Date
  );
}

/**
 * Type guard for UserRole
 */
export function isUserRole(value: unknown): value is UserRole {
  return ['BDM', 'CM', 'CX', 'Buyer', 'Seller'].includes(value as string);
}

/**
 * Type guard for Enquiry
 */
export function isEnquiry(value: unknown): value is Enquiry {
  if (typeof value !== 'object' || value === null) return false;
  
  const enq = value as any;
  return (
    typeof enq.id === 'string' &&
    typeof enq.state === 'string' &&
    enq.createdAt instanceof Date
  );
}

/**
 * Validate message content
 */
export function validateMessageContent(content: string): void {
  if (!content || content.trim().length < VALIDATION_RULES.MIN_MESSAGE_LENGTH) {
    throw new ValidationError('Message content cannot be empty');
  }
  
  if (content.length > VALIDATION_RULES.MAX_MESSAGE_LENGTH) {
    throw new ValidationError(
      `Message content cannot exceed ${VALIDATION_RULES.MAX_MESSAGE_LENGTH} characters`
    );
  }
}

/**
 * Validate enquiry name
 */
export function validateEnquiryName(name: string): void {
  if (!name || name.trim().length < VALIDATION_RULES.MIN_ENQUIRY_NAME_LENGTH) {
    throw new ValidationError(
      `Enquiry name must be at least ${VALIDATION_RULES.MIN_ENQUIRY_NAME_LENGTH} characters`
    );
  }
  
  if (name.length > VALIDATION_RULES.MAX_ENQUIRY_NAME_LENGTH) {
    throw new ValidationError(
      `Enquiry name cannot exceed ${VALIDATION_RULES.MAX_ENQUIRY_NAME_LENGTH} characters`
    );
  }
}

/**
 * Validate channel ID format
 */
export function isValidChannelId(channelId: string): boolean {
  if (!channelId) return false;
  
  // Static channels
  if (['internal', 'buyer', 'buyer-dm', 'seller-dm'].includes(channelId)) {
    return true;
  }
  
  // Seller channels
  if (channelId.startsWith('seller-')) {
    return true;
  }
  
  // Enquiry IDs
  if (channelId.startsWith('ENQ-')) {
    return true;
  }
  
  return false;
}

/**
 * Validate enquiry ID format
 */
export function isValidEnquiryId(enquiryId: string): boolean {
  return /^ENQ-\d+$/.test(enquiryId);
}

/**
 * Validate seller ID format
 */
export function isValidSellerId(sellerId: string): boolean {
  return /^s_\d+$/.test(sellerId);
}

/**
 * Validate attachment size
 */
export function validateAttachmentSize(size: number): void {
  if (size > VALIDATION_RULES.MAX_ATTACHMENT_SIZE) {
    throw new ValidationError(
      `Attachment size cannot exceed ${VALIDATION_RULES.MAX_ATTACHMENT_SIZE / 1024 / 1024}MB`
    );
  }
}

/**
 * Safe array access
 */
export function safeArrayAccess<T>(array: T[], index: number): T | undefined {
  if (index < 0 || index >= array.length) return undefined;
  return array[index];
}

/**
 * Safe object property access
 */
export function safeGet<T, K extends keyof T>(obj: T | null | undefined, key: K): T[K] | undefined {
  if (!obj) return undefined;
  return obj[key];
}

/**
 * Assert non-null
 */
export function assertNonNull<T>(value: T | null | undefined, message: string): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

/**
 * Check if string is not empty
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if array is not empty
 */
export function isNonEmptyArray<T>(value: unknown): value is T[] {
  return Array.isArray(value) && value.length > 0;
}
