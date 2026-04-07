/**
 * Tests for useNavigationState hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigationState, isViewActive, getPrimarySelectionId } from '../useNavigationState';

describe('useNavigationState', () => {
  describe('initialization', () => {
    it('should initialize with no selection', () => {
      const { result } = renderHook(() => useNavigationState());
      
      expect(result.current.context.type).toBe('none');
      expect(result.current.selectedEnquiryId).toBeNull();
      expect(result.current.selectedBuyerDMId).toBeNull();
      expect(result.current.selectedSellerDMId).toBeNull();
      expect(result.current.selectedGroupId).toBeNull();
      expect(result.current.selectedThreadId).toBeNull();
      expect(result.current.threadPanelOpen).toBe(false);
      expect(result.current.showAuditTrail).toBe(false);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.currentChannel).toBe('internal');
    });
  });

  describe('selectEnquiry', () => {
    it('should select enquiry and clear other selections', () => {
      const { result } = renderHook(() => useNavigationState());
      
      // First select a group
      act(() => {
        result.current.selectGroup('group-1');
      });
      expect(result.current.selectedGroupId).toBe('group-1');
      
      // Then select an enquiry
      act(() => {
        result.current.selectEnquiry('ENQ-1234');
      });
      
      expect(result.current.context.type).toBe('enquiry');
      expect(result.current.selectedEnquiryId).toBe('ENQ-1234');
      expect(result.current.currentChannel).toBe('internal');
      expect(result.current.selectedGroupId).toBeNull();
      expect(result.current.selectedBuyerDMId).toBeNull();
      expect(result.current.selectedSellerDMId).toBeNull();
      expect(result.current.threadPanelOpen).toBe(false);
    });

    it('should select enquiry with custom channel', () => {
      const { result } = renderHook(() => useNavigationState());
      
      act(() => {
        result.current.selectEnquiry('ENQ-1234', 'buyer');
      });
      
      expect(result.current.selectedEnquiryId).toBe('ENQ-1234');
      expect(result.current.currentChannel).toBe('buyer');
      expect(result.current.context).toEqual({
        type: 'enquiry',
        enquiryId: 'ENQ-1234',
        channel: 'buyer',
      });
    });
  });

  describe('selectBuyerDM', () => {
    it('should select buyer DM and clear other selections', () => {
      const { result } = renderHook(() => useNavigationState());
      
      // First select an enquiry
      act(() => {
        result.current.selectEnquiry('ENQ-1234');
      });
      
      // Then select buyer DM
      act(() => {
        result.current.selectBuyerDM('dm-buyer-1');
      });
      
      expect(result.current.context.type).toBe('buyer-dm');
      expect(result.current.selectedBuyerDMId).toBe('dm-buyer-1');
      expect(result.current.selectedEnquiryId).toBeNull();
      expect(result.current.selectedSellerDMId).toBeNull();
      expect(result.current.selectedGroupId).toBeNull();
    });
  });

  describe('selectSellerDM', () => {
    it('should select seller DM and clear other selections', () => {
      const { result } = renderHook(() => useNavigationState());
      
      act(() => {
        result.current.selectSellerDM('seller-dm-1');
      });
      
      expect(result.current.context.type).toBe('seller-dm');
      expect(result.current.selectedSellerDMId).toBe('seller-dm-1');
      expect(result.current.selectedEnquiryId).toBeNull();
      expect(result.current.selectedBuyerDMId).toBeNull();
      expect(result.current.selectedGroupId).toBeNull();
    });
  });

  describe('selectGroup', () => {
    it('should select group and clear other selections', () => {
      const { result } = renderHook(() => useNavigationState());
      
      act(() => {
        result.current.selectGroup('group-1');
      });
      
      expect(result.current.context.type).toBe('group');
      expect(result.current.selectedGroupId).toBe('group-1');
      expect(result.current.selectedEnquiryId).toBeNull();
      expect(result.current.selectedBuyerDMId).toBeNull();
      expect(result.current.selectedSellerDMId).toBeNull();
    });
  });

  describe('selectThread', () => {
    it('should select thread in main mode', () => {
      const { result } = renderHook(() => useNavigationState());
      
      act(() => {
        result.current.selectThread('thread-1', 'group-1', 'main');
      });
      
      expect(result.current.context).toEqual({
        type: 'thread',
        threadId: 'thread-1',
        groupId: 'group-1',
        mode: 'main',
      });
      expect(result.current.selectedThreadId).toBe('thread-1');
      expect(result.current.threadPanelOpen).toBe(true);
      expect(result.current.threadViewMode).toBe('main');
      expect(result.current.selectedGroupId).toBeNull(); // Group not primary in main mode
    });

    it('should select thread in side-panel mode', () => {
      const { result } = renderHook(() => useNavigationState());
      
      act(() => {
        result.current.selectThread('thread-1', 'group-1', 'side-panel');
      });
      
      expect(result.current.selectedThreadId).toBe('thread-1');
      expect(result.current.threadPanelOpen).toBe(true);
      expect(result.current.threadViewMode).toBe('side-panel');
      expect(result.current.selectedGroupId).toBe('group-1'); // Group is primary in side-panel mode
    });

    it('should default to main mode', () => {
      const { result } = renderHook(() => useNavigationState());
      
      act(() => {
        result.current.selectThread('thread-1', 'group-1');
      });
      
      expect(result.current.threadViewMode).toBe('main');
    });
  });

  describe('openThread', () => {
    it('should open thread without clearing current selection', () => {
      const { result } = renderHook(() => useNavigationState());
      
      // Select a group first
      act(() => {
        result.current.selectGroup('group-1');
      });
      
      // Open a thread
      act(() => {
        result.current.openThread('thread-1', 'group-1', 'side-panel');
      });
      
      expect(result.current.selectedThreadId).toBe('thread-1');
      expect(result.current.threadPanelOpen).toBe(true);
      expect(result.current.selectedGroupId).toBe('group-1'); // Group still selected
    });
  });

  describe('closeThread', () => {
    it('should close thread and restore group context', () => {
      const { result } = renderHook(() => useNavigationState());
      
      // Select group with thread
      act(() => {
        result.current.selectThread('thread-1', 'group-1', 'side-panel');
      });
      
      // Close thread
      act(() => {
        result.current.closeThread();
      });
      
      expect(result.current.selectedThreadId).toBeNull();
      expect(result.current.threadPanelOpen).toBe(false);
      expect(result.current.selectedGroupId).toBe('group-1'); // Group context restored
      expect(result.current.context.type).toBe('group');
    });
  });

  describe('setChannel', () => {
    it('should change channel for enquiry', () => {
      const { result } = renderHook(() => useNavigationState());
      
      act(() => {
        result.current.selectEnquiry('ENQ-1234', 'internal');
      });
      
      act(() => {
        result.current.setChannel('buyer');
      });
      
      expect(result.current.currentChannel).toBe('buyer');
      expect(result.current.context).toEqual({
        type: 'enquiry',
        enquiryId: 'ENQ-1234',
        channel: 'buyer',
      });
    });
  });

  describe('toggleAuditTrail', () => {
    it('should toggle audit trail state', () => {
      const { result } = renderHook(() => useNavigationState());
      
      expect(result.current.showAuditTrail).toBe(false);
      
      act(() => {
        result.current.toggleAuditTrail();
      });
      
      expect(result.current.showAuditTrail).toBe(true);
      
      act(() => {
        result.current.toggleAuditTrail();
      });
      
      expect(result.current.showAuditTrail).toBe(false);
    });
  });

  describe('setSearchQuery', () => {
    it('should update search query', () => {
      const { result } = renderHook(() => useNavigationState());
      
      act(() => {
        result.current.setSearchQuery('steel');
      });
      
      expect(result.current.searchQuery).toBe('steel');
    });
  });

  describe('clearSelection', () => {
    it('should reset all state to initial values', () => {
      const { result } = renderHook(() => useNavigationState());
      
      // Set some state
      act(() => {
        result.current.selectEnquiry('ENQ-1234', 'buyer');
        result.current.setSearchQuery('test');
        result.current.toggleAuditTrail();
      });
      
      // Clear everything
      act(() => {
        result.current.clearSelection();
      });
      
      expect(result.current.context.type).toBe('none');
      expect(result.current.selectedEnquiryId).toBeNull();
      expect(result.current.currentChannel).toBe('internal');
      expect(result.current.showAuditTrail).toBe(false);
      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('mutually exclusive selections', () => {
    it('should clear all selections when selecting different view types', () => {
      const { result } = renderHook(() => useNavigationState());
      
      // Select enquiry
      act(() => {
        result.current.selectEnquiry('ENQ-1234');
      });
      expect(result.current.selectedEnquiryId).toBe('ENQ-1234');
      
      // Select buyer DM (should clear enquiry)
      act(() => {
        result.current.selectBuyerDM('dm-1');
      });
      expect(result.current.selectedEnquiryId).toBeNull();
      expect(result.current.selectedBuyerDMId).toBe('dm-1');
      
      // Select seller DM (should clear buyer DM)
      act(() => {
        result.current.selectSellerDM('dm-2');
      });
      expect(result.current.selectedBuyerDMId).toBeNull();
      expect(result.current.selectedSellerDMId).toBe('dm-2');
      
      // Select group (should clear seller DM)
      act(() => {
        result.current.selectGroup('group-1');
      });
      expect(result.current.selectedSellerDMId).toBeNull();
      expect(result.current.selectedGroupId).toBe('group-1');
      
      // Select thread (should clear group in main mode)
      act(() => {
        result.current.selectThread('thread-1', 'group-2', 'main');
      });
      expect(result.current.selectedGroupId).toBeNull();
      expect(result.current.selectedThreadId).toBe('thread-1');
    });
  });
});

describe('isViewActive utility', () => {
  it('should return true for active view type', () => {
    const { result } = renderHook(() => useNavigationState());
    
    act(() => {
      result.current.selectEnquiry('ENQ-1234');
    });
    
    expect(isViewActive(result.current, 'enquiry')).toBe(true);
    expect(isViewActive(result.current, 'group')).toBe(false);
  });
});

describe('getPrimarySelectionId utility', () => {
  it('should return enquiry ID when enquiry selected', () => {
    const { result } = renderHook(() => useNavigationState());
    
    act(() => {
      result.current.selectEnquiry('ENQ-1234');
    });
    
    expect(getPrimarySelectionId(result.current)).toBe('ENQ-1234');
  });

  it('should return buyer DM ID when buyer DM selected', () => {
    const { result } = renderHook(() => useNavigationState());
    
    act(() => {
      result.current.selectBuyerDM('dm-buyer-1');
    });
    
    expect(getPrimarySelectionId(result.current)).toBe('dm-buyer-1');
  });

  it('should return null when nothing selected', () => {
    const { result } = renderHook(() => useNavigationState());
    
    expect(getPrimarySelectionId(result.current)).toBeNull();
  });
});
