/**
 * Tests: Seller Fan-Out
 * 
 * Verifies seller fan-out business logic for distributing messages to multiple sellers.
 */

import { describe, it, expect } from 'vitest';
import {
  prepareFanOut,
  createSellerChannel,
  sellerChannelExists,
} from '@/domain/seller/seller.fanout';
import { Message, SellerChannel } from '@/domain/message/message.types';

describe('Seller Fan-Out', () => {
  const mockMessages: Message[] = [
    {
      id: 'msg-1',
      type: 'user',
      sender: 'CM User',
      senderRole: 'CM',
      content: 'RFQ for 1000 units',
      timestamp: new Date('2026-01-01T10:00:00'),
    },
    {
      id: 'msg-2',
      type: 'user',
      sender: 'CM User',
      senderRole: 'CM',
      content: 'Delivery needed by Feb 15',
      timestamp: new Date('2026-01-01T10:05:00'),
    },
  ];

  describe('prepareFanOut', () => {
    it('creates new channels for sellers without existing channels', () => {
      const result = prepareFanOut(
        ['s_1', 's_2'],
        mockMessages,
        'ENQ-2401',
        new Date('2026-01-01T10:30:00'),
        []
      );

      expect(result.newChannels).toHaveLength(2);
      expect(result.newChannels[0]).toMatchObject({
        id: 'seller-s_1',
        sellerId: 's_1',
        enquiryId: 'ENQ-2401',
      });
      expect(result.newChannels[1]).toMatchObject({
        id: 'seller-s_2',
        sellerId: 's_2',
        enquiryId: 'ENQ-2401',
      });
    });

    it('does not create duplicate channels for existing sellers', () => {
      const existingChannels: SellerChannel[] = [
        {
          id: 'seller-s_1',
          sellerId: 's_1',
          sellerName: 'Acme Supplies',
          enquiryId: 'ENQ-2401',
          messages: [],
          unread: false,
        },
      ];

      const result = prepareFanOut(
        ['s_1', 's_2'],
        mockMessages,
        'ENQ-2401',
        new Date('2026-01-01T10:30:00'),
        existingChannels
      );

      expect(result.newChannels).toHaveLength(1);
      expect(result.newChannels[0].sellerId).toBe('s_2');
    });

    it('prepares messages for each seller with unique IDs', () => {
      const result = prepareFanOut(
        ['s_1', 's_2'],
        mockMessages,
        'ENQ-2401',
        new Date('2026-01-01T10:30:00'),
        []
      );

      expect(result.messagesToAdd).toHaveLength(2);
      
      const seller1Messages = result.messagesToAdd.find(m => m.sellerId === 's_1')?.messages;
      const seller2Messages = result.messagesToAdd.find(m => m.sellerId === 's_2')?.messages;

      expect(seller1Messages).toHaveLength(2);
      expect(seller2Messages).toHaveLength(2);

      // Verify unique IDs
      expect(seller1Messages![0].id).not.toBe(seller2Messages![0].id);
      expect(seller1Messages![0].id).toContain('s_1');
      expect(seller2Messages![0].id).toContain('s_2');
    });

    it('preserves message content while creating unique instances', () => {
      const result = prepareFanOut(
        ['s_1'],
        mockMessages,
        'ENQ-2401',
        new Date('2026-01-01T10:30:00'),
        []
      );

      const sellerMessages = result.messagesToAdd[0].messages;
      
      expect(sellerMessages[0].content).toBe('RFQ for 1000 units');
      expect(sellerMessages[1].content).toBe('Delivery needed by Feb 15');
    });

    it('handles invalid seller IDs gracefully', () => {
      const result = prepareFanOut(
        ['s_1', 'invalid_seller', 's_2'],
        mockMessages,
        'ENQ-2401',
        new Date('2026-01-01T10:30:00'),
        []
      );

      // Should only create channels for valid sellers (s_1 and s_2)
      expect(result.newChannels).toHaveLength(2);
      expect(result.messagesToAdd).toHaveLength(2);
    });
  });

  describe('createSellerChannel', () => {
    it('creates a seller channel without initial message', () => {
      const channel = createSellerChannel('s_1', 'ENQ-2401');

      expect(channel).not.toBeNull();
      expect(channel).toMatchObject({
        id: 'seller-s_1',
        sellerId: 's_1',
        sellerName: 'Acme Supplies',
        enquiryId: 'ENQ-2401',
        messages: [],
        unread: false,
      });
    });

    it('creates a seller channel with initial message', () => {
      const initialMessage: Message = {
        id: 'msg-1',
        type: 'user',
        content: 'Hello seller',
        timestamp: new Date(),
      };

      const channel = createSellerChannel('s_1', 'ENQ-2401', initialMessage);

      expect(channel).not.toBeNull();
      expect(channel!.messages).toHaveLength(1);
      expect(channel!.messages[0]).toEqual(initialMessage);
    });

    it('returns null for invalid seller ID', () => {
      const channel = createSellerChannel('invalid_id', 'ENQ-2401');
      expect(channel).toBeNull();
    });
  });

  describe('sellerChannelExists', () => {
    it('returns true when channel exists for seller', () => {
      const existingChannels: SellerChannel[] = [
        {
          id: 'seller-s_1',
          sellerId: 's_1',
          sellerName: 'Acme Supplies',
          enquiryId: 'ENQ-2401',
          messages: [],
          unread: false,
        },
      ];

      expect(sellerChannelExists(existingChannels, 's_1')).toBe(true);
    });

    it('returns false when channel does not exist for seller', () => {
      const existingChannels: SellerChannel[] = [
        {
          id: 'seller-s_1',
          sellerId: 's_1',
          sellerName: 'Acme Supplies',
          enquiryId: 'ENQ-2401',
          messages: [],
          unread: false,
        },
      ];

      expect(sellerChannelExists(existingChannels, 's_2')).toBe(false);
    });

    it('returns false for empty channel list', () => {
      expect(sellerChannelExists([], 's_1')).toBe(false);
    });
  });
});
