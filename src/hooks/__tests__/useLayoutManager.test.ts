/**
 * Tests for useLayoutManager hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useLayoutManager, isColumnVisible, shouldShowThreadPanel, shouldShowStructuredPanel } from '../useLayoutManager';
import type { ViewContext } from '../useNavigationState';

describe('useLayoutManager', () => {
  describe('initialization', () => {
    it('should initialize with empty state for desktop internal role', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'none' },
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.leftColumn).toBe('enquiry-list');
      expect(result.current.centerColumn).toBe('empty');
      expect(result.current.rightColumn).toBe('none');
      expect(result.current.headerContext).toBe('none');
      expect(result.current.isThreeColumn).toBe(true);
      expect(result.current.isPrimaryViewActive).toBe(false);
    });

    it('should hide left column for external roles', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'none' },
        breakpoint: 'desktop',
        isInternalRole: false,
      }));
      
      expect(result.current.leftColumn).toBe('none');
    });
  });

  describe('center column priority logic', () => {
    it('should prioritize buyer DM (Priority 1)', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'buyer-dm', dmId: 'dm-1' },
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.centerColumn).toBe('buyer-dm');
      expect(result.current.headerContext).toBe('dm');
      expect(result.current.isPrimaryViewActive).toBe(true);
    });

    it('should prioritize seller DM (Priority 2)', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'seller-dm', dmId: 'dm-1' },
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.centerColumn).toBe('seller-dm');
      expect(result.current.headerContext).toBe('dm');
    });

    it('should show thread in main mode (Priority 3)', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'thread', threadId: 'thread-1', groupId: 'group-1', mode: 'main' },
        threadPanelOpen: true,
        threadViewMode: 'main',
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.centerColumn).toBe('thread-main');
      expect(result.current.headerContext).toBe('thread');
    });

    it('should show group (Priority 4)', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'group', groupId: 'group-1' },
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.centerColumn).toBe('group');
      expect(result.current.headerContext).toBe('group');
    });

    it('should show enquiry (Priority 5)', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'enquiry', enquiryId: 'ENQ-1234', channel: 'internal' },
        showAuditTrail: false,
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.centerColumn).toBe('enquiry');
      expect(result.current.headerContext).toBe('enquiry');
    });

    it('should show audit trail when enabled', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'enquiry', enquiryId: 'ENQ-1234', channel: 'internal' },
        showAuditTrail: true,
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.centerColumn).toBe('audit');
      expect(result.current.headerContext).toBe('enquiry');
    });
  });

  describe('right column priority logic', () => {
    it('should show thread panel in side-panel mode (Priority 1)', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'group', groupId: 'group-1' },
        threadPanelOpen: true,
        threadViewMode: 'side-panel',
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.rightColumn).toBe('thread-panel');
    });

    it('should show structured panel for thread in main mode (Priority 2)', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'thread', threadId: 'thread-1', groupId: 'group-1', mode: 'main' },
        threadPanelOpen: true,
        threadViewMode: 'main',
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.centerColumn).toBe('thread-main');
      expect(result.current.rightColumn).toBe('structured');
    });

    it('should show structured panel for enquiry (Priority 3)', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'enquiry', enquiryId: 'ENQ-1234', channel: 'internal' },
        showAuditTrail: false,
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.rightColumn).toBe('structured');
    });

    it('should not show structured panel when audit trail is active', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'enquiry', enquiryId: 'ENQ-1234', channel: 'internal' },
        showAuditTrail: true,
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.rightColumn).toBe('none');
    });
  });

  describe('responsive breakpoints', () => {
    it('should set desktop flags', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'none' },
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.isThreeColumn).toBe(true);
      expect(result.current.isTwoColumn).toBe(false);
      expect(result.current.isOneColumn).toBe(false);
    });

    it('should set tablet flags', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'none' },
        breakpoint: 'tablet',
        isInternalRole: true,
      }));
      
      expect(result.current.isThreeColumn).toBe(false);
      expect(result.current.isTwoColumn).toBe(true);
      expect(result.current.isOneColumn).toBe(false);
    });

    it('should set mobile flags', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'none' },
        breakpoint: 'mobile',
        isInternalRole: true,
      }));
      
      expect(result.current.isThreeColumn).toBe(false);
      expect(result.current.isTwoColumn).toBe(false);
      expect(result.current.isOneColumn).toBe(true);
    });
  });

  describe('complex scenarios', () => {
    it('should handle thread side-panel replacing structured panel', () => {
      const { result, rerender } = renderHook(
        ({ threadOpen }: { threadOpen: boolean }) => useLayoutManager({
          viewContext: { type: 'enquiry', enquiryId: 'ENQ-1234', channel: 'internal' },
          threadPanelOpen: threadOpen,
          threadViewMode: 'side-panel',
          breakpoint: 'desktop',
          isInternalRole: true,
        }),
        { initialProps: { threadOpen: false } }
      );
      
      // Initially show structured panel
      expect(result.current.rightColumn).toBe('structured');
      
      // Open thread panel - should replace structured
      rerender({ threadOpen: true });
      expect(result.current.rightColumn).toBe('thread-panel');
    });

    it('should handle thread main mode with structured panel', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'thread', threadId: 'thread-1', groupId: 'group-1', mode: 'main' },
        threadPanelOpen: true,
        threadViewMode: 'main',
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      // Thread in center, structured in right
      expect(result.current.centerColumn).toBe('thread-main');
      expect(result.current.rightColumn).toBe('structured');
    });
  });

  describe('isPrimaryViewActive', () => {
    it('should be false for empty center', () => {
      const { result } = renderHook(() => useLayoutManager({
        viewContext: { type: 'none' },
        breakpoint: 'desktop',
        isInternalRole: true,
      }));
      
      expect(result.current.isPrimaryViewActive).toBe(false);
    });

    it('should be true for any non-empty center content', () => {
      const scenarios = [
        { type: 'buyer-dm' as const, dmId: 'dm-1' },
        { type: 'seller-dm' as const, dmId: 'dm-1' },
        { type: 'group' as const, groupId: 'group-1' },
        { type: 'enquiry' as const, enquiryId: 'ENQ-1234', channel: 'internal' },
      ];
      
      scenarios.forEach(viewContext => {
        const { result } = renderHook(() => useLayoutManager({
          viewContext,
          breakpoint: 'desktop',
          isInternalRole: true,
        }));
        
        expect(result.current.isPrimaryViewActive).toBe(true);
      });
    });
  });
});

describe('isColumnVisible utility', () => {
  it('should return false for "none"', () => {
    expect(isColumnVisible('none')).toBe(false);
  });

  it('should return false for "empty"', () => {
    expect(isColumnVisible('empty')).toBe(false);
  });

  it('should return true for any real content', () => {
    expect(isColumnVisible('enquiry-list')).toBe(true);
    expect(isColumnVisible('enquiry')).toBe(true);
    expect(isColumnVisible('buyer-dm')).toBe(true);
    expect(isColumnVisible('thread-panel')).toBe(true);
    expect(isColumnVisible('structured')).toBe(true);
  });
});

describe('shouldShowThreadPanel utility', () => {
  it('should return false when thread panel not open', () => {
    const result = shouldShowThreadPanel(
      false,
      'side-panel',
      { type: 'group', groupId: 'group-1' }
    );
    expect(result).toBe(false);
  });

  it('should return true for side-panel mode with group', () => {
    const result = shouldShowThreadPanel(
      true,
      'side-panel',
      { type: 'group', groupId: 'group-1' }
    );
    expect(result).toBe(true);
  });

  it('should return true for side-panel mode with thread', () => {
    const result = shouldShowThreadPanel(
      true,
      'side-panel',
      { type: 'thread', threadId: 'thread-1', groupId: 'group-1', mode: 'side-panel' }
    );
    expect(result).toBe(true);
  });

  it('should return true for main mode', () => {
    const result = shouldShowThreadPanel(
      true,
      'main',
      { type: 'thread', threadId: 'thread-1', groupId: 'group-1', mode: 'main' }
    );
    expect(result).toBe(true);
  });

  it('should return false for side-panel mode without group/thread', () => {
    const result = shouldShowThreadPanel(
      true,
      'side-panel',
      { type: 'enquiry', enquiryId: 'ENQ-1234', channel: 'internal' }
    );
    expect(result).toBe(false);
  });
});

describe('shouldShowStructuredPanel utility', () => {
  it('should return false when audit trail is shown', () => {
    const result = shouldShowStructuredPanel(
      { type: 'enquiry', enquiryId: 'ENQ-1234', channel: 'internal' },
      true, // showAuditTrail
      false,
      'side-panel'
    );
    expect(result).toBe(false);
  });

  it('should return false when thread panel is in side-panel mode', () => {
    const result = shouldShowStructuredPanel(
      { type: 'enquiry', enquiryId: 'ENQ-1234', channel: 'internal' },
      false,
      true, // threadPanelOpen
      'side-panel'
    );
    expect(result).toBe(false);
  });

  it('should return true for enquiry view', () => {
    const result = shouldShowStructuredPanel(
      { type: 'enquiry', enquiryId: 'ENQ-1234', channel: 'internal' },
      false,
      false,
      'side-panel'
    );
    expect(result).toBe(true);
  });

  it('should return true for thread main mode', () => {
    const result = shouldShowStructuredPanel(
      { type: 'thread', threadId: 'thread-1', groupId: 'group-1', mode: 'main' },
      false,
      true,
      'main'
    );
    expect(result).toBe(true);
  });

  it('should return false for other view types', () => {
    const result = shouldShowStructuredPanel(
      { type: 'group', groupId: 'group-1' },
      false,
      false,
      'side-panel'
    );
    expect(result).toBe(false);
  });
});
