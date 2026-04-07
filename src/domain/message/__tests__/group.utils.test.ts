/**
 * Tests: Group Utilities
 * 
 * Tests for group channel creation and management utilities
 */

import { describe, it, expect } from 'vitest';
import { generateGroupName, generateGroupId } from '@/domain/message/group.utils';
import { Persona } from '@/domain/enquiry/enquiry.types';

describe('Group Utilities', () => {
  describe('generateGroupName', () => {
    it('generates name with single member', () => {
      const members: Persona[] = [
        {
          id: 'p_cm_1',
          userId: 'u_201',
          displayName: 'Arjun Patel (CM - Electronics)',
          role: 'CM',
          isExternal: false,
        },
      ];
      
      const creatorPersona: Persona = {
        id: 'p_bdm_1',
        userId: 'u_101',
        displayName: 'Rajesh Kumar (BDM - North)',
        role: 'BDM',
        isExternal: false,
      };
      
      const name = generateGroupName(members, creatorPersona);
      expect(name).toBe('Rajesh Kumar + Arjun Patel');
    });

    it('generates name with two members', () => {
      const members: Persona[] = [
        {
          id: 'p_cm_1',
          userId: 'u_201',
          displayName: 'Arjun Patel (CM - Electronics)',
          role: 'CM',
          isExternal: false,
        },
        {
          id: 'p_cm_2',
          userId: 'u_202',
          displayName: 'Priya Sharma (CM - Logistics)',
          role: 'CM',
          isExternal: false,
        },
      ];
      
      const creatorPersona: Persona = {
        id: 'p_bdm_1',
        userId: 'u_101',
        displayName: 'Rajesh Kumar (BDM - North)',
        role: 'BDM',
        isExternal: false,
      };
      
      const name = generateGroupName(members, creatorPersona);
      expect(name).toBe('Rajesh Kumar + Arjun Patel + Priya Sharma');
    });

    it('generates name with three or more members', () => {
      const members: Persona[] = [
        {
          id: 'p_cm_1',
          userId: 'u_201',
          displayName: 'Arjun Patel (CM - Electronics)',
          role: 'CM',
          isExternal: false,
        },
        {
          id: 'p_cm_2',
          userId: 'u_202',
          displayName: 'Priya Sharma (CM - Logistics)',
          role: 'CM',
          isExternal: false,
        },
        {
          id: 'p_cm_3',
          userId: 'u_203',
          displayName: 'Vikram Singh (CM - Warehouse)',
          role: 'CM',
          isExternal: false,
        },
      ];
      
      const creatorPersona: Persona = {
        id: 'p_bdm_1',
        userId: 'u_101',
        displayName: 'Rajesh Kumar (BDM - North)',
        role: 'BDM',
        isExternal: false,
      };
      
      const name = generateGroupName(members, creatorPersona);
      expect(name).toBe('Rajesh Kumar + Arjun Patel + 2 others');
    });

    it('extracts first name from full display name', () => {
      const members: Persona[] = [
        {
          id: 'p_cm_1',
          userId: 'u_201',
          displayName: 'Arjun Kumar Patel (CM - Electronics)',
          role: 'CM',
          isExternal: false,
        },
      ];
      
      const creatorPersona: Persona = {
        id: 'p_bdm_1',
        userId: 'u_101',
        displayName: 'Rajesh Subramaniam Kumar (BDM - North)',
        role: 'BDM',
        isExternal: false,
      };
      
      const name = generateGroupName(members, creatorPersona);
      // Should extract first word before parentheses
      expect(name).toBe('Rajesh + Arjun');
    });

    it('handles empty members array', () => {
      const creatorPersona: Persona = {
        id: 'p_bdm_1',
        userId: 'u_101',
        displayName: 'Rajesh Kumar (BDM - North)',
        role: 'BDM',
        isExternal: false,
      };
      
      const name = generateGroupName([], creatorPersona);
      expect(name).toBe('Rajesh');
    });

    it('sorts members by display name for consistency', () => {
      const members: Persona[] = [
        {
          id: 'p_cm_2',
          userId: 'u_202',
          displayName: 'Zara Khan (CM - Logistics)',
          role: 'CM',
          isExternal: false,
        },
        {
          id: 'p_cm_1',
          userId: 'u_201',
          displayName: 'Arjun Patel (CM - Electronics)',
          role: 'CM',
          isExternal: false,
        },
      ];
      
      const creatorPersona: Persona = {
        id: 'p_bdm_1',
        userId: 'u_101',
        displayName: 'Rajesh Kumar (BDM - North)',
        role: 'BDM',
        isExternal: false,
      };
      
      const name = generateGroupName(members, creatorPersona);
      // Should be sorted alphabetically after creator
      expect(name).toBe('Rajesh + Arjun + Zara');
    });
  });

  describe('generateGroupId', () => {
    it('generates unique ID with timestamp and enquiry ID', () => {
      const id1 = generateGroupId('ENQ-001');
      const id2 = generateGroupId('ENQ-001');
      
      // IDs should be unique (different timestamps)
      expect(id1).not.toBe(id2);
      
      // IDs should contain enquiry ID
      expect(id1).toContain('ENQ-001');
      expect(id2).toContain('ENQ-001');
    });

    it('generates different IDs for different enquiries', () => {
      const id1 = generateGroupId('ENQ-001');
      const id2 = generateGroupId('ENQ-002');
      
      expect(id1).toContain('ENQ-001');
      expect(id2).toContain('ENQ-002');
      expect(id1).not.toBe(id2);
    });

    it('generates ID with correct format', () => {
      const id = generateGroupId('ENQ-001');
      
      // Format: group-{timestamp}-{enquiryId}
      expect(id).toMatch(/^group-\d+-ENQ-001$/);
    });

    it('handles different enquiry ID formats', () => {
      const id1 = generateGroupId('ENQ-2404');
      const id2 = generateGroupId('enquiry_001');
      const id3 = generateGroupId('ABC-XYZ-123');
      
      expect(id1).toContain('ENQ-2404');
      expect(id2).toContain('enquiry_001');
      expect(id3).toContain('ABC-XYZ-123');
    });
  });

  describe('Integration Tests', () => {
    it('creates complete group metadata', () => {
      const members: Persona[] = [
        {
          id: 'p_cm_1',
          userId: 'u_201',
          displayName: 'Arjun Patel (CM - Electronics)',
          role: 'CM',
          isExternal: false,
        },
        {
          id: 'p_cm_2',
          userId: 'u_202',
          displayName: 'Priya Sharma (CM - Logistics)',
          role: 'CM',
          isExternal: false,
        },
      ];
      
      const creatorPersona: Persona = {
        id: 'p_bdm_1',
        userId: 'u_101',
        displayName: 'Rajesh Kumar (BDM - North)',
        role: 'BDM',
        isExternal: false,
      };
      
      const enquiryId = 'ENQ-001';
      
      const groupId = generateGroupId(enquiryId);
      const groupName = generateGroupName(members, creatorPersona);
      
      // Verify group metadata
      expect(groupId).toMatch(/^group-\d+-ENQ-001$/);
      expect(groupName).toBe('Rajesh + Arjun + Priya');
      
      // Verify uniqueness
      const groupId2 = generateGroupId(enquiryId);
      expect(groupId).not.toBe(groupId2);
    });
  });
});
