/**
 * Tests: Message Masking
 * 
 * Verifies message masking business logic is correctly implemented.
 */

import { describe, it, expect } from 'vitest';
import {
  shouldMaskSeller,
  maskSellerMessage,
  shouldMaskInternal,
  maskInternalMessage,
  applyMasking,
} from '@/domain/message/message.masking';
import { Message } from '@/domain/message/message.types';

describe('Message Masking', () => {
  describe('shouldMaskSeller', () => {
    it('returns true when forwarding from seller channel to internal', () => {
      expect(shouldMaskSeller('seller-s_1', 'internal')).toBe(true);
      expect(shouldMaskSeller('seller-s_2', 'internal')).toBe(true);
    });

    it('returns false for other channel combinations', () => {
      expect(shouldMaskSeller('buyer', 'internal')).toBe(false);
      expect(shouldMaskSeller('internal', 'buyer')).toBe(false);
      expect(shouldMaskSeller('seller-s_1', 'buyer')).toBe(false);
    });
  });

  describe('maskSellerMessage', () => {
    it('masks seller identity in message', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'Acme Supplies Inc.',
        senderRole: 'Seller',
        content: 'We can provide this at $500',
        timestamp: new Date(),
      };

      const masked = maskSellerMessage(message);

      expect(masked.masked).toBe(true);
      expect(masked.displaySender).toBe('Seller response');
      expect(masked.sender).toBeUndefined();
    });
  });

  describe('shouldMaskInternal', () => {
    it('returns true when forwarding from internal to buyer or seller', () => {
      expect(shouldMaskInternal('internal', 'buyer')).toBe(true);
      expect(shouldMaskInternal('internal', 'seller')).toBe(true);
    });

    it('returns false for other combinations', () => {
      expect(shouldMaskInternal('buyer', 'internal')).toBe(false);
      expect(shouldMaskInternal('seller-s_1', 'internal')).toBe(false);
      expect(shouldMaskInternal('internal', 'internal')).toBe(false);
    });
  });

  describe('maskInternalMessage', () => {
    it('strips forwarding metadata and makes message appear as current user', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'forwarded',
        sender: 'Original Sender',
        senderRole: 'CM',
        content: 'Internal discussion',
        timestamp: new Date(),
        forwardedFrom: 'internal',
      };

      const masked = maskInternalMessage(message, 'Current User', 'BDM');

      expect(masked.sender).toBe('Current User');
      expect(masked.senderRole).toBe('BDM');
      expect(masked.type).toBe('user');
      expect(masked.forwardedFrom).toBeUndefined();
    });
  });

  describe('applyMasking', () => {
    it('applies seller masking when appropriate', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'Acme Supplies',
        senderRole: 'Seller',
        content: 'Quote details',
        timestamp: new Date(),
      };

      const result = applyMasking(message, 'seller-s_1', 'internal', 'CM User', 'CM');

      expect(result.masked).toBe(true);
      expect(result.displaySender).toBe('Seller response');
    });

    it('applies internal masking when appropriate', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'CM Name',
        senderRole: 'CM',
        content: 'Negotiated terms',
        timestamp: new Date(),
      };

      const result = applyMasking(message, 'internal', 'buyer', 'BDM User', 'BDM');

      expect(result.sender).toBe('BDM User');
      expect(result.senderRole).toBe('BDM');
      expect(result.type).toBe('user');
    });

    it('returns message unchanged when no masking needed', () => {
      const message: Message = {
        id: 'msg-1',
        type: 'user',
        sender: 'Buyer Name',
        senderRole: 'Buyer',
        content: 'RFQ details',
        timestamp: new Date(),
      };

      const result = applyMasking(message, 'buyer', 'internal', 'CM User', 'CM');

      expect(result).toEqual(message);
    });
  });
});
