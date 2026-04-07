/**
 * Refactoring Test Suite
 * 
 * Tests to ensure refactored code maintains functionality
 */

import { describe, it, expect } from 'vitest';
import { generateStructuredData, generateAISummary } from '@/domain/enquiry/enquiry.structured-data';
import { autoAssignTeamMembers, assignCMByCategory, assignCXToEnquiry } from '@/domain/enquiry/enquiry.member-assignment';
import { getCachedPersona, getPersonaInitials } from '@/domain/persona/persona.utils';

describe('Structured Data Utilities', () => {
  it('should generate empty data for null enquiry', () => {
    const data = generateStructuredData(null);
    expect(data.buyer.name).toBe('');
    expect(data.products).toHaveLength(0);
  });

  it('should generate steel data for steel enquiry', () => {
    const enquiry = {
      id: 'ENQ-2502',
      buyerName: 'Test Company',
      productCategory: 'Steel',
    } as any;
    
    const data = generateStructuredData(enquiry);
    expect(data.products).toHaveLength(2);
    expect(data.products[0].name).toContain('TMT Steel');
    expect(data.commercial.deliveryTerms).toContain('Jamshedpur');
  });

  it('should generate AI summary for steel enquiry', () => {
    const enquiry = {
      id: 'ENQ-2502',
      buyerName: 'Test Company',
      productCategory: 'Steel',
    } as any;
    
    const summary = generateAISummary(enquiry);
    expect(summary).toContain('75 MT');
    expect(summary).toContain('TMT bars');
  });
});

describe('Member Assignment Utilities', () => {
  it('should assign CM by category', () => {
    const result = assignCMByCategory('ENQ-TEST', 'Steel');
    expect(result.events.length).toBeGreaterThan(0);
    expect(result.assignedCMName).toBeTruthy();
  });

  it('should assign CX to enquiry', () => {
    const result = assignCXToEnquiry('ENQ-TEST');
    expect(result.events.length).toBe(1);
    expect(result.assignedCXName).toBeTruthy();
  });

  it('should auto-assign all team members', () => {
    const result = autoAssignTeamMembers('ENQ-TEST', 'p_bdm_1', 'Steel');
    expect(result.events.length).toBeGreaterThan(2); // BDM + CM + CX
    expect(result.assignedCMName).toBeTruthy();
    expect(result.assignedMembers.length).toBeGreaterThan(0);
  });
});

describe('Persona Utilities', () => {
  it('should get persona initials', () => {
    const persona = {
      id: 'p_test',
      displayName: 'John Doe',
    } as any;
    
    const initials = getPersonaInitials(persona);
    expect(initials).toBe('JD');
  });

  it('should return ? for null persona', () => {
    const initials = getPersonaInitials(null);
    expect(initials).toBe('?');
  });
});

describe('Performance - No Regressions', () => {
  it('should generate structured data quickly', () => {
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      const enquiry = {
        id: `ENQ-${i}`,
        buyerName: `Company ${i}`,
        productCategory: 'Steel',
      } as any;
      
      generateStructuredData(enquiry);
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(100); // Should complete in < 100ms
  });

  it('should cache persona lookups', () => {
    const start = performance.now();
    
    // First call - cache miss
    getCachedPersona('p_bdm_1');
    
    // Subsequent calls - cache hit
    for (let i = 0; i < 10000; i++) {
      getCachedPersona('p_bdm_1');
    }
    
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(10); // Should be very fast with caching
  });
});
