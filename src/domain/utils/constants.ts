/**
 * Constants for Application
 * 
 * Centralized constant definitions to avoid magic strings/numbers.
 */

export const APP_CONFIG = {
  APP_NAME: 'Enquiry Coordination System',
  COMPANY_NAME: 'Birla Pivot',
  DEFAULT_CHANNEL: 'internal',
  DEFAULT_ENQUIRY: 'ENQ-2401',
} as const;

export const CHANNEL_IDS = {
  INTERNAL: 'internal',
  BUYER: 'buyer',
  BUYER_DM: 'buyer-dm',
  SELLER_DM: 'seller-dm',
} as const;

export const CHANNEL_PREFIXES = {
  SELLER: 'seller-',
  SELLER_MULTI: 'seller-multi:',
  SELLER_DM: 'seller-dm-',
  ENQUIRY: 'ENQ-',
} as const;

export const PERSONA_IDS = {
  CX_DEFAULT: 'p_cx_1',
} as const;

export const MESSAGE_TYPES = {
  USER: 'user',
  SYSTEM: 'system',
  SHARED: 'shared',
  /** @deprecated Use SHARED instead */
  FORWARDED: 'forwarded',
} as const;

export const EVENT_TYPES = {
  MESSAGE_SENT: 'MESSAGE_SENT',
  MESSAGE_SHARED: 'MESSAGE_SHARED',
  /** @deprecated Use MESSAGE_SHARED instead */
  MESSAGE_FORWARDED: 'MESSAGE_FORWARDED',
  MESSAGE_EDITED: 'MESSAGE_EDITED',
  SELLER_CHANNEL_CREATED: 'SELLER_CHANNEL_CREATED',
  MESSAGES_FAN_OUT: 'MESSAGES_FAN_OUT',
  BUYER_DM_MESSAGE_SENT: 'BUYER_DM_MESSAGE_SENT',
  SELLER_DM_MESSAGE_SENT: 'SELLER_DM_MESSAGE_SENT',
  SELLER_DM_CHANNEL_CREATED: 'SELLER_DM_CHANNEL_CREATED',
  ENQUIRY_CREATED: 'ENQUIRY_CREATED',
  MEMBER_ADDED: 'MEMBER_ADDED',
  MEMBER_REMOVED: 'MEMBER_REMOVED',
  PRIMARY_CM_ASSIGNED: 'PRIMARY_CM_ASSIGNED',
} as const;

export const USER_ROLES = {
  BDM: 'BDM',
  CM: 'CM',
  CX: 'CX',
  BUYER: 'Buyer',
  SELLER: 'Seller',
} as const;

export const ENQUIRY_STATES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  QUOTED: 'quoted',
  NEGOTIATING: 'negotiating',
  WON: 'won',
  LOST: 'lost',
} as const;

export const UI_CONSTANTS = {
  SIDEBAR_WIDTH: 320,
  HEADER_HEIGHT: 56,
  MAX_MESSAGE_LENGTH: 5000,
  DEBOUNCE_DELAY: 300,
} as const;

export const VALIDATION_RULES = {
  MIN_ENQUIRY_NAME_LENGTH: 3,
  MAX_ENQUIRY_NAME_LENGTH: 100,
  MIN_MESSAGE_LENGTH: 1,
  MAX_ATTACHMENT_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

export const TOAST_MESSAGES = {
  MESSAGE_SENT: 'Message sent',
  MESSAGE_SHARED: (count: number) => `Shared ${count} message(s)`,
  /** @deprecated Use MESSAGE_SHARED instead */
  MESSAGE_FORWARDED: (count: number) => `Shared ${count} message(s)`,
  ENQUIRY_CREATED: (id: string) => `Created enquiry ${id}`,
  ENQUIRY_UPDATED: 'Enquiry updated',
  STATE_CHANGED: (state: string) => `State changed to: ${state}`,
  MEMBER_ADDED: (name: string) => `Added ${name}`,
  MEMBER_REMOVED: 'Member removed',
  ERROR_GENERIC: 'An error occurred',
  ERROR_PERMISSION: 'You do not have permission',
  ERROR_NOT_FOUND: 'Not found',
  ERROR_NETWORK: 'Network error',
} as const;