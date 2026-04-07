/**
 * Tests: Policy Enforcement
 * 
 * Verifies role-based access control policies are correctly enforced.
 */

import { describe, it, expect } from 'vitest';
import {
  isComponentVisible,
  isActionAllowed,
  canShareMessages,
  canTagMembers,
  canEditMessages,
  getMessageDisplayStrategy,
  resolveMessageDisplaySender,
  canViewAudit,
  canRoleConvertToOrder,
  canManageMembers,
  canCreateSellerChannels,
  canChangeState,
  getVisibleComponents,
  getAllowedActions,
} from '@/domain/policy/policy.enforcement';
import { Role } from '@/domain/enquiry/enquiry.types';

describe('Policy Enforcement', () => {
  describe('Component Visibility', () => {
    it('internal roles can see channel sidebar', () => {
      expect(isComponentVisible('BDM', 'ChannelSidebar')).toBe(true);
      expect(isComponentVisible('CM', 'ChannelSidebar')).toBe(true);
      expect(isComponentVisible('CX', 'ChannelSidebar')).toBe(true);
    });

    it('external roles cannot see channel sidebar', () => {
      expect(isComponentVisible('Buyer', 'ChannelSidebar')).toBe(false);
      expect(isComponentVisible('Seller', 'ChannelSidebar')).toBe(false);
    });

    it('CM can see seller panel', () => {
      expect(isComponentVisible('CM', 'SellerPanel')).toBe(true);
    });

    it('non-CM roles cannot see seller panel', () => {
      expect(isComponentVisible('BDM', 'SellerPanel')).toBe(false);
      expect(isComponentVisible('CX', 'SellerPanel')).toBe(false);
      expect(isComponentVisible('Buyer', 'SellerPanel')).toBe(false);
      expect(isComponentVisible('Seller', 'SellerPanel')).toBe(false);
    });
  });

  describe('Action Permissions', () => {
    it('BDM and CM can change state', () => {
      expect(canChangeState('BDM')).toBe(true);
      expect(canChangeState('CM')).toBe(true);
    });

    it('CX and external roles cannot change state', () => {
      expect(canChangeState('CX')).toBe(false);
      expect(canChangeState('Buyer')).toBe(false);
      expect(canChangeState('Seller')).toBe(false);
    });

    it('CM can create seller channels', () => {
      expect(canCreateSellerChannels('CM')).toBe(true);
    });

    it('non-CM roles cannot create seller channels', () => {
      expect(canCreateSellerChannels('BDM')).toBe(false);
      expect(canCreateSellerChannels('CX')).toBe(false);
      expect(canCreateSellerChannels('Buyer')).toBe(false);
      expect(canCreateSellerChannels('Seller')).toBe(false);
    });

    it('CX can convert to order', () => {
      expect(canRoleConvertToOrder('CX')).toBe(true);
    });

    it('non-CX roles cannot convert to order', () => {
      expect(canRoleConvertToOrder('BDM')).toBe(false);
      expect(canRoleConvertToOrder('CM')).toBe(false);
      expect(canRoleConvertToOrder('Buyer')).toBe(false);
      expect(canRoleConvertToOrder('Seller')).toBe(false);
    });

    it('internal roles can manage members', () => {
      expect(canManageMembers('BDM')).toBe(true);
      expect(canManageMembers('CM')).toBe(true);
      expect(canManageMembers('CX')).toBe(true);
    });

    it('external roles cannot manage members', () => {
      expect(canManageMembers('Buyer')).toBe(false);
      expect(canManageMembers('Seller')).toBe(false);
    });

    it('internal roles can view audit trail', () => {
      expect(canViewAudit('BDM')).toBe(true);
      expect(canViewAudit('CM')).toBe(true);
      expect(canViewAudit('CX')).toBe(true);
    });

    it('external roles cannot view audit trail', () => {
      expect(canViewAudit('Buyer')).toBe(false);
      expect(canViewAudit('Seller')).toBe(false);
    });
  });

  describe('Message Rules', () => {
    it('internal roles can share messages', () => {
      expect(canShareMessages('BDM')).toBe(true);
      expect(canShareMessages('CM')).toBe(true);
      expect(canShareMessages('CX')).toBe(true);
    });

    it('external roles cannot share messages', () => {
      expect(canShareMessages('Buyer')).toBe(false);
      expect(canShareMessages('Seller')).toBe(false);
    });

    it('internal roles can tag members', () => {
      expect(canTagMembers('BDM')).toBe(true);
      expect(canTagMembers('CM')).toBe(true);
      expect(canTagMembers('CX')).toBe(true);
    });

    it('external roles cannot tag members', () => {
      expect(canTagMembers('Buyer')).toBe(false);
      expect(canTagMembers('Seller')).toBe(false);
    });

    it('internal roles can edit messages', () => {
      expect(canEditMessages('BDM')).toBe(true);
      expect(canEditMessages('CM')).toBe(true);
      expect(canEditMessages('CX')).toBe(true);
    });
  });

  describe('Message Display Strategy', () => {
    it('internal roles see persona names', () => {
      expect(getMessageDisplayStrategy('BDM')).toBe('persona');
      expect(getMessageDisplayStrategy('CM')).toBe('persona');
      expect(getMessageDisplayStrategy('CX')).toBe('persona');
    });

    it('buyers see company name for internal, persona for external', () => {
      expect(getMessageDisplayStrategy('Buyer')).toBe('company');
    });

    it('sellers see masked identities', () => {
      expect(getMessageDisplayStrategy('Seller')).toBe('masked');
    });
  });

  describe('resolveMessageDisplaySender', () => {
    const mockPersona = {
      id: 'p_bdm_1',
      userId: 'u_101',
      displayName: 'John Doe',
      role: 'BDM' as Role,
      avatarUrl: '/avatars/bdm1.jpg',
    };

    it('always shows "You" for current user messages', () => {
      const result = resolveMessageDisplaySender('BDM', mockPersona, 'BDM', true);
      expect(result).toBe('You');
    });

    it('shows persona name for internal roles viewing other internal messages', () => {
      const result = resolveMessageDisplaySender('CM', mockPersona, 'BDM', false);
      expect(result).toBe('John Doe');
    });

    it('shows company name for buyer viewing internal messages', () => {
      const result = resolveMessageDisplaySender('Buyer', mockPersona, 'BDM', false);
      expect(result).toBe('Birla Pivot');
    });

    it('shows masked label for seller viewing messages', () => {
      const result = resolveMessageDisplaySender('Seller', mockPersona, 'BDM', false);
      expect(result).toBe('Business Development');
    });

    it('handles missing persona gracefully', () => {
      const result = resolveMessageDisplaySender('BDM', undefined, undefined, false);
      expect(result).toBe('Unknown');
    });
  });

  describe('Batch Operations', () => {
    it('gets visibility map for multiple components', () => {
      const components = ['ChannelSidebar', 'SellerPanel', 'AuditPanel'] as const;
      const visibilityMap = getVisibleComponents('CM');
      
      expect(visibilityMap).toContain('ChannelSidebar');
      expect(visibilityMap).toContain('SellerPanel');
      expect(visibilityMap).toContain('AuditPanel');
    });

    it('gets allowed actions for role', () => {
      const cmActions = getAllowedActions('CM');
      
      expect(cmActions).toContain('CREATE_SELLER_CHANNEL');
      expect(cmActions).toContain('CHANGE_STATE');
      expect(cmActions).toContain('ADD_MEMBER');
    });
  });
});