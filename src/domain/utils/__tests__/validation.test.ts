/**
 * Tests: Validation Utilities
 * 
 * Tests for validation functions across their canonical source files:
 * - validation.ts: persona, user, member ID validation + content/email/phone
 * - type-guards.ts: channel, enquiry, seller ID validation
 * - policy.registry.ts: role classification (isInternalRole, isExternalRole)
 */

import { describe, it, expect } from 'vitest';
import {
  isValidPersonaId,
  isValidUserId,
  isValidMemberId,
  hasContent,
  isValidEmail,
  isValidPhone,
} from '../validation';
import {
  isValidEnquiryId,
  isValidSellerId,
  isValidChannelId,
} from '../type-guards';
import {
  isInternalRole,
  isExternalRole,
} from '../../policy/policy.registry';

describe('Validation Utilities', () => {
  describe('isValidEnquiryId', () => {
    it('validates correct enquiry IDs', () => {
      expect(isValidEnquiryId('ENQ-2401')).toBe(true);
      expect(isValidEnquiryId('ENQ-123456')).toBe(true);
    });

    it('rejects invalid enquiry IDs', () => {
      expect(isValidEnquiryId('ENQ-')).toBe(false);
      expect(isValidEnquiryId('ENQ-abc')).toBe(false);
      expect(isValidEnquiryId('INVALID')).toBe(false);
      expect(isValidEnquiryId('enq-2401')).toBe(false);
    });
  });

  describe('isInternalRole', () => {
    it('identifies internal roles correctly', () => {
      expect(isInternalRole('BDM')).toBe(true);
      expect(isInternalRole('CM')).toBe(true);
      expect(isInternalRole('CX')).toBe(true);
    });

    it('identifies external roles as not internal', () => {
      expect(isInternalRole('Buyer')).toBe(false);
      expect(isInternalRole('Seller')).toBe(false);
    });
  });

  describe('isExternalRole', () => {
    it('identifies external roles correctly', () => {
      expect(isExternalRole('Buyer')).toBe(true);
      expect(isExternalRole('Seller')).toBe(true);
    });

    it('identifies internal roles as not external', () => {
      expect(isExternalRole('BDM')).toBe(false);
      expect(isExternalRole('CM')).toBe(false);
      expect(isExternalRole('CX')).toBe(false);
    });
  });

  describe('isValidSellerId', () => {
    it('validates correct seller IDs', () => {
      expect(isValidSellerId('s_1')).toBe(true);
      expect(isValidSellerId('s_123')).toBe(true);
    });

    it('rejects invalid seller IDs', () => {
      expect(isValidSellerId('s_')).toBe(false);
      expect(isValidSellerId('s_abc')).toBe(false);
      expect(isValidSellerId('seller_1')).toBe(false);
    });
  });

  describe('isValidPersonaId', () => {
    it('validates correct persona IDs', () => {
      expect(isValidPersonaId('p_bdm_1')).toBe(true);
      expect(isValidPersonaId('p_cm_2')).toBe(true);
      expect(isValidPersonaId('p_buyer_1')).toBe(true);
    });

    it('rejects invalid persona IDs', () => {
      expect(isValidPersonaId('p_')).toBe(false);
      expect(isValidPersonaId('p_BDM_1')).toBe(false);
      expect(isValidPersonaId('persona_1')).toBe(false);
    });
  });

  describe('isValidUserId', () => {
    it('validates correct user IDs', () => {
      expect(isValidUserId('u_1')).toBe(true);
      expect(isValidUserId('u_12345')).toBe(true);
    });

    it('rejects invalid user IDs', () => {
      expect(isValidUserId('u_')).toBe(false);
      expect(isValidUserId('u_abc')).toBe(false);
      expect(isValidUserId('user_1')).toBe(false);
    });
  });

  describe('isValidMemberId', () => {
    it('validates correct member IDs', () => {
      expect(isValidMemberId('m_enq_001_p_cm_1')).toBe(true);
      expect(isValidMemberId('m_123')).toBe(true);
    });

    it('rejects invalid member IDs', () => {
      expect(isValidMemberId('m_')).toBe(false);
      expect(isValidMemberId('member_1')).toBe(false);
    });
  });

  describe('isValidChannelId', () => {
    it('validates correct channel IDs', () => {
      expect(isValidChannelId('buyer')).toBe(true);
      expect(isValidChannelId('internal')).toBe(true);
      expect(isValidChannelId('seller-s_1')).toBe(true);
    });

    it('rejects invalid channel IDs', () => {
      expect(isValidChannelId('')).toBe(false);
    });
  });

  describe('hasContent', () => {
    it('returns true for non-empty strings', () => {
      expect(hasContent('Hello')).toBe(true);
      expect(hasContent('  Hello  ')).toBe(true);
    });

    it('returns false for empty or whitespace strings', () => {
      expect(hasContent('')).toBe(false);
      expect(hasContent('   ')).toBe(false);
      expect(hasContent('\n\t')).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
    });

    it('rejects invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test @example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates correct phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1 (234) 567-8900')).toBe(true);
      expect(isValidPhone('+44 20 1234 5678')).toBe(true);
    });

    it('rejects invalid phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abc')).toBe(false);
    });
  });
});
