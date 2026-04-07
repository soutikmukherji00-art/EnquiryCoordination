/**
 * Tests for useAppOrchestrator hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppOrchestrator } from '../useAppOrchestrator';

describe('useAppOrchestrator', () => {
  describe('initialization', () => {
    it('should initialize with all state managers', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      // Navigation state available
      expect(result.current.navigation).toBeDefined();
      expect(result.current.navigation.context.type).toBe('none');
      
      // Modal state available
      expect(result.current.modals).toBeDefined();
      expect(result.current.modals.isGroupModalOpen).toBe(false);
      
      // Mobile state available
      expect(result.current.mobile).toBeDefined();
      expect(result.current.mobile.mobileComposer).toBeNull();
      
      // Computed properties
      expect(result.current.currentView.type).toBe('none');
      expect(result.current.isPrimaryViewActive).toBe(false);
    });
  });

  describe('navigation integration', () => {
    it('should update currentView when navigation changes', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectEnquiry('ENQ-1234', 'internal');
      });
      
      expect(result.current.currentView).toEqual({
        type: 'enquiry',
        enquiryId: 'ENQ-1234',
        channel: 'internal',
      });
      expect(result.current.isPrimaryViewActive).toBe(true);
    });

    it('should update isPrimaryViewActive when selecting views', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      expect(result.current.isPrimaryViewActive).toBe(false);
      
      act(() => {
        result.current.navigation.selectBuyerDM('dm-buyer-1');
      });
      
      expect(result.current.isPrimaryViewActive).toBe(true);
      
      act(() => {
        result.current.navigation.clearSelection();
      });
      
      expect(result.current.isPrimaryViewActive).toBe(false);
    });
  });

  describe('currentView tracking', () => {
    it('should track enquiry view', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectEnquiry('ENQ-1234', 'buyer');
      });
      
      expect(result.current.currentView.type).toBe('enquiry');
    });

    it('should track buyer DM view', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectBuyerDM('dm-buyer-1');
      });
      
      expect(result.current.currentView.type).toBe('buyer-dm');
    });

    it('should track seller DM view', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectSellerDM('dm-seller-1');
      });
      
      expect(result.current.currentView.type).toBe('seller-dm');
    });

    it('should track group view', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectGroup('group-1');
      });
      
      expect(result.current.currentView.type).toBe('group');
    });

    it('should track thread view', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectThread('thread-1', 'group-1', 'main');
      });
      
      expect(result.current.currentView.type).toBe('thread');
    });
  });

  describe('isPrimaryViewActive computation', () => {
    it('should be false when nothing selected', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      expect(result.current.isPrimaryViewActive).toBe(false);
    });

    it('should be true when enquiry selected', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectEnquiry('ENQ-1234');
      });
      
      expect(result.current.isPrimaryViewActive).toBe(true);
    });

    it('should be true when buyer DM selected', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectBuyerDM('dm-1');
      });
      
      expect(result.current.isPrimaryViewActive).toBe(true);
    });

    it('should be true when seller DM selected', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectSellerDM('dm-1');
      });
      
      expect(result.current.isPrimaryViewActive).toBe(true);
    });

    it('should be true when group selected', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectGroup('group-1');
      });
      
      expect(result.current.isPrimaryViewActive).toBe(true);
    });

    it('should be true when thread in main mode', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectThread('thread-1', 'group-1', 'main');
      });
      
      expect(result.current.isPrimaryViewActive).toBe(true);
    });
  });

  describe('state managers independence', () => {
    it('should allow navigation and modals to be used independently', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectEnquiry('ENQ-1234');
        result.current.modals.openGroupModal();
      });
      
      expect(result.current.navigation.selectedEnquiryId).toBe('ENQ-1234');
      expect(result.current.modals.isGroupModalOpen).toBe(true);
    });

    it('should allow all state managers to operate simultaneously', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectGroup('group-1');
        result.current.modals.openDeliveryWidget('ENQ-1234', 'Mumbai');
        result.current.mobile.setMobileComposer(<div>Composer</div>);
      });
      
      expect(result.current.navigation.selectedGroupId).toBe('group-1');
      expect(result.current.modals.showDeliveryWidget).toBe(true);
      expect(result.current.mobile.mobileComposer).not.toBeNull();
    });
  });

  describe('complex workflows', () => {
    it('should handle enquiry → group → thread workflow', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      // Start with enquiry
      act(() => {
        result.current.navigation.selectEnquiry('ENQ-1234');
      });
      expect(result.current.currentView.type).toBe('enquiry');
      
      // Navigate to group
      act(() => {
        result.current.navigation.selectGroup('group-1');
      });
      expect(result.current.currentView.type).toBe('group');
      expect(result.current.navigation.selectedEnquiryId).toBeNull();
      
      // Open thread
      act(() => {
        result.current.navigation.selectThread('thread-1', 'group-1', 'side-panel');
      });
      expect(result.current.currentView.type).toBe('thread');
      expect(result.current.navigation.threadPanelOpen).toBe(true);
    });

    it('should handle modal opening during navigation', () => {
      const { result } = renderHook(() => useAppOrchestrator());
      
      act(() => {
        result.current.navigation.selectEnquiry('ENQ-1234');
        result.current.modals.openThreadModal({
          id: 'msg-1',
          sender: 'Test',
          senderPersonaId: 'p-1',
          senderRole: 'BDM',
          content: 'Test',
          timestamp: new Date(),
        });
      });
      
      expect(result.current.navigation.selectedEnquiryId).toBe('ENQ-1234');
      expect(result.current.modals.showThreadModal).toBe(true);
      expect(result.current.isPrimaryViewActive).toBe(true);
    });
  });
});
