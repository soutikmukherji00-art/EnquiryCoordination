/**
 * Test Helpers and Utilities
 * 
 * Shared test utilities for creating mock data and common test scenarios.
 */

import { Member, Enquiry, Role } from '@/domain/enquiry/enquiry.types';
import { Message, SellerChannel } from '@/domain/message/message.types';
import { Persona } from '@/domain/persona/persona.data';

/**
 * Creates a mock member for testing
 */
export const createMockMember = (overrides?: Partial<Member>): Member => ({
  id: `m_${Date.now()}`,
  userId: 'u_test',
  personaId: 'p_test',
  role: 'CM',
  joinedAt: new Date(),
  ...overrides,
});

/**
 * Creates a mock enquiry for testing
 */
export const createMockEnquiry = (overrides?: Partial<Enquiry>): Enquiry => ({
  id: `ENQ-${Date.now()}`,
  buyerName: 'Test Buyer Corp',
  state: 'Draft',
  createdBy: 'Test User',
  createdByRole: 'BDM',
  createdAt: new Date(),
  lastActivity: new Date(),
  region: 'North',
  tags: [],
  memberIds: [],
  ...overrides,
});

/**
 * Creates a mock message for testing
 */
export const createMockMessage = (overrides?: Partial<Message>): Message => ({
  id: `msg-${Date.now()}`,
  type: 'user',
  content: 'Test message content',
  timestamp: new Date(),
  ...overrides,
});

/**
 * Creates a mock seller channel for testing
 */
export const createMockSellerChannel = (overrides?: Partial<SellerChannel>): SellerChannel => ({
  id: `seller-s_${Date.now()}`,
  sellerId: 's_test',
  sellerName: 'Test Seller Inc.',
  enquiryId: 'ENQ-TEST',
  messages: [],
  unread: false,
  ...overrides,
});

/**
 * Creates a mock persona for testing
 */
export const createMockPersona = (overrides?: Partial<Persona>): Persona => ({
  id: `p_${Date.now()}`,
  userId: 'u_test',
  displayName: 'Test User',
  role: 'CM',
  avatarUrl: '/avatars/default.jpg',
  ...overrides,
});

/**
 * Creates multiple members with different roles
 */
export const createMembersWithRoles = (roles: Role[]): Member[] => {
  return roles.map((role, index) =>
    createMockMember({
      id: `m_${role}_${index}`,
      userId: `u_${role.toLowerCase()}_${index}`,
      personaId: `p_${role.toLowerCase()}_${index}`,
      role,
    })
  );
};

/**
 * Creates a set of messages with timestamps
 */
export const createMessageSequence = (count: number, baseTimestamp: Date = new Date()): Message[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockMessage({
      id: `msg-${i}`,
      content: `Message ${i + 1}`,
      timestamp: new Date(baseTimestamp.getTime() + i * 60000), // 1 minute apart
    })
  );
};