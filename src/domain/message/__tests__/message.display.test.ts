/**
 * Tests: Message Display
 */

import { describe, it, expect } from 'vitest';
import {
  resolveMessageDisplay,
  shouldShowSender,
  shouldShowTimestamp,
  groupMessagesBySender,
} from '../message.display';
import { Message } from '../message.types';
import { Persona, Role } from '../../enquiry/enquiry.types';

describe('Message Display', () => {
  const mockPersonaMap = new Map<string, Persona>([
    [
      'p_bdm_1',
      {
        id: 'p_bdm_1',
        userId: 'u_101',
        displayName: 'John Smith',
        role: 'BDM',
        avatarUrl: '/avatars/john.jpg',
      },
    ],
    [
      'p_cm_1',
      {
        id: 'p_cm_1',
        userId: 'u_201',
        displayName: 'Jane Doe',
        role: 'CM',
        avatarUrl: '/avatars/jane.jpg',
      },
    ],
  ]);

  describe('resolveMessageDisplay', () => {
    it('shows "You" for current user messages', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'John Smith',
        senderRole: 'BDM',
        senderId: 'p_bdm_1',
        content: 'Test message',
        timestamp: new Date(),
      };

      const result = resolveMessageDisplay(message, 'BDM', 'BDM', mockPersonaMap);

      expect(result.senderDisplay).toBe('You');
      expect(result.isCurrentUser).toBe(true);
    });

    it('shows persona name for internal viewer seeing internal message', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'John Smith',
        senderRole: 'BDM',
        senderId: 'p_bdm_1',
        content: 'Test message',
        timestamp: new Date(),
      };

      const result = resolveMessageDisplay(message, 'CM', 'CM', mockPersonaMap);

      expect(result.senderDisplay).toBe('John Smith');
      expect(result.isCurrentUser).toBe(false);
    });

    it('handles masked messages correctly', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        content: 'Masked content',
        timestamp: new Date(),
        masked: true,
        displaySender: 'Seller response',
      };

      const result = resolveMessageDisplay(message, 'CM', 'CM', mockPersonaMap);

      expect(result.senderDisplay).toBe('Seller response');
      expect(result.isMasked).toBe(true);
    });

    it('creates temporary persona when not found in map', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'Unknown User',
        senderRole: 'BDM',
        content: 'Test message',
        timestamp: new Date(),
      };

      const result = resolveMessageDisplay(message, 'CM', 'CM', mockPersonaMap);

      expect(result.senderDisplay).toBeDefined();
    });

    it('generates correct avatar text', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'John Smith',
        senderRole: 'BDM',
        senderId: 'p_bdm_1',
        content: 'Test message',
        timestamp: new Date(),
      };

      const result = resolveMessageDisplay(message, 'CM', 'CM', mockPersonaMap);

      expect(result.avatarText).toBe('JO'); // First 2 chars of "John Smith"
    });
  });

  describe('shouldShowSender', () => {
    it('shows sender for first message', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'John',
        senderRole: 'BDM',
        content: 'Test',
        timestamp: new Date(),
      };

      expect(shouldShowSender(message, undefined)).toBe(true);
    });

    it('shows sender when different from previous', () => {
      const prev: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'John',
        senderRole: 'BDM',
        content: 'Test 1',
        timestamp: new Date('2026-02-01T10:00:00'),
      };

      const current: Message = {
        id: 'msg-2',
        type: 'user',
        sender: 'Jane',
        senderRole: 'CM',
        content: 'Test 2',
        timestamp: new Date('2026-02-01T10:01:00'),
      };

      expect(shouldShowSender(current, prev)).toBe(true);
    });

    it('hides sender for consecutive messages from same person within 5 minutes', () => {
      const prev: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'John',
        senderRole: 'BDM',
        content: 'Test 1',
        timestamp: new Date('2026-02-01T10:00:00'),
      };

      const current: Message = {
        id: 'msg-2',
        type: 'user',
        sender: 'John',
        senderRole: 'BDM',
        content: 'Test 2',
        timestamp: new Date('2026-02-01T10:02:00'),
      };

      expect(shouldShowSender(current, prev)).toBe(false);
    });

    it('shows sender for messages more than 5 minutes apart', () => {
      const prev: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'John',
        senderRole: 'BDM',
        content: 'Test 1',
        timestamp: new Date('2026-02-01T10:00:00'),
      };

      const current: Message = {
        id: 'msg-2',
        type: 'user',
        sender: 'John',
        senderRole: 'BDM',
        content: 'Test 2',
        timestamp: new Date('2026-02-01T10:06:00'),
      };

      expect(shouldShowSender(current, prev)).toBe(true);
    });
  });

  describe('shouldShowTimestamp', () => {
    it('shows timestamp for first message', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        content: 'Test',
        timestamp: new Date(),
      };

      expect(shouldShowTimestamp(message, undefined)).toBe(true);
    });

    it('shows timestamp for messages more than 1 minute apart', () => {
      const prev: Message = {
        id: 'msg-1',
        type: 'user',
        content: 'Test 1',
        timestamp: new Date('2026-02-01T10:00:00'),
      };

      const current: Message = {
        id: 'msg-2',
        type: 'user',
        content: 'Test 2',
        timestamp: new Date('2026-02-01T10:02:00'),
      };

      expect(shouldShowTimestamp(current, prev)).toBe(true);
    });

    it('hides timestamp for messages within 1 minute', () => {
      const prev: Message = {
        id: 'msg-1',
        type: 'user',
        content: 'Test 1',
        timestamp: new Date('2026-02-01T10:00:00'),
      };

      const current: Message = {
        id: 'msg-2',
        type: 'user',
        content: 'Test 2',
        timestamp: new Date('2026-02-01T10:00:30'),
      };

      expect(shouldShowTimestamp(current, prev)).toBe(false);
    });
  });

  describe('groupMessagesBySender', () => {
    it('groups consecutive messages from same sender', () => {
      const messages: Message[] = [
        {
          id: 'msg-1',
          type: 'user',
          sender: 'John',
          senderRole: 'BDM',
          content: 'Message 1',
          timestamp: new Date('2026-02-01T10:00:00'),
        },
        {
          id: 'msg-2',
          type: 'user',
          sender: 'John',
          senderRole: 'BDM',
          content: 'Message 2',
          timestamp: new Date('2026-02-01T10:00:30'),
        },
        {
          id: 'msg-3',
          type: 'user',
          sender: 'Jane',
          senderRole: 'CM',
          content: 'Message 3',
          timestamp: new Date('2026-02-01T10:01:00'),
        },
      ];

      const groups = groupMessagesBySender(messages);

      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveLength(2); // John's messages
      expect(groups[1]).toHaveLength(1); // Jane's message
    });

    it('creates new group when time gap exceeds 5 minutes', () => {
      const messages: Message[] = [
        {
          id: 'msg-1',
          type: 'user',
          sender: 'John',
          senderRole: 'BDM',
          content: 'Message 1',
          timestamp: new Date('2026-02-01T10:00:00'),
        },
        {
          id: 'msg-2',
          type: 'user',
          sender: 'John',
          senderRole: 'BDM',
          content: 'Message 2',
          timestamp: new Date('2026-02-01T10:10:00'),
        },
      ];

      const groups = groupMessagesBySender(messages);

      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveLength(1);
      expect(groups[1]).toHaveLength(1);
    });

    it('handles empty message array', () => {
      const groups = groupMessagesBySender([]);
      expect(groups).toHaveLength(0);
    });
  });
});
