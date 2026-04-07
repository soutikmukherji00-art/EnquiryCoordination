/**
 * Tests: Mention Utilities
 * 
 * Tests for mention detection and tracking utilities
 */

import { describe, it, expect } from 'vitest';
import {
  detectMentions,
  hasUnreadMentions,
  markMentionAsRead,
  getUnreadMentionCount,
} from '@/domain/utils/mention-utils';
import { Message } from '@/domain/message/message.types';

describe('Mention Utilities', () => {
  describe('detectMentions', () => {
    it('detects single mention', () => {
      const text = 'Hello @p_cm_1, please review this';
      const mentions = detectMentions(text);
      
      expect(mentions).toEqual(['p_cm_1']);
    });

    it('detects multiple mentions', () => {
      const text = 'Hey @p_cm_1 and @p_bdm_2, we need your input';
      const mentions = detectMentions(text);
      
      expect(mentions).toEqual(['p_cm_1', 'p_bdm_2']);
    });

    it('detects mentions with underscores and numbers', () => {
      const text = '@p_cm_warehouse_1 @p_bdm_north_region_2 check this';
      const mentions = detectMentions(text);
      
      expect(mentions).toEqual(['p_cm_warehouse_1', 'p_bdm_north_region_2']);
    });

    it('returns empty array when no mentions', () => {
      const text = 'Just a regular message';
      const mentions = detectMentions(text);
      
      expect(mentions).toEqual([]);
    });

    it('removes duplicate mentions', () => {
      const text = '@p_cm_1 and @p_cm_1 again';
      const mentions = detectMentions(text);
      
      expect(mentions).toEqual(['p_cm_1']);
    });

    it('handles empty string', () => {
      const mentions = detectMentions('');
      
      expect(mentions).toEqual([]);
    });

    it('handles mention at start of text', () => {
      const text = '@p_cm_1 please check this';
      const mentions = detectMentions(text);
      
      expect(mentions).toEqual(['p_cm_1']);
    });

    it('handles mention at end of text', () => {
      const text = 'Please review @p_cm_1';
      const mentions = detectMentions(text);
      
      expect(mentions).toEqual(['p_cm_1']);
    });
  });

  describe('hasUnreadMentions', () => {
    it('returns true when mention is unread', () => {
      const messages: Message[] = [
        {
          id: 'msg_001',
          type: 'user',
          content: 'Hello @p_cm_1',
          timestamp: new Date(),
          mentions: ['p_cm_1'],
          mentionReadBy: [],
        },
      ];
      
      const hasUnread = hasUnreadMentions(messages, 'p_cm_1');
      expect(hasUnread).toBe(true);
    });

    it('returns false when mention is read', () => {
      const messages: Message[] = [
        {
          id: 'msg_001',
          type: 'user',
          content: 'Hello @p_cm_1',
          timestamp: new Date(),
          mentions: ['p_cm_1'],
          mentionReadBy: ['p_cm_1'],
        },
      ];
      
      const hasUnread = hasUnreadMentions(messages, 'p_cm_1');
      expect(hasUnread).toBe(false);
    });

    it('returns false when no mentions', () => {
      const messages: Message[] = [
        {
          id: 'msg_001',
          type: 'user',
          content: 'Hello everyone',
          timestamp: new Date(),
        },
      ];
      
      const hasUnread = hasUnreadMentions(messages, 'p_cm_1');
      expect(hasUnread).toBe(false);
    });

    it('returns true when some mentions are unread', () => {
      const messages: Message[] = [
        {
          id: 'msg_001',
          type: 'user',
          content: 'Hello @p_cm_1',
          timestamp: new Date(),
          mentions: ['p_cm_1'],
          mentionReadBy: ['p_cm_1'],
        },
        {
          id: 'msg_002',
          type: 'user',
          content: 'Hey @p_cm_1 again',
          timestamp: new Date(),
          mentions: ['p_cm_1'],
          mentionReadBy: [],
        },
      ];
      
      const hasUnread = hasUnreadMentions(messages, 'p_cm_1');
      expect(hasUnread).toBe(true);
    });

    it('handles empty messages array', () => {
      const hasUnread = hasUnreadMentions([], 'p_cm_1');
      expect(hasUnread).toBe(false);
    });
  });

  describe('markMentionAsRead', () => {
    it('marks single mention as read', () => {
      const message: Message = {
        id: 'msg_001',
        type: 'user',
        content: 'Hello @p_cm_1',
        timestamp: new Date(),
        mentions: ['p_cm_1'],
        mentionReadBy: [],
      };
      
      const updated = markMentionAsRead(message, 'p_cm_1');
      
      expect(updated.mentionReadBy).toContain('p_cm_1');
    });

    it('does not duplicate if already read', () => {
      const message: Message = {
        id: 'msg_001',
        type: 'user',
        content: 'Hello @p_cm_1',
        timestamp: new Date(),
        mentions: ['p_cm_1'],
        mentionReadBy: ['p_cm_1'],
      };
      
      const updated = markMentionAsRead(message, 'p_cm_1');
      
      expect(updated.mentionReadBy).toEqual(['p_cm_1']);
    });

    it('preserves other readers when marking as read', () => {
      const message: Message = {
        id: 'msg_001',
        type: 'user',
        content: 'Hello @p_cm_1 and @p_cm_2',
        timestamp: new Date(),
        mentions: ['p_cm_1', 'p_cm_2'],
        mentionReadBy: ['p_cm_1'],
      };
      
      const updated = markMentionAsRead(message, 'p_cm_2');
      
      expect(updated.mentionReadBy).toContain('p_cm_1');
      expect(updated.mentionReadBy).toContain('p_cm_2');
    });

    it('initializes mentionReadBy if undefined', () => {
      const message: Message = {
        id: 'msg_001',
        type: 'user',
        content: 'Hello @p_cm_1',
        timestamp: new Date(),
        mentions: ['p_cm_1'],
      };
      
      const updated = markMentionAsRead(message, 'p_cm_1');
      
      expect(updated.mentionReadBy).toEqual(['p_cm_1']);
    });
  });

  describe('getUnreadMentionCount', () => {
    it('counts unread mentions correctly', () => {
      const messages: Message[] = [
        {
          id: 'msg_001',
          type: 'user',
          content: 'Hello @p_cm_1',
          timestamp: new Date(),
          mentions: ['p_cm_1'],
          mentionReadBy: [],
        },
        {
          id: 'msg_002',
          type: 'user',
          content: 'Hey @p_cm_1',
          timestamp: new Date(),
          mentions: ['p_cm_1'],
          mentionReadBy: [],
        },
        {
          id: 'msg_003',
          type: 'user',
          content: 'Ping @p_cm_1',
          timestamp: new Date(),
          mentions: ['p_cm_1'],
          mentionReadBy: ['p_cm_1'],
        },
      ];
      
      const count = getUnreadMentionCount(messages, 'p_cm_1');
      expect(count).toBe(2);
    });

    it('returns 0 when all mentions are read', () => {
      const messages: Message[] = [
        {
          id: 'msg_001',
          type: 'user',
          content: 'Hello @p_cm_1',
          timestamp: new Date(),
          mentions: ['p_cm_1'],
          mentionReadBy: ['p_cm_1'],
        },
      ];
      
      const count = getUnreadMentionCount(messages, 'p_cm_1');
      expect(count).toBe(0);
    });

    it('returns 0 for empty messages', () => {
      const count = getUnreadMentionCount([], 'p_cm_1');
      expect(count).toBe(0);
    });

    it('ignores mentions for other personas', () => {
      const messages: Message[] = [
        {
          id: 'msg_001',
          type: 'user',
          content: 'Hello @p_cm_2',
          timestamp: new Date(),
          mentions: ['p_cm_2'],
          mentionReadBy: [],
        },
      ];
      
      const count = getUnreadMentionCount(messages, 'p_cm_1');
      expect(count).toBe(0);
    });
  });
});
